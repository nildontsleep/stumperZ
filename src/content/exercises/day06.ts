import type { CodeExercise } from '../types';

const D6 = (section: string, page: number) => ({ day: 'd06' as const, section, page });

function isFn(id: string, name: string, task: string, page: number, what: string, cond: string, condText: string, tests: [string, string][]): CodeExercise {
  return {
    id,
    title: name,
    skills: ['strfuncs', 'chars'],
    level: 1,
    kind: 'function',
    source: D6(task, page),
    relation: 'reproduces',
    minutes: 8,
    statement: [
      { t: 'p', text: `Renvoie 1 si la chaîne ne contient que ${what}, 0 sinon. Renvoie 1 pour la chaîne vide.` },
    ],
    file: `${name}.c`,
    prototype: `int ${name}(char const *str);`,
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: `int ${name}(char const *str)\n{\n    return 0;\n}\n`,
    tests: [
      ...tests.map(([label, arg]) => ({ name: label, code: `tst_int(${name}(${arg}));` })),
      { name: 'chaîne vide', code: `tst_int(${name}(""));`, kind: 'empty' as const },
    ],
    hints: [
      `Il suffit d'UN caractère qui n'est pas ${what} pour répondre 0. Si on arrive au bout sans en trouver, on répond 1.`,
      `Teste chaque caractère : ${condText}. Dès qu'un caractère ne vérifie pas la condition → return 0.`,
      '1) i = 0 ; 2) tant que str[i] : si str[i] ne vérifie pas la condition → return 0 ; i++ ; 3) return 1 (cela couvre aussi la chaîne vide).',
      `int i = 0;\n\nwhile (str[i] != '\\0') {\n    if (!(${cond}))\n        return 0;\n    i++;\n}\nreturn 1;`,
    ],
    solution: `int ${name}(char const *str)
{
    int i = 0;

    while (str[i] != '\\0') {
        if (!(${cond}))
            return 0;       /* un seul intrus suffit */
        i++;
    }
    return 1;               /* aucun intrus (ou chaîne vide) */
}
`,
    solutionNotes: [{ t: 'p', text: 'Schéma « chercher un contre-exemple » : on renvoie 0 dès qu\'on en trouve un, et 1 seulement après avoir tout vérifié.' }],
    pitfalls: ['Renvoyer 1 dès le premier caractère valide (on n\'a pas vérifié les autres).', 'Oublier que la chaîne vide renvoie 1.'],
    prereqs: ['strings', 'chars'],
  };
}

