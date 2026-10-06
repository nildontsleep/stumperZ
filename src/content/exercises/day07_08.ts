import type { CodeExercise } from '../types';

const PUTSTR_HELPERS = String.raw`#include <unistd.h>

static int my_strlen(char const *str)
{
    int i = 0;

    while (str[i] != '\0')
        i++;
    return i;
}

static void my_putstr(char const *str)
{
    write(1, str, my_strlen(str));
}
`;

export const DAY07_08: CodeExercise[] = [
  {
    id: 'ex_strcat',
    title: 'my_strcat',
    skills: ['strfuncs'],
    level: 1,
    kind: 'function',
    source: { day: 'd07', section: 'Task 02 - my_strcat', page: 4 },
    relation: 'reproduces',
    minutes: 10,
    statement: [{ t: 'p', text: 'Concatène `src` à la fin de `dest` (qui a assez de place) et renvoie `dest`. Voir man strcat.' }],
    file: 'my_strcat.c',
    prototype: 'char *my_strcat(char *dest, char const *src);',
    allowed: ['write'],
    starter: 'char *my_strcat(char *dest, char const *src)\n{\n    return dest;\n}\n',
    tests: [
      { name: '"Hello, " + "World"', code: 'char d[30] = "Hello, ";\ntst_str(my_strcat(d, "World"));' },
      { name: 'dest vide', code: 'char d[10] = "";\ntst_str(my_strcat(d, "abc"));', kind: 'empty' },
      { name: 'src vide', code: 'char d[10] = "abc";\ntst_str(my_strcat(d, ""));', kind: 'empty' },
      { name: 'deux fois', code: 'char d[20] = "a";\nmy_strcat(d, "b");\ntst_str(my_strcat(d, "cd"));' },
      { name: 'renvoie dest', code: 'char d[10] = "x";\ntst_int(my_strcat(d, "y") == d);' },
    ],
    hints: [
      'Trouver la fin de dest (son \\0), puis y recopier src, puis remettre un \\0.',
      'Un indice i pour la fin de dest (comme my_strlen), un indice j pour parcourir src : dest[i + j] = src[j].',
      '1) i = longueur de dest ; 2) j = 0 ; tant que src[j] : dest[i + j] = src[j] ; j++ ; 3) dest[i + j] = \'\\0\' ; 4) return dest.',
      'int i = 0;\nint j = 0;\n\nwhile (dest[i] != \'\\0\')\n    i++;\nwhile (src[j] != \'\\0\') {\n    dest[i + j] = src[j];\n    j++;\n}\ndest[i + j] = \'\\0\';\nreturn dest;',
    ],
    solution: String.raw`char *my_strcat(char *dest, char const *src)
{
    int i = 0;
    int j = 0;

    while (dest[i] != '\0')     /* aller à la fin de dest */
        i++;
    while (src[j] != '\0') {
        dest[i + j] = src[j];   /* écrire par-dessus l'ancien \0, puis après */
        j++;
    }
    dest[i + j] = '\0';
    return dest;
}
`,
    solutionNotes: [],
    pitfalls: ['Écrire src au début de dest.', 'Oublier le \\0 final.'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_strncat',
    title: 'my_strncat',
    skills: ['strfuncs'],
    level: 2,
    kind: 'function',
    source: { day: 'd07', section: 'Task 03 - my_strncat', page: 4 },
    relation: 'reproduces',
    minutes: 10,
    statement: [{ t: 'p', text: 'Concatène au plus `nb` caractères de `src` à la fin de `dest`, puis termine par `\\0` (comme la vraie strncat). Renvoie `dest`.' }],
    file: 'my_strncat.c',
    prototype: 'char *my_strncat(char *dest, char const *src, int nb);',
    allowed: ['write'],
    starter: 'char *my_strncat(char *dest, char const *src, int nb)\n{\n    return dest;\n}\n',
    tests: [
      { name: 'nb < longueur', code: 'char d[20] = "abc";\ntst_str(my_strncat(d, "defgh", 2));' },
      { name: 'nb > longueur', code: 'char d[20] = "abc";\ntst_str(my_strncat(d, "de", 10));', kind: 'limit' },
      { name: 'nb = 0', code: 'char d[20] = "abc";\ntst_str(my_strncat(d, "de", 0));', kind: 'empty' },
      { name: '\\0 toujours ajouté', code: 'char d[20] = "ab";\nd[3] = \'Z\';\nd[4] = \'\\0\';\nmy_strncat(d, "xyz", 1);\ntst_str(d);', kind: 'limit' },
    ],
    hints: [
      'Comme my_strcat, avec une limite nb sur le nombre de caractères copiés.',
      'Condition de copie : j < nb && src[j] != \'\\0\'. Le \\0 final est toujours écrit.',
      '1) i = fin de dest ; 2) j = 0 ; tant que j < nb et src[j] : dest[i + j] = src[j] ; j++ ; 3) dest[i + j] = \'\\0\'.',
      'while (j < nb && src[j] != \'\\0\') {\n    dest[i + j] = src[j];\n    j++;\n}\ndest[i + j] = \'\\0\';',
    ],
    solution: String.raw`char *my_strncat(char *dest, char const *src, int nb)
{
    int i = 0;
    int j = 0;

    while (dest[i] != '\0')
        i++;
    while (j < nb && src[j] != '\0') {
        dest[i + j] = src[j];
        j++;
    }
    dest[i + j] = '\0';     /* strncat termine toujours la chaîne */
    return dest;
}
`,
    solutionNotes: [{ t: 'p', text: 'Différence avec strncpy : strncat ajoute toujours un \\0, strncpy seulement s\'il reste de la place dans les n octets.' }],
    pitfalls: ['Confondre avec la règle de my_strncpy.'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_print_params',
    title: 'my_print_params',
    skills: ['argv'],
    level: 1,
    kind: 'program',
    source: { day: 'd07', section: 'Task 04 - my_print_params', page: 5 },
    relation: 'reproduces',
    minutes: 10,
    statement: [
      { t: 'p', text: 'Écris un **programme** (avec un main) qui affiche tous ses arguments, `argv[0]` compris, un par ligne. main renvoie 0.' },
      { t: 'code', code: '~$> ./a.out test "This is a test " retest | cat -e\n./a.out$\ntest$\nThis is a test $\nretest$', lang: 'sh', caption: 'Exemple du PDF' },
      { t: 'note', kind: 'info', text: 'Seule fonction autorisée : write. Écris tes petites fonctions (my_putstr…) dans le même fichier.' },
    ],
    file: 'main.c',
    allowed: ['write'],
    starter: '#include <unistd.h>\n\nint main(int argc, char **argv)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'exemple du PDF', args: ['test', 'This is a test ', 'retest'], checkExit: true },
      { name: 'sans argument', args: [], checkExit: true, kind: 'empty' },
      { name: 'argument vide', args: [''], checkExit: true, kind: 'limit' },
    ],
    hints: [
      'argc = nombre d\'arguments (argv[0] compris), argv[i] = la chaîne numéro i.',
      'Une boucle i de 0 à argc - 1 : afficher argv[i] puis \'\\n\'. Pour afficher une chaîne avec write, il faut sa longueur.',
      '1) écrire my_strlen ; 2) i = 0 ; tant que i < argc : write(1, argv[i], my_strlen(argv[i])) ; write(1, "\\n", 1) ; i++ ; 3) return 0.',
      'static int my_strlen(char const *s)\n{\n    int i = 0;\n\n    while (s[i])\n        i++;\n    return i;\n}\n\nint main(int argc, char **argv)\n{\n    int i = 0;\n\n    while (i < argc) {\n        /* afficher argv[i] et \\n */\n        i++;\n    }\n    return 0;\n}',
    ],
    solution: PUTSTR_HELPERS + String.raw`
int main(int argc, char **argv)
{
    int i = 0;

    while (i < argc) {          /* argv[0] est le nom du programme */
        my_putstr(argv[i]);
        write(1, "\n", 1);
        i++;
    }
    return 0;
}
`,
    solutionNotes: [{ t: 'memory', caption: 'argv pour ./a.out test retest', cells: [{ id: 'a0', name: 'argv[0]', value: '"./a.out"', kind: 'ptr' }, { id: 'a1', name: 'argv[1]', value: '"test"', kind: 'ptr' }, { id: 'a2', name: 'argv[2]', value: '"retest"', kind: 'ptr' }, { id: 'a3', name: 'argv[3]', value: 'NULL', kind: 'nul' }] }],
    pitfalls: ['Commencer à 1 alors que le sujet demande argv[0].', 'Oublier le \\n.'],
    prereqs: ['argv'],
  },
  {
    id: 'ex_rev_params',
    title: 'my_rev_params',
    skills: ['argv'],
    level: 1,
    kind: 'program',
    source: { day: 'd07', section: 'Task 05 - my_rev_params', page: 5 },
    relation: 'reproduces',
    minutes: 8,
    statement: [{ t: 'p', text: 'Programme qui affiche tous ses arguments en ordre inverse (argv[0] compris, donc en dernier), un par ligne. main renvoie 0.' }],
    file: 'main.c',
    allowed: ['write'],
    starter: '#include <unistd.h>\n\nint main(int argc, char **argv)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'exemple du PDF', args: ['test', 'This is a test ', 'retest'], checkExit: true },
      { name: 'sans argument', args: [], checkExit: true, kind: 'empty' },
      { name: 'un argument', args: ['solo'], checkExit: true, kind: 'limit' },
    ],
    hints: [
      'Même chose que my_print_params, en partant de la fin.',
      'Le dernier argument est argv[argc - 1].',
      'i = argc - 1 ; tant que i >= 0 : afficher argv[i] ; i--.',
      'int i = argc - 1;\n\nwhile (i >= 0) {\n    /* afficher */\n    i--;\n}',
    ],
    solution: PUTSTR_HELPERS + String.raw`
int main(int argc, char **argv)
{
    int i = argc - 1;   /* argv[argc] est NULL : le dernier est argc - 1 */

    while (i >= 0) {
        my_putstr(argv[i]);
        write(1, "\n", 1);
        i--;
    }
    return 0;
}
`,
    solutionNotes: [],
    pitfalls: ['Commencer à argv[argc] (NULL).', 'Condition i > 0 : argv[0] oublié.'],
    prereqs: ['argv'],
  },
  {
    id: 'ex_sort_params',
    title: 'my_sort_params',
    skills: ['argv', 'strfuncs'],
    level: 2,
    kind: 'program',
    source: { day: 'd07', section: 'Task 06 - my_sort_params', page: 6 },
    relation: 'reproduces',
    minutes: 20,
    statement: [
      { t: 'p', text: 'Programme qui affiche tous ses arguments (argv[0] compris) triés dans l\'ordre ASCII, un par ligne. main renvoie 0.' },
      { t: 'code', code: '~$> ./a.out test "This is a test " retest | cat -e\n./a.out$\nThis is a test $\nretest$\ntest$', lang: 'sh', caption: 'Exemple du PDF' },
    ],
    file: 'main.c',
    allowed: ['write'],
    starter: '#include <unistd.h>\n\nint main(int argc, char **argv)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'exemple du PDF', args: ['test', 'This is a test ', 'retest'], checkExit: true },
      { name: 'déjà trié', args: ['a', 'b', 'c'], checkExit: true, kind: 'limit' },
      { name: 'préfixes et majuscules', args: ['abc', 'ab', 'B', 'a'], checkExit: true, kind: 'limit' },
      { name: 'sans argument', args: [], checkExit: true, kind: 'empty' },
    ],
    hints: [
      'Trier les pointeurs du tableau argv avec my_strcmp, puis les afficher.',
      'Tri à bulles sur argv : si my_strcmp(argv[i], argv[i + 1]) > 0, on échange les deux pointeurs (pas les caractères !).',
      '1) écrire my_strcmp ; 2) trier argv[0..argc-1] en échangeant des char * ; 3) afficher comme my_print_params.',
      'char *tmp;\n\nif (my_strcmp(argv[i], argv[i + 1]) > 0) {\n    tmp = argv[i];\n    argv[i] = argv[i + 1];\n    argv[i + 1] = tmp;\n    sorted = 0;\n}',
    ],
    solution: PUTSTR_HELPERS + String.raw`
static int my_strcmp(char const *s1, char const *s2)
{
    int i = 0;

    while (s1[i] != '\0' && s1[i] == s2[i])
        i++;
    return (unsigned char)s1[i] - (unsigned char)s2[i];
}

static void sort_words(char **tab, int size)
{
    int sorted = 0;
    int i;
    char *tmp;

    while (!sorted) {
        sorted = 1;
        i = 0;
        while (i < size - 1) {
            if (my_strcmp(tab[i], tab[i + 1]) > 0) {
                tmp = tab[i];               /* on échange des adresses */
                tab[i] = tab[i + 1];
                tab[i + 1] = tmp;
                sorted = 0;
            }
            i++;
        }
    }
}

int main(int argc, char **argv)
{
    int i = 0;

    sort_words(argv, argc);
    while (i < argc) {
        my_putstr(argv[i]);
        write(1, "\n", 1);
        i++;
    }
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Échanger deux pointeurs coûte 3 affectations, quelle que soit la longueur des mots. C\'est aussi ce que demande le Day 10 (my_sort_word_array).' }],
    pitfalls: ['Comparer seulement le premier caractère.', 'Copier les chaînes au lieu d\'échanger les pointeurs.'],
    prereqs: ['argv', 'strfuncs', 'arrays'],
  },
  {
    id: 'ex_last_arg_len',
    title: 'Le plus long argument',
    skills: ['argv', 'errors84'],
    level: 2,
    kind: 'program',
    relation: 'inspired',
    minutes: 15,
    statement: [
      { t: 'p', text: 'Écris un programme qui affiche le plus long de ses arguments (sans compter argv[0]), suivi de `\\n`. En cas d\'égalité, le premier trouvé. S\'il n\'y a aucun argument, il écrit `error: no argument\\n` sur la **sortie d\'erreur** et renvoie 84. Sinon il renvoie 0.' },
      { t: 'code', code: '~$> ./a.out chat elephant chien\nelephant\n~$> ./a.out ; echo $?\nerror: no argument\n84', lang: 'sh' },
    ],
    file: 'main.c',
    allowed: ['write'],
    starter: '#include <unistd.h>\n\nint main(int argc, char **argv)\n{\n    return 0;\n}\n',
    tests: [
      { name: '3 mots', args: ['chat', 'elephant', 'chien'], checkExit: true, stderr: 'empty' },
      { name: 'égalité', args: ['abc', 'xyz'], checkExit: true, kind: 'limit' },
      { name: 'un argument vide', args: [''], checkExit: true, kind: 'limit' },
      { name: 'sans argument', args: [], checkExit: true, stderr: 'any', kind: 'error' },
    ],
    hints: [
      'Deux cas : pas d\'argument (argc == 1) → erreur ; sinon chercher l\'argument le plus long.',
      'Pour une erreur : write(2, "...", taille) écrit sur la sortie d\'erreur, puis return 84. Pour le maximum : garder l\'indice du meilleur et sa longueur.',
      '1) si argc < 2 → write(2, …) ; return 84 ; 2) best = 1 ; pour i de 2 à argc - 1 : si my_strlen(argv[i]) > my_strlen(argv[best]) → best = i ; 3) afficher argv[best] et \\n ; return 0.',
      'if (argc < 2) {\n    write(2, "error: no argument\\n", 19);\n    return 84;\n}',
    ],
    solution: PUTSTR_HELPERS + String.raw`
int main(int argc, char **argv)
{
    int best = 1;
    int i = 2;

    if (argc < 2) {
        write(2, "error: no argument\n", 19);   /* fd 2 = sortie d'erreur */
        return 84;
    }
    while (i < argc) {
        if (my_strlen(argv[i]) > my_strlen(argv[best]))    /* > strict : le premier gagne */
            best = i;
        i++;
    }
    my_putstr(argv[best]);
    write(1, "\n", 1);
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Compter les caractères à la main ("error: no argument\\n" = 19) est source d\'erreurs : une fonction my_puterr qui calcule la longueur est plus sûre.' }],
    pitfalls: ['Écrire l\'erreur sur la sortie standard (fd 1).', 'Renvoyer 1 au lieu de 84.', 'Utiliser >= : le dernier ex aequo gagne.'],
    prereqs: ['argv', 'errors84'],
  },
  // ---------------------------------------------------------------- Day 08
  {
    id: 'ex_strdup',
    title: 'my_strdup',
    skills: ['malloc'],
    level: 2,
    kind: 'function',
    source: { day: 'd08', section: 'Task 01 - my_strdup', page: 3 },
    relation: 'reproduces',
    minutes: 12,
    statement: [{ t: 'p', text: 'Alloue de la mémoire (malloc), copie la chaîne `src` dedans et renvoie le pointeur vers la nouvelle chaîne.' }],
    file: 'my_strdup.c',
    prototype: 'char *my_strdup(char const *src);',
    allowed: ['write', 'malloc', 'free'],
    starter: '#include <stdlib.h>\n\nchar *my_strdup(char const *src)\n{\n    return NULL;\n}\n',
    tests: [
      { name: '"Hello"', code: 'char *d = my_strdup("Hello");\ntst_str(d);\nfree(d);' },
      { name: 'nouvelle zone mémoire', code: 'char s[] = "abc";\nchar *d = my_strdup(s);\ntst_int(d != s);\ns[0] = \'X\';\ntst_str(d);\nfree(d);', kind: 'limit' },
      { name: 'chaîne vide', code: 'char *d = my_strdup("");\ntst_str(d);\nfree(d);', kind: 'empty' },
      { name: 'longue chaîne', code: 'char *d = my_strdup("0123456789012345678901234567890123456789");\ntst_str(d);\nfree(d);' },
    ],
    hints: [
      'Réserver longueur + 1 octets (le +1 pour le \\0), copier, renvoyer.',
      'malloc(sizeof(char) * (len + 1)) renvoie l\'adresse d\'une zone neuve, ou NULL si la mémoire manque.',
      '1) len = my_strlen(src) ; 2) dest = malloc(len + 1) ; si NULL → return NULL ; 3) copier src dans dest avec le \\0 ; 4) return dest.',
      'char *dest;\nint len = 0;\nint i = 0;\n\nwhile (src[len])\n    len++;\ndest = malloc(sizeof(char) * (len + 1));\nif (dest == NULL)\n    return NULL;\n/* copie + \\0 */\nreturn dest;',
    ],
    solution: String.raw`#include <stdlib.h>

char *my_strdup(char const *src)
{
    char *dest;
    int len = 0;
    int i = 0;

    while (src[len] != '\0')
        len++;
    dest = malloc(sizeof(char) * (len + 1));    /* +1 pour le '\0' */
    if (dest == NULL)
        return NULL;                            /* plus de mémoire */
    while (i <= len) {                          /* <= : copie aussi le '\0' */
        dest[i] = src[i];
        i++;
    }
    return dest;
}
`,
    solutionNotes: [{ t: 'p', text: 'Oublier le +1 fait écrire le \\0 un octet trop loin : le programme peut sembler marcher puis planter plus tard. C\'est un comportement indéfini.' }],
    pitfalls: ['malloc(len) sans le +1.', 'Ne pas tester le retour de malloc.', 'Renvoyer src au lieu de la copie.'],
    prereqs: ['malloc', 'strings'],
  },
  {
    id: 'ex_concat_params',
    title: 'concat_params',
    skills: ['malloc', 'argv'],
    level: 3,
    kind: 'function',
    source: { day: 'd08', section: 'Task 02 - concat_params', page: 3 },
    relation: 'reproduces',
    minutes: 20,
    statement: [
      { t: 'p', text: 'Transforme les arguments en une seule chaîne allouée, séparés par `\\n` (pas de `\\n` après le dernier).' },
      { t: 'code', code: '~$> ./concat_params toto titi | cat -e\n./concat_params$\ntoto$\ntiti', lang: 'sh', caption: 'Exemple du PDF' },
    ],
    file: 'concat_params.c',
    prototype: 'char *concat_params(int argc, char **argv);',
    allowed: ['write', 'malloc', 'free'],
    starter: '#include <stdlib.h>\n\nchar *concat_params(int argc, char **argv)\n{\n    return NULL;\n}\n',
    tests: [
      { name: 'exemple du PDF', code: 'char *av[] = {"./concat_params", "toto", "titi", 0};\nchar *r = concat_params(3, av);\ntst_str(r);\nfree(r);' },
      { name: 'un seul argument', code: 'char *av[] = {"./a.out", 0};\nchar *r = concat_params(1, av);\ntst_str(r);\nfree(r);', kind: 'limit' },
      { name: 'arguments vides', code: 'char *av[] = {"x", "", "", 0};\nchar *r = concat_params(3, av);\ntst_str(r);\nfree(r);', kind: 'empty' },
      { name: 'beaucoup d\'arguments', code: 'char *av[] = {"a", "bb", "ccc", "dddd", "eeeee", 0};\nchar *r = concat_params(5, av);\ntst_str(r);\nfree(r);' },
    ],
    hints: [
      'D\'abord calculer la taille totale, puis allouer une seule fois, puis copier.',
      'Taille = somme des longueurs + (argc - 1) séparateurs + 1 pour le \\0.',
      '1) total = Σ my_strlen(argv[i]) + argc - 1 + 1 ; 2) res = malloc(total) ; 3) k = 0 ; pour chaque i : copier argv[i] dans res à partir de k ; si i < argc - 1 → res[k++] = \'\\n\' ; 4) res[k] = \'\\0\'.',
      'int total = 0;\nint i = 0;\n\nwhile (i < argc) {\n    total += my_strlen(argv[i]) + 1;   /* +1 : \\n ou \\0 */\n    i++;\n}\nres = malloc(sizeof(char) * total);',
    ],
    solution: String.raw`#include <stdlib.h>

static int len_of(char const *s)
{
    int i = 0;

    while (s[i] != '\0')
        i++;
    return i;
}

char *concat_params(int argc, char **argv)
{
    char *res;
    int total = 0;
    int i = 0;
    int j;
    int k = 0;

    while (i < argc) {
        total += len_of(argv[i]) + 1;   /* +1 : un '\n' ou, pour le dernier, le '\0' */
        i++;
    }
    res = malloc(sizeof(char) * (total + 1));
    if (res == NULL)
        return NULL;
    for (i = 0; i < argc; i++) {
        for (j = 0; argv[i][j] != '\0'; j++)
            res[k++] = argv[i][j];
        if (i < argc - 1)
            res[k++] = '\n';            /* séparateur, pas après le dernier */
    }
    res[k] = '\0';
    return res;
}
`,
    solutionNotes: [{ t: 'p', text: 'argv[i][j] = caractère j de l\'argument i. argv est un tableau de chaînes : deux indices.' }],
    pitfalls: ['Oublier les séparateurs dans le calcul de taille.', 'Ajouter un \\n après le dernier.'],
    prereqs: ['malloc', 'argv'],
  },
  {
    id: 'ex_show_word_array',
    title: 'my_show_word_array',
    skills: ['wordarray'],
    level: 1,
    kind: 'function',
    source: { day: 'd08', section: 'Task 03 - my_show_word_array', page: 4 },
    relation: 'reproduces',
    minutes: 8,
    statement: [
      { t: 'p', text: 'Affiche le contenu d\'un tableau de mots terminé par 0 (NULL) : un mot par ligne, chaque mot suivi de `\\n`, y compris le dernier. Renvoie 0.' },
    ],
    file: 'my_show_word_array.c',
    prototype: 'int my_show_word_array(char * const *tab);',
    allowed: ['write'],
    starter: '#include <unistd.h>\n\nint my_show_word_array(char * const *tab)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'exemple du PDF (début)', code: 'char *t[] = {"The", "Answer", "to", "the", "Great", "Question...", 0};\nmy_show_word_array(t);' },
      { name: 'tableau vide', code: 'char *t[] = {0};\ntst_int(my_show_word_array(t));', kind: 'empty' },
      { name: 'mot vide', code: 'char *t[] = {"a", "", "b", 0};\nmy_show_word_array(t);', kind: 'limit' },
    ],
    hints: [
      'Parcourir tab jusqu\'à la case qui vaut NULL, et afficher chaque chaîne.',
      'tab[i] est une chaîne (char *). La condition d\'arrêt est tab[i] != NULL (et non tab[i][0] != \'\\0\').',
      '1) i = 0 ; 2) tant que tab[i] != NULL : afficher tab[i], afficher \\n ; i++ ; 3) return 0.',
      'int i = 0;\n\nwhile (tab[i] != NULL) {\n    /* afficher tab[i] puis \\n */\n    i++;\n}\nreturn 0;',
    ],
    solution: String.raw`#include <unistd.h>
#include <stddef.h>

static void putstr(char const *s)
{
    int n = 0;

    while (s[n] != '\0')
        n++;
    write(1, s, n);
}

int my_show_word_array(char * const *tab)
{
    int i = 0;

    while (tab[i] != NULL) {    /* la dernière case vaut NULL (0) */
        putstr(tab[i]);
        write(1, "\n", 1);
        i++;
    }
    return 0;
}
`,
    solutionNotes: [],
    pitfalls: ['S\'arrêter sur un mot vide au lieu de NULL.'],
    prereqs: ['wordarray'],
  },
  {
    id: 'ex_str_to_word_array',
    title: 'my_str_to_word_array',
    skills: ['wordarray', 'malloc'],
    level: 3,
    kind: 'function',
    source: { day: 'd08', section: 'Task 04 - my_str_to_word_array', page: 4 },
    relation: 'reproduces',
    minutes: 35,
    statement: [
      { t: 'p', text: 'Découpe une chaîne en mots. Les séparateurs sont **tous les caractères non alphanumériques**. Renvoie un tableau alloué dont chaque case contient l\'adresse d\'un mot (alloué lui aussi) ; la dernière case vaut NULL.' },
      { t: 'code', code: '"  Hello, World!42 ok" -> {"Hello", "World", "42", "ok", NULL}', lang: 'text' },
    ],
    file: 'my_str_to_word_array.c',
    prototype: 'char **my_str_to_word_array(char const *str);',
    allowed: ['write', 'malloc', 'free'],
    support: String.raw`static void tst_words(char **t)
{
    int i = 0;

    if (t == 0) {
        tst_puts("(null)\n");
        return;
    }
    while (t[i] != 0) {
        tst_str(t[i]);
        i++;
    }
    tst_puts("NULL\n");
}`,
    starter: '#include <stdlib.h>\n\nchar **my_str_to_word_array(char const *str)\n{\n    return NULL;\n}\n',
    tests: [
      { name: 'phrase simple', code: 'tst_words(my_str_to_word_array("Hello World"));' },
      { name: 'séparateurs variés', code: 'tst_words(my_str_to_word_array("  Hello, World!42 ok"));' },
      { name: 'séparateurs au début et à la fin', code: 'tst_words(my_str_to_word_array("--a--"));', kind: 'limit' },
      { name: 'chaîne vide', code: 'tst_words(my_str_to_word_array(""));', kind: 'empty' },
      { name: 'que des séparateurs', code: 'tst_words(my_str_to_word_array(" ,;! "));', kind: 'empty' },
      { name: 'un seul mot', code: 'tst_words(my_str_to_word_array("Epitech2042"));', kind: 'limit' },
    ],
    hints: [
      'Trois étapes : compter les mots, allouer le tableau (mots + 1 pour NULL), puis pour chaque mot : mesurer sa longueur, allouer, copier.',
      'Un mot commence à un caractère alphanumérique précédé d\'un séparateur (ou du début). Écris une fonction static is_alnum(char c).',
      '1) count_words ; 2) tab = malloc(sizeof(char *) * (count + 1)) ; 3) i = 0, w = 0 ; tant que str[i] : sauter les séparateurs ; si fin → stop ; mesurer len du mot ; tab[w] = malloc(len + 1) ; copier ; w++ ; 4) tab[w] = NULL.',
      'static int is_alnum(char c);\nstatic int count_words(char const *str);\nstatic char *copy_word(char const *start, int len);\n\nchar **my_str_to_word_array(char const *str)\n{\n    int n = count_words(str);\n    char **tab = malloc(sizeof(char *) * (n + 1));\n    /* ... */\n    tab[n] = NULL;\n    return tab;\n}',
    ],
    solution: String.raw`#include <stdlib.h>

static int is_alnum(char c)
{
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

static int count_words(char const *str)
{
    int count = 0;
    int i = 0;

    while (str[i] != '\0') {
        if (is_alnum(str[i]) && (i == 0 || !is_alnum(str[i - 1])))
            count++;                        /* début d'un mot */
        i++;
    }
    return count;
}

static char *copy_word(char const *start, int len)
{
    char *word = malloc(sizeof(char) * (len + 1));
    int i = 0;

    if (word == NULL)
        return NULL;
    while (i < len) {
        word[i] = start[i];
        i++;
    }
    word[len] = '\0';
    return word;
}

char **my_str_to_word_array(char const *str)
{
    int n = count_words(str);
    char **tab = malloc(sizeof(char *) * (n + 1));   /* +1 pour le NULL final */
    int i = 0;
    int w = 0;
    int len;

    if (tab == NULL)
        return NULL;
    while (str[i] != '\0') {
        while (str[i] != '\0' && !is_alnum(str[i]))
            i++;                            /* saute les séparateurs */
        len = 0;
        while (is_alnum(str[i + len]))
            len++;                          /* mesure le mot */
        if (len > 0) {
            tab[w] = copy_word(str + i, len);
            w++;
        }
        i += len;
    }
    tab[w] = NULL;
    return tab;
}
`,
    solutionNotes: [
      { t: 'memory', caption: 'Résultat pour "Hi you" : un tableau de pointeurs, chaque pointeur vers un mot alloué', cells: [{ id: 't0', name: 'tab[0]', value: '→ "Hi"', kind: 'ptr' }, { id: 't1', name: 'tab[1]', value: '→ "you"', kind: 'ptr' }, { id: 't2', name: 'tab[2]', value: 'NULL', kind: 'nul' }] },
      { t: 'p', text: 'sizeof(char *) (taille d\'une adresse) et non sizeof(char) pour le tableau : c\'est un tableau de pointeurs.' },
    ],
    pitfalls: ['malloc(sizeof(char) * n) pour le tableau de pointeurs.', 'Oublier la case NULL.', 'Compter un mot vide entre deux séparateurs consécutifs.'],
    prereqs: ['malloc', 'wordarray', 'strings'],
  },
];
