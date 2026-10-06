// Builds the hidden test program for "function" exercises.
// Each test case becomes one `case` of a switch; the runner calls ./a.out <index>.
import type { CodeExercise, TestCase } from '../content/types';

export const HARNESS_HELPERS = String.raw`#include <unistd.h>
#include <stdlib.h>

void tst_puts(const char *s)
{
    int n = 0;

    while (s[n])
        n++;
    write(1, s, n);
}

void tst_int(long v)
{
    char b[24];
    int i = 23;
    unsigned long u = v < 0 ? -(unsigned long)v : (unsigned long)v;

    b[i] = '\n';
    do {
        b[--i] = '0' + u % 10;
        u /= 10;
    } while (u);
    if (v < 0)
        b[--i] = '-';
    write(1, b + i, 24 - i);
}

void tst_str(const char *s)
{
    char hex[] = "0123456789abcdef";

    if (!s) {
        tst_puts("(null)\n");
        return;
    }
    write(1, "\"", 1);
    for (; *s; s++) {
        unsigned char c = *s;
        if (c == '\n')
            tst_puts("\\n");
        else if (c == '\t')
            tst_puts("\\t");
        else if (c == '"' || c == '\\') {
            write(1, "\\", 1);
            write(1, s, 1);
        } else if (c < 32 || c >= 127) {
            write(1, "\\x", 2);
            write(1, &hex[c / 16], 1);
            write(1, &hex[c % 16], 1);
        } else
            write(1, s, 1);
    }
    write(1, "\"\n", 2);
}

void tst_label(const char *s)
{
    tst_puts(s);
    tst_puts(": ");
}

void tst_nl(void)
{
    write(1, "\n", 1);
}

void tst_sign(int v)
{
    tst_puts(v < 0 ? "negatif\n" : v > 0 ? "positif\n" : "zero\n");
}

int tst_atoi(const char *s)
{
    int n = 0;

    while (*s >= '0' && *s <= '9')
        n = n * 10 + *s++ - '0';
    return n;
}
`;

export const PUTCHAR_IMPL = String.raw`#include <unistd.h>

void my_putchar(char c)
{
    write(1, &c, 1);
}
`;

export function buildHarness(ex: CodeExercise): string {
  const cases = ex.tests
    .map((t, i) => `    case ${i}: {\n${(t.code ?? '').split('\n').map((l) => '        ' + l).join('\n')}\n        break;\n    }`)
    .join('\n');
  return `${HARNESS_HELPERS}
${ex.support ?? ''}
${ex.prototype ? ex.prototype.replace(/;?\s*$/, ';') : ''}

int main(int ac, char **av)
{
    switch (ac > 1 ? tst_atoi(av[1]) : -1) {
${cases}
    default:
        break;
    }
    return 0;
}
`;
}

/** Source files compiled for an exercise: student file + hidden files. */
export function exerciseSources(ex: CodeExercise, student: string): Record<string, string> {
  const files: Record<string, string> = { [ex.file]: student };
  if (ex.header) files[ex.header.name] = ex.header.code;
  if (ex.kind === 'function') files['zz_test_main.c'] = buildHarness(ex);
  else if (ex.support) files['zz_support.c'] = ex.support;
  if (ex.providesPutchar) files['zz_my_putchar.c'] = PUTCHAR_IMPL;
  return files;
}

export function testRequest(ex: CodeExercise, t: TestCase, index: number) {
  if (ex.kind === 'function') return { args: [String(index)] };
  return { args: t.args ?? [], stdin: t.stdin, files: t.files, denied: t.denied };
}

/** Helpers available to "predict the output" quiz programs (declared in the shown code). */
export const QUIZ_PRELUDE = String.raw`#include <unistd.h>

void my_putchar(char c)
{
    write(1, &c, 1);
}

void my_putstr(char const *s)
{
    while (*s)
        my_putchar(*s++);
}

void my_put_nbr(int nb)
{
    long long n = nb;

    if (n < 0) {
        my_putchar('-');
        n = -n;
    }
    if (n >= 10)
        my_put_nbr(n / 10);
    my_putchar(n % 10 + '0');
}
`;
