// Simple static checks of the student's code against the subject's rules.
// This is a text scan, not a compiler: it is shown as "vérification simple" in the UI.

export interface StaticIssue {
  kind: 'forbidden' | 'array' | 'redefined' | 'main';
  message: string;
}

const KNOWN_LIBC = [
  'printf', 'fprintf', 'dprintf', 'sprintf', 'snprintf', 'puts', 'putchar', 'fputs', 'fputc', 'putc', 'scanf', 'getchar',
  'strlen', 'strcpy', 'strncpy', 'strcat', 'strncat', 'strcmp', 'strncmp', 'strdup', 'strndup', 'strstr', 'strchr',
  'strrchr', 'memcpy', 'memset', 'memmove', 'memcmp', 'atoi', 'atol', 'strtol', 'malloc', 'calloc', 'realloc', 'free',
  'write', 'read', 'open', 'close', 'exit', 'abort', 'isalpha', 'isdigit', 'isalnum', 'isupper', 'islower', 'isprint',
  'isspace', 'toupper', 'tolower', 'perror', 'strerror', 'qsort', 'abs', 'pow', 'sqrt', 'fopen', 'fclose', 'fread',
  'fwrite', 'fgets', 'getline', 'system', 'bzero',
];

/** Removes comments, string literals and char literals (replaced by spaces). */
export function stripCode(code: string, keepStrings = false): string {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    const n = code[i + 1];
    if (c === '/' && n === '/') {
      while (i < code.length && code[i] !== '\n') i++;
    } else if (c === '/' && n === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        if (code[i] === '\n') out += '\n';
        i++;
      }
      i += 2;
    } else if (c === '"' || c === '\'') {
      const q = c;
      let lit = c;
      i++;
      while (i < code.length && code[i] !== q && code[i] !== '\n') {
        if (code[i] === '\\') {
          lit += code[i];
          i++;
        }
        lit += code[i] ?? '';
        i++;
      }
      lit += q;
      i++;
      out += keepStrings && q === '"' ? lit : q === '"' ? '""' : "' '";
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

export function definedFunctions(code: string): Set<string> {
  const s = stripCode(code);
  const out = new Set<string>();
  const re = /\b([A-Za-z_]\w*)\s*\(([^;{}()]|\([^()]*\))*\)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (!['if', 'while', 'for', 'switch', 'return', 'sizeof'].includes(m[1])) out.add(m[1]);
  }
  return out;
}

export function checkCode(
  code: string,
  opts: { allowed: string[]; noArrays?: boolean; providesPutchar?: boolean; kind?: 'function' | 'program' },
): StaticIssue[] {
  const issues: StaticIssue[] = [];
  const s = stripCode(code);
  const defined = definedFunctions(code);
  const seen = new Set<string>();
  for (const name of KNOWN_LIBC) {
    if (opts.allowed.includes(name) || defined.has(name)) continue;
    const re = new RegExp(`(^|[^\\w.>])${name}\\s*\\(`);
    if (re.test(s) && !seen.has(name)) {
      seen.add(name);
      issues.push({
        kind: 'forbidden',
        message: `Fonction non autorisée par le sujet : ${name}(). Autorisé ici : ${opts.allowed.length ? opts.allowed.join(', ') : 'aucune fonction de la libC'}.`,
      });
    }
  }
  if (opts.noArrays) {
    if (s.includes('[')) issues.push({ kind: 'array', message: 'Les tableaux sont interdits dans ce sujet (règle du Day 03) : un « [ » a été trouvé.' });
    if (s.includes('""')) issues.push({ kind: 'array', message: 'Les chaînes sont interdites dans ce sujet (règle du Day 03) : utilise my_putchar(\'x\') caractère par caractère.' });
  }
  if (opts.providesPutchar && defined.has('my_putchar')) {
    issues.push({ kind: 'redefined', message: 'my_putchar est fournie par la correction : ne la réécris pas dans ton fichier (sinon « multiple definition »).' });
  }
  if (opts.kind === 'function' && defined.has('main')) {
    issues.push({ kind: 'main', message: 'Ce sujet demande une fonction, pas un programme : retire ta fonction main (la correction ajoute la sienne).' });
  }
  return issues;
}