export const DAY06: CodeExercise[] = [
  {
    id: 'ex_strcpy',
    title: 'my_strcpy',
    skills: ['strfuncs'],
    level: 1,
    kind: 'function',
    source: D6('Task 01 - my_strcpy', 2),
    relation: 'reproduces',
    minutes: 8,
    statement: [{ t: 'p', text: 'Copie la chaîne `src` dans `dest` (qui a déjà assez de place), `\\0` compris. Renvoie `dest`.' }],
    file: 'my_strcpy.c',
    prototype: 'char *my_strcpy(char *dest, char const *src);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'char *my_strcpy(char *dest, char const *src)\n{\n    return dest;\n}\n',
    tests: [
      { name: '"Hello"', code: 'char d[20] = "XXXXXXXXXXXXXXXXXXX";\ntst_str(my_strcpy(d, "Hello"));' },
      { name: 'le \\0 est copié', code: 'char d[10] = "XXXXXXXXX";\nmy_strcpy(d, "ab");\ntst_str(d);\ntst_int(d[3] == \'X\');', kind: 'limit' },
      { name: 'source vide', code: 'char d[5] = "XXXX";\ntst_str(my_strcpy(d, ""));', kind: 'empty' },
      { name: 'renvoie dest', code: 'char d[5];\ntst_int(my_strcpy(d, "abc") == d);' },
    ],
    hints: [
      'Copier caractère par caractère, puis écrire le \\0 final.',
      'Même boucle que my_strlen, mais à chaque tour on écrit dest[i] = src[i]. Après la boucle, src[i] est \'\\0\' : il faut aussi l\'écrire.',
      '1) i = 0 ; 2) tant que src[i] : dest[i] = src[i] ; i++ ; 3) dest[i] = \'\\0\' ; 4) return dest.',
      'int i = 0;\n\nwhile (src[i] != \'\\0\') {\n    dest[i] = src[i];\n    i++;\n}\ndest[i] = \'\\0\';\nreturn dest;',
    ],
    solution: String.raw`char *my_strcpy(char *dest, char const *src)
{
    int i = 0;

    while (src[i] != '\0') {
        dest[i] = src[i];
        i++;
    }
    dest[i] = '\0';     /* sans lui, dest n'a pas de fin */
    return dest;
}
`,
    solutionNotes: [{ t: 'p', text: 'Le test « le \\0 est copié » vérifie aussi qu\'on n\'écrit rien au-delà : d[3] doit rester \'X\'.' }],
    pitfalls: ['Oublier le \\0 final.'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_strncpy',
    title: 'my_strncpy',
    skills: ['strfuncs'],
    level: 2,
    kind: 'function',
    source: D6('Task 02 - my_strncpy', 2),
    relation: 'reproduces',
    minutes: 12,
    statement: [
      { t: 'p', text: 'Copie au plus `n` caractères de `src` dans `dest`. Renvoie `dest`.' },
      { t: 'note', kind: 'pdf', text: 'Règle du PDF : ajouter un \\0 si n est strictement plus grand que la longueur de src ; ne pas en ajouter si n est plus petit (dest n\'est pas censé contenir plus de n octets).' },
    ],
    file: 'my_strncpy.c',
    prototype: 'char *my_strncpy(char *dest, char const *src, int n);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'char *my_strncpy(char *dest, char const *src, int n)\n{\n    return dest;\n}\n',
    tests: [
      { name: 'n < longueur : pas de \\0', code: 'char d[10] = "XXXXXXXXX";\nmy_strncpy(d, "HelloWorld", 5);\ntst_str(d);', kind: 'limit' },
      { name: 'n > longueur : \\0 ajouté', code: 'char d[10] = "XXXXXXXXX";\nmy_strncpy(d, "abc", 6);\ntst_str(d);' },
      { name: 'n == longueur', code: 'char d[10] = "XXXXXXXXX";\nmy_strncpy(d, "abc", 3);\ntst_str(d);', kind: 'limit' },
      { name: 'n = 0', code: 'char d[5] = "XXXX";\nmy_strncpy(d, "abc", 0);\ntst_str(d);', kind: 'empty' },
      { name: 'renvoie dest', code: 'char d[5];\ntst_int(my_strncpy(d, "ab", 3) == d);' },
    ],
    hints: [
      'Copier tant qu\'il reste des caractères ET qu\'on n\'a pas atteint n.',
      'Deux conditions dans la boucle : i < n && src[i] != \'\\0\'. Après la boucle, si i < n, c\'est que src était plus court : on écrit \\0.',
      '1) i = 0 ; 2) tant que i < n et src[i] : copier, i++ ; 3) si i < n : dest[i] = \'\\0\' ; 4) return dest.',
      'int i = 0;\n\nwhile (i < n && src[i] != \'\\0\') {\n    dest[i] = src[i];\n    i++;\n}\nif (i < n)\n    dest[i] = \'\\0\';\nreturn dest;',
    ],
    solution: String.raw`char *my_strncpy(char *dest, char const *src, int n)
{
    int i = 0;

    while (i < n && src[i] != '\0') {   /* deux raisons de s'arrêter */
        dest[i] = src[i];
        i++;
    }
    if (i < n)
        dest[i] = '\0';     /* src plus court que n : on termine la chaîne */
    return dest;
}
`,
    solutionNotes: [{ t: 'p', text: 'La vraie strncpy complète même avec des \\0 jusqu\'à n. Pour ce sujet, un seul \\0 suffit à respecter la règle du PDF.' }],
    pitfalls: ['Toujours ajouter un \\0, même quand n < longueur (écrit au-delà des n octets).'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_revstr',
    title: 'my_revstr',
    skills: ['strfuncs'],
    level: 2,
    kind: 'function',
    source: D6('Task 03 - my_revstr', 3),
    relation: 'reproduces',
    minutes: 10,
    statement: [{ t: 'p', text: 'Inverse la chaîne (sur place) et renvoie `str`. C\'est le même travail que my_evil_str du Day 04 : essaie de le refaire sans regarder.' }],
    file: 'my_revstr.c',
    prototype: 'char *my_revstr(char *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'char *my_revstr(char *str)\n{\n    return str;\n}\n',
    tests: [
      { name: '"Bonjour"', code: 'char s[] = "Bonjour";\ntst_str(my_revstr(s));' },
      { name: 'longueur paire', code: 'char s[] = "1234";\ntst_str(my_revstr(s));' },
      { name: 'vide', code: 'char s[] = "";\ntst_str(my_revstr(s));', kind: 'empty' },
      { name: 'un caractère', code: 'char s[] = "z";\ntst_str(my_revstr(s));', kind: 'limit' },
      { name: 'renvoie str', code: 'char s[] = "ab";\ntst_int(my_revstr(s) == s);' },
    ],
    hints: [
      'Échanger les extrémités et se rapprocher du milieu.',
      'Deux indices : i au début, j sur le dernier caractère (longueur - 1).',
      '1) j = longueur - 1 ; 2) tant que i < j : échanger str[i] et str[j] ; i++ ; j-- ; 3) return str.',
      'int i = 0;\nint j = 0;\nchar c;\n\nwhile (str[j])\n    j++;\nj--;\nwhile (i < j) {\n    /* échange */\n}\nreturn str;',
    ],
    solution: String.raw`char *my_revstr(char *str)
{
    int i = 0;
    int j = 0;
    char c;

    while (str[j] != '\0')
        j++;
    j--;
    while (i < j) {
        c = str[i];
        str[i] = str[j];
        str[j] = c;
        i++;
        j--;
    }
    return str;
}
`,
    solutionNotes: [],
    pitfalls: ['Inclure le \\0 dans l\'échange.', 'Boucler sur toute la longueur.'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_strcmp',
    title: 'my_strcmp',
    skills: ['strfuncs'],
    level: 2,
    kind: 'function',
    source: D6('Task 06 - my_strcmp', 4),
    relation: 'reproduces',
    minutes: 12,
    statement: [
      { t: 'p', text: 'Reproduis `strcmp` : renvoie un nombre négatif si s1 vient avant s2 dans l\'ordre ASCII, 0 si elles sont égales, positif sinon.' },
      { t: 'note', kind: 'info', text: 'Les tests vérifient seulement le signe (négatif / zéro / positif), comme le garantit man 3 strcmp.' },
    ],
    file: 'my_strcmp.c',
    prototype: 'int my_strcmp(char const *s1, char const *s2);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_strcmp(char const *s1, char const *s2)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'égales', code: 'tst_sign(my_strcmp("abc", "abc"));' },
      { name: '"abc" < "abd"', code: 'tst_sign(my_strcmp("abc", "abd"));' },
      { name: '"b" > "abc"', code: 'tst_sign(my_strcmp("b", "abc"));' },
      { name: 'préfixe "ab" < "abc"', code: 'tst_sign(my_strcmp("ab", "abc"));', kind: 'limit' },
      { name: '"abc" > "ab"', code: 'tst_sign(my_strcmp("abc", "ab"));', kind: 'limit' },
      { name: 'vides', code: 'tst_sign(my_strcmp("", ""));', kind: 'empty' },
      { name: 'majuscule < minuscule', code: 'tst_sign(my_strcmp("Z", "a"));', kind: 'limit' },
    ],
    hints: [
      'Avancer tant que les deux chaînes ont le même caractère. Au premier caractère différent (ou à la fin), la différence décide.',
      'Condition d\'avance : s1[i] == s2[i] et s1[i] != \'\\0\'. Ensuite on renvoie s1[i] - s2[i] : si une chaîne est finie, son \\0 vaut 0, plus petit que tout caractère.',
      '1) i = 0 ; 2) tant que s1[i] && s1[i] == s2[i] : i++ ; 3) return s1[i] - s2[i].',
      'int i = 0;\n\nwhile (s1[i] != \'\\0\' && s1[i] == s2[i])\n    i++;\nreturn s1[i] - s2[i];',
    ],
    solution: String.raw`int my_strcmp(char const *s1, char const *s2)
{
    int i = 0;

    while (s1[i] != '\0' && s1[i] == s2[i])
        i++;
    /* premier caractère différent (ou les deux \0) : la différence donne le signe */
    return (unsigned char)s1[i] - (unsigned char)s2[i];
}
`,
    solutionNotes: [{ t: 'p', text: 'Le cast en unsigned char fait comme la vraie strcmp pour les caractères au-delà de 127. Pour des chaînes ASCII classiques, `s1[i] - s2[i]` suffit.' }],
    pitfalls: ['Renvoyer 1/-1 seulement en comparant les longueurs.', 'Oublier le cas où une chaîne est un préfixe de l\'autre.'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_strncmp',
    title: 'my_strncmp',
    skills: ['strfuncs'],
    level: 2,
    kind: 'function',
    source: D6('Task 07 - my_strncmp', 4),
    relation: 'reproduces',
    minutes: 10,
    statement: [{ t: 'p', text: 'Comme my_strcmp, mais compare au plus `n` caractères. Mêmes valeurs de retour que man 3 strcmp (les tests vérifient le signe).' }],
    file: 'my_strncmp.c',
    prototype: 'int my_strncmp(char const *s1, char const *s2, int n);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_strncmp(char const *s1, char const *s2, int n)\n{\n    return 0;\n}\n',
    tests: [
      { name: '"abcdef" vs "abcxyz", n=3', code: 'tst_sign(my_strncmp("abcdef", "abcxyz", 3));' },
      { name: 'même chose, n=4', code: 'tst_sign(my_strncmp("abcdef", "abcxyz", 4));' },
      { name: 'n = 0', code: 'tst_sign(my_strncmp("a", "b", 0));', kind: 'limit' },
      { name: 'n plus grand que les chaînes', code: 'tst_sign(my_strncmp("ab", "ab", 50));', kind: 'limit' },
      { name: 'préfixe', code: 'tst_sign(my_strncmp("ab", "abc", 3));', kind: 'limit' },
    ],
    hints: [
      'C\'est strcmp avec une limite : on s\'arrête aussi quand on a comparé n caractères.',
      'Si n vaut 0, il n\'y a rien à comparer : égalité → 0.',
      '1) si n <= 0 → 0 ; 2) i = 0 ; tant que i < n - 1 et s1[i] && s1[i] == s2[i] : i++ ; 3) return s1[i] - s2[i].',
      'int i = 0;\n\nif (n <= 0)\n    return 0;\nwhile (i < n - 1 && s1[i] != \'\\0\' && s1[i] == s2[i])\n    i++;\nreturn s1[i] - s2[i];',
    ],
    solution: String.raw`int my_strncmp(char const *s1, char const *s2, int n)
{
    int i = 0;

    if (n <= 0)
        return 0;                   /* rien à comparer */
    while (i < n - 1 && s1[i] != '\0' && s1[i] == s2[i])
        i++;                        /* on s'arrête au plus sur le n-ième caractère */
    return (unsigned char)s1[i] - (unsigned char)s2[i];
}
`,
    solutionNotes: [{ t: 'p', text: 'my_strncmp est l\'outil idéal pour my_strstr : « est-ce que to_find commence à cette position ? » = my_strncmp(str + i, to_find, longueur de to_find) == 0.' }],
    pitfalls: ['Comparer n + 1 caractères.', 'Lire s1[0] alors que n vaut 0 (pas grave ici mais inutile).'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_strstr',
    title: 'my_strstr',
    skills: ['strfuncs'],
    level: 3,
    kind: 'function',
    source: D6('Task 05 - my_strstr', 4),
    relation: 'reproduces',
    minutes: 15,
    statement: [
      { t: 'p', text: 'Reproduis `strstr` : renvoie l\'adresse de la première occurrence de `to_find` dans `str`, ou NULL si elle n\'existe pas. Si `to_find` est vide, renvoie `str`.' },
      { t: 'note', kind: 'pdf', text: 'Le PDF conseille de regarder my_strcmp et my_strncmp.' },
    ],
    file: 'my_strstr.c',
    prototype: 'char *my_strstr(char *str, char const *to_find);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: '#include <stddef.h>\n\nchar *my_strstr(char *str, char const *to_find)\n{\n    return NULL;\n}\n',
    tests: [
      { name: 'trouvé au milieu', code: 'char s[] = "Hello World";\ntst_str(my_strstr(s, "World"));' },
      { name: 'trouvé au début', code: 'char s[] = "abcabc";\ntst_str(my_strstr(s, "abc"));\ntst_int(my_strstr(s, "abc") == s);' },
      { name: 'absent', code: 'char s[] = "abcdef";\ntst_str(my_strstr(s, "xyz"));', kind: 'error' },
      { name: 'début partiel trompeur', code: 'char s[] = "aaab";\ntst_str(my_strstr(s, "aab"));', kind: 'limit' },
      { name: 'to_find plus long', code: 'char s[] = "ab";\ntst_str(my_strstr(s, "abc"));', kind: 'limit' },
      { name: 'to_find vide', code: 'char s[] = "abc";\ntst_int(my_strstr(s, "") == s);', kind: 'empty' },
      { name: 'str vide', code: 'char s[] = "";\ntst_str(my_strstr(s, "a"));', kind: 'empty' },
    ],
    hints: [
      'Pour chaque position i de str, se demander : « est-ce que to_find commence ici ? ». La première position qui marche est la réponse.',
      'Comparer to_find avec str + i sur la longueur de to_find (my_strncmp, ou une petite boucle). Renvoyer &str[i] (= str + i).',
      '1) si to_find[0] == \'\\0\' → return str ; 2) pour i de 0 tant que str[i] : j = 0 ; tant que to_find[j] && str[i + j] == to_find[j] : j++ ; si to_find[j] == \'\\0\' → return str + i ; 3) return NULL.',
      'int i = 0;\nint j;\n\nif (to_find[0] == \'\\0\')\n    return str;\nwhile (str[i] != \'\\0\') {\n    j = 0;\n    while (to_find[j] != \'\\0\' && str[i + j] == to_find[j])\n        j++;\n    if (to_find[j] == \'\\0\')\n        return /* ? */;\n    i++;\n}\nreturn NULL;',
    ],
    solution: String.raw`#include <stddef.h>

char *my_strstr(char *str, char const *to_find)
{
    int i = 0;
    int j;

    if (to_find[0] == '\0')
        return str;
    while (str[i] != '\0') {
        j = 0;
        /* str[i + j] vaut '\0' en fin de str : la comparaison échoue proprement */
        while (to_find[j] != '\0' && str[i + j] == to_find[j])
            j++;
        if (to_find[j] == '\0')
            return &str[i];     /* tout to_find a correspondu */
        i++;
    }
    return NULL;
}
`,
    solutionNotes: [{ t: 'p', text: 'NULL est défini dans <stddef.h> (et d\'autres headers). Une chaîne à afficher et un pointeur NULL sont deux choses différentes : on ne doit jamais faire my_putstr(NULL).' }],
    pitfalls: ['Avancer i quand une comparaison échoue en plein milieu (rate "aab" dans "aaab").', 'Renvoyer to_find au lieu de la position dans str.'],
    prereqs: ['strfuncs'],
  },
  {
    id: 'ex_strupcase',
    title: 'my_strupcase',
    skills: ['strfuncs', 'chars'],
    level: 1,
    kind: 'function',
    source: D6('Task 08 - my_strupcase', 4),
    relation: 'reproduces',
    minutes: 8,
    statement: [{ t: 'p', text: 'Mets toutes les lettres de la chaîne en majuscules (les autres caractères ne changent pas). Renvoie `str`.' }],
    file: 'my_strupcase.c',
    prototype: 'char *my_strupcase(char *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'char *my_strupcase(char *str)\n{\n    return str;\n}\n',
    tests: [
      { name: '"hello"', code: 'char s[] = "hello";\ntst_str(my_strupcase(s));' },
      { name: 'mélange', code: 'char s[] = "Hey, 42 You!";\ntst_str(my_strupcase(s));' },
      { name: 'bornes a et z, [ et {', code: 'char s[] = "az{`@[";\ntst_str(my_strupcase(s));', kind: 'limit' },
      { name: 'vide', code: 'char s[] = "";\ntst_str(my_strupcase(s));', kind: 'empty' },
    ],
    hints: [
      'Seules les minuscules a…z changent.',
      'En ASCII, \'a\' - \'A\' = 32 : une minuscule devient majuscule en retirant 32 (ou en faisant c - \'a\' + \'A\').',
      '1) parcourir ; 2) si str[i] >= \'a\' et <= \'z\' : str[i] = str[i] - \'a\' + \'A\' ; 3) return str.',
      'int i = 0;\n\nwhile (str[i]) {\n    if (str[i] >= \'a\' && str[i] <= \'z\')\n        str[i] = str[i] - \'a\' + \'A\';\n    i++;\n}\nreturn str;',
    ],
    solution: String.raw`char *my_strupcase(char *str)
{
    int i = 0;

    while (str[i] != '\0') {
        if (str[i] >= 'a' && str[i] <= 'z')
            str[i] = str[i] - 'a' + 'A';    /* même décalage pour toutes les lettres */
        i++;
    }
    return str;
}
`,
    solutionNotes: [],
    pitfalls: ['Soustraire 32 à tous les caractères (les chiffres et la ponctuation deviennent n\'importe quoi).'],
    prereqs: ['chars', 'strings'],
  },
  {
    id: 'ex_strlowcase',
    title: 'my_strlowcase',
    skills: ['strfuncs', 'chars'],
    level: 1,
    kind: 'function',
    source: D6('Task 09 - my_strlowcase', 5),
    relation: 'reproduces',
    minutes: 6,
    statement: [{ t: 'p', text: 'Mets toutes les lettres en minuscules. Renvoie `str`.' }],
    file: 'my_strlowcase.c',
    prototype: 'char *my_strlowcase(char *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'char *my_strlowcase(char *str)\n{\n    return str;\n}\n',
    tests: [
      { name: '"HELLO"', code: 'char s[] = "HELLO";\ntst_str(my_strlowcase(s));' },
      { name: 'mélange', code: 'char s[] = "EpiTECH 2042 !";\ntst_str(my_strlowcase(s));' },
      { name: 'bornes', code: 'char s[] = "AZ@[";\ntst_str(my_strlowcase(s));', kind: 'limit' },
      { name: 'vide', code: 'char s[] = "";\ntst_str(my_strlowcase(s));', kind: 'empty' },
    ],
    hints: [
      'Seules les majuscules A…Z changent.',
      'Ajouter \'a\' - \'A\' (32) aux majuscules.',
      'Si str[i] entre \'A\' et \'Z\' : str[i] = str[i] - \'A\' + \'a\'.',
      'if (str[i] >= \'A\' && str[i] <= \'Z\')\n    str[i] = str[i] - \'A\' + \'a\';',
    ],
    solution: String.raw`char *my_strlowcase(char *str)
{
    int i = 0;

    while (str[i] != '\0') {
        if (str[i] >= 'A' && str[i] <= 'Z')
            str[i] = str[i] - 'A' + 'a';
        i++;
    }
    return str;
}
`,
    solutionNotes: [],
    pitfalls: ['Inverser les bornes (\'Z\' et \'A\').'],
    prereqs: ['chars', 'strings'],
  },
  {
    id: 'ex_strcapitalize',
    title: 'my_strcapitalize',
    skills: ['strfuncs', 'chars'],
    level: 3,
    kind: 'function',
    source: D6('Task 10 - my_strcapitalize', 5),
    relation: 'reproduces',
    minutes: 20,
    statement: [
      { t: 'p', text: 'Mets en majuscule la première lettre de chaque mot (et le reste du mot en minuscules). Renvoie `str`.' },
      { t: 'code', code: '"hey, how are you? 42WORds forty-two; fifty+one"\n"Hey, How Are You? 42words Forty-Two; Fifty+One"', lang: 'text', caption: 'Exemple du PDF' },
      { t: 'p', text: 'D\'après l\'exemple, un mot est une suite de lettres et de chiffres : « 42WORds » est un mot qui commence par un chiffre, donc ses lettres deviennent minuscules.' },
    ],
    file: 'my_strcapitalize.c',
    prototype: 'char *my_strcapitalize(char *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'char *my_strcapitalize(char *str)\n{\n    return str;\n}\n',
    tests: [
      { name: 'exemple du PDF', code: 'char s[] = "hey, how are you? 42WORds forty-two; fifty+one";\ntst_str(my_strcapitalize(s));' },
      { name: 'déjà en majuscules', code: 'char s[] = "HELLO WORLD";\ntst_str(my_strcapitalize(s));' },
      { name: 'séparateurs multiples', code: 'char s[] = "  a..b--c";\ntst_str(my_strcapitalize(s));', kind: 'limit' },
      { name: 'un seul caractère', code: 'char s[] = "x";\ntst_str(my_strcapitalize(s));', kind: 'limit' },
      { name: 'vide', code: 'char s[] = "";\ntst_str(my_strcapitalize(s));', kind: 'empty' },
    ],
    hints: [
      'Un caractère est « début de mot » s\'il est alphanumérique et que le caractère d\'avant ne l\'est pas (ou s\'il est le tout premier).',
      'Écris une petite fonction static is_alnum(char c). Pour chaque lettre : si début de mot → majuscule, sinon → minuscule.',
      '1) i = 0 ; 2) pour chaque caractère : new_word = (i == 0 || !is_alnum(str[i - 1])) ; si new_word → mettre en majuscule ; sinon → en minuscule ; 3) return str.',
      'static int is_alnum(char c)\n{\n    return (c >= \'a\' && c <= \'z\') || (c >= \'A\' && c <= \'Z\')\n        || (c >= \'0\' && c <= \'9\');\n}',
    ],
    solution: String.raw`static int is_alnum(char c)
{
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

char *my_strcapitalize(char *str)
{
    int i = 0;
    int new_word;

    while (str[i] != '\0') {
        new_word = (i == 0 || !is_alnum(str[i - 1]));   /* i == 0 testé d'abord : pas de str[-1] */
        if (new_word && str[i] >= 'a' && str[i] <= 'z')
            str[i] = str[i] - 'a' + 'A';
        else if (!new_word && str[i] >= 'A' && str[i] <= 'Z')
            str[i] = str[i] - 'A' + 'a';
        i++;
    }
    return str;
}
`,
    solutionNotes: [
      { t: 'p', text: 'L\'ordre dans `i == 0 || !is_alnum(str[i - 1])` compte : si i vaut 0, la deuxième partie n\'est pas évaluée (évaluation paresseuse de ||), donc on ne lit jamais str[-1].' },
    ],
    pitfalls: ['Lire str[-1] pour le premier caractère.', 'Considérer seulement l\'espace comme séparateur ("forty-two").', 'Oublier de mettre le reste du mot en minuscules ("42WORds").'],
    prereqs: ['chars', 'strings', 'cond'],
  },
  isFn('ex_str_isalpha', 'my_str_isalpha', 'Task 12 - my_str_isalpha', 6, 'des lettres (a-z, A-Z)', "(str[i] >= 'a' && str[i] <= 'z') || (str[i] >= 'A' && str[i] <= 'Z')", 'c est une lettre si c est entre \'a\' et \'z\' OU entre \'A\' et \'Z\'', [['"Hello"', '"Hello"'], ['"Hello World"', '"Hello World"'], ['"abc1"', '"abc1"'], ['bornes "azAZ"', '"azAZ"'], ['"@["', '"@["']]),
  isFn('ex_str_isnum', 'my_str_isnum', 'Task 13 - my_str_isnum', 6, 'des chiffres', "str[i] >= '0' && str[i] <= '9'", 'c est un chiffre si \'0\' <= c <= \'9\'', [['"2042"', '"2042"'], ['"-42"', '"-42"'], ['"12a"', '"12a"'], ['"09"', '"09"']]),
  isFn('ex_str_islower', 'my_str_islower', 'Task 14 - my_str_islower', 6, 'des minuscules', "str[i] >= 'a' && str[i] <= 'z'", 'c est une minuscule si \'a\' <= c <= \'z\'', [['"hello"', '"hello"'], ['"hello world"', '"hello world"'], ['"heLlo"', '"heLlo"'], ['"az"', '"az"'], ['"{"', '"{"']]),
  isFn('ex_str_isupper', 'my_str_isupper', 'Task 15 - my_str_isupper', 7, 'des majuscules', "str[i] >= 'A' && str[i] <= 'Z'", 'c est une majuscule si \'A\' <= c <= \'Z\'', [['"EPITECH"', '"EPITECH"'], ['"EPI TECH"', '"EPI TECH"'], ['"ABc"', '"ABc"'], ['"AZ"', '"AZ"']]),
  isFn('ex_str_isprintable', 'my_str_isprintable', 'Task 16 - my_str_isprintable', 7, 'des caractères imprimables (codes 32 à 126, voir man isprint)', "str[i] >= 32 && str[i] <= 126", 'c est imprimable si 32 (espace) <= c <= 126 (~)', [['"Hello, World!"', '"Hello, World!"'], ['"a\\nb"', '"a\\nb"'], ['"tab\\t"', '"tab\\t"'], ['bornes " ~"', '" ~"'], ['DEL (127)', '"\\x7f"']]),
  {
    id: 'ex_putnbr_base',
    title: 'my_putnbr_base',
    skills: ['bases'],
    level: 3,
    kind: 'function',
    source: D6('Task 18 - my_putnbr_base', 8),
    relation: 'reproduces',
    minutes: 25,
    statement: [
      { t: 'p', text: 'Affiche `nbr` dans la base décrite par la chaîne `base` (ses symboles, dans l\'ordre). Gère les négatifs (signe `-` devant).' },
      { t: 'code', code: 'my_putnbr_base(10, "01");               /* 1010 */\nmy_putnbr_base(255, "0123456789ABCDEF"); /* FF */\nmy_putnbr_base(-42, "0123456789");       /* -42 */', lang: 'c' },
      { t: 'note', kind: 'info', text: 'Les tests appellent la fonction puis passent à la ligne eux-mêmes. Retour attendu : 0. Les bases fournies sont valides (le PDF ne décrit pas les bases invalides).' },
    ],
    file: 'my_putnbr_base.c',
    prototype: 'int my_putnbr_base(int nbr, char const *base);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'void my_putchar(char c);\n\nint my_putnbr_base(int nbr, char const *base)\n{\n    return 0;\n}\n',
    tests: [
      { name: '10 en binaire', code: 'my_putnbr_base(10, "01");\ntst_nl();' },
      { name: '255 en hexa', code: 'my_putnbr_base(255, "0123456789ABCDEF");\ntst_nl();' },
      { name: '-42 en décimal', code: 'my_putnbr_base(-42, "0123456789");\ntst_nl();' },
      { name: '0', code: 'my_putnbr_base(0, "01");\ntst_nl();', kind: 'limit' },
      { name: 'base « poneyvif »', code: 'my_putnbr_base(42, "poneyvif");\ntst_nl();' },
      { name: 'INT_MIN en hexa', code: 'my_putnbr_base(-2147483647 - 1, "0123456789abcdef");\ntst_nl();', kind: 'limit' },
      { name: 'INT_MAX en binaire', code: 'my_putnbr_base(2147483647, "01");\ntst_nl();', kind: 'limit' },
    ],
    hints: [
      'C\'est my_put_nbr où 10 est remplacé par la taille de la base, et où le chiffre d affiché est base[d].',
      'len = longueur de base. Dernier chiffre : n % len, reste : n / len. Afficher base[n % len], pas n % len + \'0\'.',
      '1) len = my_strlen(base) ; 2) long n = nbr ; si n < 0 : afficher \'-\', n = -n ; 3) fonction récursive put(n) : si n >= len → put(n / len) ; afficher base[n % len].',
      'static void put_rec(long n, char const *base, int len)\n{\n    if (n >= len)\n        put_rec(n / len, base, len);\n    my_putchar(base[n % len]);\n}',
    ],
    solution: String.raw`void my_putchar(char c);

static void put_rec(long n, char const *base, int len)
{
    if (n >= len)
        put_rec(n / len, base, len);    /* d'abord les « chiffres » de poids fort */
    my_putchar(base[n % len]);          /* le symbole, pas un chiffre décimal */
}

int my_putnbr_base(int nbr, char const *base)
{
    long n = nbr;
    int len = 0;

    while (base[len] != '\0')
        len++;
    if (n < 0) {
        my_putchar('-');
        n = -n;                         /* sans risque dans un long */
    }
    put_rec(n, base, len);
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Avec la base "poneyvif" (8 symboles), 42 = 5 × 8 + 2 s\'écrit base[5] base[2] = "vn".' }],
    pitfalls: ['Afficher n % len + \'0\' au lieu de base[n % len].', 'INT_MIN.'],
    prereqs: ['putnbr', 'strings'],
  },
  {
    id: 'ex_showstr',
    title: 'my_showstr',
    skills: ['bases', 'chars'],
    level: 2,
    kind: 'function',
    source: D6('Task 20 - my_showstr', 8),
    relation: 'reproduces',
    minutes: 15,
    statement: [
      { t: 'p', text: 'Affiche la chaîne et renvoie 0. Chaque caractère non imprimable est affiché en hexadécimal **minuscule** sur deux chiffres, précédé d\'un backslash.' },
      { t: 'code', code: '"I like \\n ponies!"  s\'affiche  I like \\0a ponies!', lang: 'text', caption: 'Exemple du PDF' },
    ],
    file: 'my_showstr.c',
    prototype: 'int my_showstr(char const *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'void my_putchar(char c);\n\nint my_showstr(char const *str)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'exemple du PDF', code: 'my_showstr("I like \\n ponies!");\ntst_nl();' },
      { name: 'tabulation (9)', code: 'my_showstr("a\\tb");\ntst_nl();' },
      { name: 'code 31 et 127', code: 'my_showstr("\\x1f\\x7f");\ntst_nl();', kind: 'limit' },
      { name: 'rien à convertir', code: 'my_showstr("Hello ~");\ntst_nl();' },
      { name: 'vide + retour', code: 'tst_int(my_showstr(""));', kind: 'empty' },
    ],
    hints: [
      'Imprimable (32 à 126) → afficher tel quel. Sinon → \\ puis deux chiffres hexa.',
      'Les deux chiffres hexa de c sont c / 16 et c % 16, chacun converti avec "0123456789abcdef"[…].',
      '1) pour chaque c : si 32 <= c <= 126 → my_putchar(c) ; sinon → my_putchar(\'\\\\\'), puis hex[c / 16], puis hex[c % 16] ; 2) return 0.',
      'char const *hex = "0123456789abcdef";\n\n/* ... */\nmy_putchar(\'\\\\\');\nmy_putchar(hex[c / 16]);\nmy_putchar(hex[c % 16]);',
    ],
    solution: String.raw`void my_putchar(char c);

int my_showstr(char const *str)
{
    char const *hex = "0123456789abcdef";
    unsigned char c;
    int i = 0;

    while (str[i] != '\0') {
        c = str[i];
        if (c >= 32 && c <= 126) {
            my_putchar(c);
        } else {
            my_putchar('\\');           /* '\\' est UN caractère : le backslash */
            my_putchar(hex[c / 16]);    /* chiffre des seizaines */
            my_putchar(hex[c % 16]);    /* chiffre des unités */
        }
        i++;
    }
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: '\\n vaut 10 : 10 / 16 = 0 et 10 % 16 = 10 → "0a". On affiche toujours deux chiffres.' }],
    pitfalls: ['Afficher "a" au lieu de "0a".', 'Majuscules (0A).'],
    prereqs: ['bases', 'chars'],
  },
];
