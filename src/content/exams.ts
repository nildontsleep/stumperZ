import type { ExamSubject } from './types';

// Original subjects built on the skills of the PDFs. They are skill simulations,
// not predictions of the real exam.

const COMMON_RULES = [
  'Un seul fichier : main.c, avec ta fonction main.',
  'Fonctions autorisées : write, malloc, free. Pas de printf, pas de fonctions de string.h.',
  'Erreur : message sur la sortie d\'erreur (write(2, …)), rien sur la sortie standard, code de sortie 84.',
  'Sinon le programme renvoie 0.',
  'Les étapes sont indépendantes : chaque étape testée utilise sa propre option. Avance dans l\'ordre, mais une étape ratée ne bloque pas les suivantes.',
];

const STARTER = '#include <unistd.h>\n#include <stdlib.h>\n\nint main(int argc, char **argv)\n{\n    return 0;\n}\n';

export const EXAMS: ExamSubject[] = [
  {
    id: 'exam_textool',
    title: 'textool',
    binary: 'textool',
    file: 'main.c',
    intro: [
      { t: 'p', text: 'Écris un programme `textool` qui applique une opération sur un texte : `./textool OPTION TEXTE`.' },
      { t: 'p', text: 'Un **mot** est une suite de caractères qui ne sont ni des espaces (\' \') ni des tabulations (\'\\t\').' },
    ],
    rules: COMMON_RULES,
    allowed: ['write', 'malloc', 'free'],
    steps: [
      {
        title: 'Arguments et erreurs',
        points: 2,
        skills: ['argv', 'errors84'],
        statement: [
          { t: 'p', text: 'Le programme attend exactement 2 arguments. L\'option doit être exactement l\'une de : `-c`, `-w`, `-u`, `-r`, `-s`. Sinon : message d\'usage sur la sortie d\'erreur, rien sur la sortie standard, code 84.' },
          { t: 'code', code: '~$> ./textool ; echo $?\nUsage: ./textool [-c|-w|-u|-r|-s] TEXT\n84\n~$> ./textool -x hello ; echo $?\nUsage: ./textool [-c|-w|-u|-r|-s] TEXT\n84', lang: 'sh' },
        ],
        tests: [
          { name: 'aucun argument', args: [], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'un seul argument', args: ['-c'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'trop d\'arguments', args: ['-c', 'a', 'b'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'option inconnue', args: ['-x', 'hello'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'option sans tiret', args: ['c', 'hello'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'option trop longue', args: ['-cw', 'hello'], checkExit: true, stderr: 'any', kind: 'error' },
        ],
      },
      {
        title: '-c : nombre de caractères',
        points: 3,
        skills: ['strings', 'putnbr'],
        statement: [
          { t: 'p', text: 'Affiche le nombre de caractères du texte, puis un retour à la ligne.' },
          { t: 'code', code: '~$> ./textool -c "hello world"\n11\n~$> ./textool -c ""\n0', lang: 'sh' },
        ],
        tests: [
          { name: '"hello world"', args: ['-c', 'hello world'], checkExit: true },
          { name: 'texte vide', args: ['-c', ''], checkExit: true, kind: 'empty' },
          { name: 'long texte', args: ['-c', 'x'.repeat(1234)], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: '-w : nombre de mots',
        points: 4,
        skills: ['strings', 'cond', 'putnbr'],
        statement: [
          { t: 'p', text: 'Affiche le nombre de mots, puis un retour à la ligne.' },
          { t: 'code', code: '~$> ./textool -w "  the cat   sat "\n3\n~$> ./textool -w "   "\n0', lang: 'sh' },
        ],
        tests: [
          { name: 'espaces multiples', args: ['-w', '  the cat   sat '], checkExit: true },
          { name: 'un mot', args: ['-w', 'epitech'], checkExit: true, kind: 'limit' },
          { name: 'tabulations', args: ['-w', 'a\tb \t c'], checkExit: true, kind: 'limit' },
          { name: 'que des espaces', args: ['-w', '   '], checkExit: true, kind: 'empty' },
          { name: 'vide', args: ['-w', ''], checkExit: true, kind: 'empty' },
        ],
      },
      {
        title: '-u : majuscules',
        points: 4,
        skills: ['chars', 'strings'],
        statement: [
          { t: 'p', text: 'Affiche le texte avec toutes les minuscules (a-z) transformées en majuscules, puis un retour à la ligne. Les autres caractères ne changent pas.' },
          { t: 'code', code: '~$> ./textool -u "Hello, World 42!"\nHELLO, WORLD 42!', lang: 'sh' },
        ],
        tests: [
          { name: 'phrase', args: ['-u', 'Hello, World 42!'], checkExit: true },
          { name: 'bornes', args: ['-u', 'az{`AZ'], checkExit: true, kind: 'limit' },
          { name: 'vide', args: ['-u', ''], checkExit: true, kind: 'empty' },
        ],
      },
      {
        title: '-r : mots à l\'envers',
        points: 5,
        skills: ['strings', 'loops'],
        statement: [
          { t: 'p', text: 'Affiche les mots dans l\'ordre inverse, séparés par un seul espace, puis un retour à la ligne. Les mots eux-mêmes ne sont pas inversés. S\'il n\'y a aucun mot, affiche seulement le retour à la ligne.' },
          { t: 'code', code: '~$> ./textool -r "  the cat   sat "\nsat cat the\n~$> ./textool -r "   " | cat -e\n$', lang: 'sh' },
        ],
        tests: [
          { name: 'espaces multiples', args: ['-r', '  the cat   sat '], checkExit: true },
          { name: 'un mot', args: ['-r', 'alone'], checkExit: true, kind: 'limit' },
          { name: 'ponctuation collée', args: ['-r', 'hi, you!'], checkExit: true, kind: 'limit' },
          { name: 'aucun mot', args: ['-r', ' \t '], checkExit: true, kind: 'empty' },
        ],
      },
      {
        title: '-s : mots triés',
        points: 6,
        skills: ['strfuncs', 'arrays', 'malloc'],
        statement: [
          { t: 'p', text: 'Affiche les mots triés dans l\'ordre ASCII, un par ligne. S\'il n\'y a aucun mot, n\'affiche rien.' },
          { t: 'code', code: '~$> ./textool -s "pear Apple fig apple"\nApple\napple\nfig\npear', lang: 'sh' },
        ],
        tests: [
          { name: 'mélange', args: ['-s', 'pear Apple fig apple'], checkExit: true },
          { name: 'préfixes', args: ['-s', 'abc ab a'], checkExit: true, kind: 'limit' },
          { name: 'doublons', args: ['-s', 'b a b'], checkExit: true, kind: 'limit' },
          { name: 'aucun mot', args: ['-s', '  '], checkExit: true, kind: 'empty' },
        ],
      },
    ],
    starter: STARTER,
    correction: [
      { step: 0, blocks: [
        { t: 'p', text: 'Commencer par l\'étape 1 sécurise des points et force à structurer le main : vérifier argc == 3, puis que argv[1] fait exactement 2 caractères, commence par \'-\' et que le deuxième est dans "cwurs".' },
        { t: 'code', code: 'static int usage(void)\n{\n    write(2, "Usage: ./textool [-c|-w|-u|-r|-s] TEXT\\n", 39);\n    return 84;\n}\n\nif (argc != 3 || argv[1][0] != \'-\' || argv[1][1] == \'\\0\' || argv[1][2] != \'\\0\')\n    return usage();', lang: 'c' },
      ] },
      { step: 1, blocks: [{ t: 'p', text: '-c = my_strlen + my_put_nbr + \\n. Le cas du texte vide doit afficher 0 : vérifie que ton my_put_nbr affiche bien 0.' }] },
      { step: 2, blocks: [
        { t: 'p', text: 'Compter les débuts de mots : un caractère non-espace dont le précédent est un espace (ou qui est le premier).' },
        { t: 'code', code: 'static int is_sep(char c)\n{\n    return c == \' \' || c == \'\\t\';\n}\n\nif (!is_sep(s[i]) && (i == 0 || is_sep(s[i - 1])))\n    count++;', lang: 'c' },
      ] },
      { step: 3, blocks: [{ t: 'p', text: 'Comme my_strupcase, mais en affichant chaque caractère au lieu de modifier la chaîne (argv peut être modifié, mais afficher directement est plus simple).' }] },
      { step: 4, blocks: [
        { t: 'p', text: 'Parcourir le texte depuis la fin : repérer la fin d\'un mot, remonter jusqu\'à son début, l\'afficher avec write(1, s + debut, longueur). Gérer l\'espace séparateur avec un drapeau « premier mot affiché ».' },
      ] },
      { step: 5, blocks: [
        { t: 'p', text: 'Construire un tableau de mots (comme my_str_to_word_array, avec les espaces comme seuls séparateurs), le trier en échangeant les pointeurs (comme my_sort_word_array), puis afficher.' },
      ] },
    ],
    solution: String.raw`#include <unistd.h>
#include <stdlib.h>

static int len_of(char const *s)
{
    int n = 0;

    while (s[n] != '\0')
        n++;
    return n;
}

static void put_str(char const *s)
{
    write(1, s, len_of(s));
}

static void put_nbr(int n)
{
    char c;

    if (n >= 10)
        put_nbr(n / 10);
    c = n % 10 + '0';
    write(1, &c, 1);
}

static int is_sep(char c)
{
    return c == ' ' || c == '\t';
}

static int count_words(char const *s)
{
    int count = 0;
    int i = 0;

    while (s[i] != '\0') {
        if (!is_sep(s[i]) && (i == 0 || is_sep(s[i - 1])))
            count++;
        i++;
    }
    return count;
}

static void upper(char const *s)
{
    char c;

    while (*s != '\0') {
        c = *s;
        if (c >= 'a' && c <= 'z')
            c = c - 'a' + 'A';
        write(1, &c, 1);
        s++;
    }
    write(1, "\n", 1);
}

static void reverse_words(char const *s)
{
    int end = len_of(s);
    int start;
    int first = 1;

    while (end > 0) {
        while (end > 0 && is_sep(s[end - 1]))
            end--;
        start = end;
        while (start > 0 && !is_sep(s[start - 1]))
            start--;
        if (start < end) {
            if (!first)
                write(1, " ", 1);
            write(1, s + start, end - start);
            first = 0;
        }
        end = start;
    }
    write(1, "\n", 1);
}

static int cmp(char const *a, char const *b)
{
    while (*a != '\0' && *a == *b) {
        a++;
        b++;
    }
    return (unsigned char)*a - (unsigned char)*b;
}

static char **split(char const *s, int n)
{
    char **tab = malloc(sizeof(char *) * (n + 1));
    int i = 0;
    int w = 0;
    int len;
    int k;

    if (tab == NULL)
        return NULL;
    while (s[i] != '\0') {
        while (s[i] != '\0' && is_sep(s[i]))
            i++;
        len = 0;
        while (s[i + len] != '\0' && !is_sep(s[i + len]))
            len++;
        if (len > 0) {
            tab[w] = malloc(len + 1);
            if (tab[w] == NULL)
                return NULL;
            for (k = 0; k < len; k++)
                tab[w][k] = s[i + k];
            tab[w][len] = '\0';
            w++;
        }
        i += len;
    }
    tab[w] = NULL;
    return tab;
}

static int sort_words(char const *s)
{
    int n = count_words(s);
    char **tab = split(s, n);
    char *tmp;
    int sorted = 0;
    int i;

    if (tab == NULL)
        return 84;
    while (!sorted) {
        sorted = 1;
        for (i = 0; i < n - 1; i++) {
            if (cmp(tab[i], tab[i + 1]) > 0) {
                tmp = tab[i];
                tab[i] = tab[i + 1];
                tab[i + 1] = tmp;
                sorted = 0;
            }
        }
    }
    for (i = 0; i < n; i++) {
        put_str(tab[i]);
        write(1, "\n", 1);
        free(tab[i]);
    }
    free(tab);
    return 0;
}

static int usage(void)
{
    char const *msg = "Usage: ./textool [-c|-w|-u|-r|-s] TEXT\n";

    write(2, msg, len_of(msg));
    return 84;
}

int main(int argc, char **argv)
{
    char opt;

    if (argc != 3 || argv[1][0] != '-' || argv[1][1] == '\0' || argv[1][2] != '\0')
        return usage();
    opt = argv[1][1];
    if (opt == 'c') {
        put_nbr(len_of(argv[2]));
        write(1, "\n", 1);
    } else if (opt == 'w') {
        put_nbr(count_words(argv[2]));
        write(1, "\n", 1);
    } else if (opt == 'u') {
        upper(argv[2]);
    } else if (opt == 'r') {
        reverse_words(argv[2]);
    } else if (opt == 's') {
        return sort_words(argv[2]);
    } else {
        return usage();
    }
    return 0;
}
`,
    followUp: ['ex_print_params', 'ex_strupcase', 'ex_str_to_word_array', 'ex_sort_word_array', 'ex_last_arg_len'],
  },
  {
    id: 'exam_shapes',
    title: 'shapes',
    binary: 'shapes',
    file: 'main.c',
    intro: [
      { t: 'p', text: 'Écris un programme `shapes` qui dessine une forme avec des étoiles : `./shapes FORME TAILLE`.' },
      { t: 'p', text: 'TAILLE doit être composée uniquement de chiffres (au moins un) et valoir entre 1 et 50. Aucune ligne ne se termine par un espace.' },
    ],
    rules: COMMON_RULES,
    allowed: ['write', 'malloc', 'free'],
    steps: [
      {
        title: 'Arguments et erreurs',
        points: 3,
        skills: ['argv', 'errors84', 'getnbr'],
        statement: [
          { t: 'p', text: 'Exactement 2 arguments. FORME ∈ { square, triangle, frame, pyramid, cross }. TAILLE : uniquement des chiffres, entre 1 et 50. Sinon : erreur (message sur la sortie d\'erreur, code 84).' },
        ],
        tests: [
          { name: 'aucun argument', args: [], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'forme inconnue', args: ['circle', '3'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'taille 0', args: ['square', '0'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'taille 51', args: ['square', '51'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'taille négative', args: ['square', '-3'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'taille non numérique', args: ['square', '3a'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'taille vide', args: ['square', ''], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'préfixe de forme', args: ['squar', '3'], checkExit: true, stderr: 'any', kind: 'error' },
        ],
      },
      {
        title: 'square',
        points: 3,
        skills: ['loops'],
        statement: [{ t: 'code', code: '~$> ./shapes square 3\n***\n***\n***', lang: 'sh' }],
        tests: [
          { name: 'taille 3', args: ['square', '3'], checkExit: true },
          { name: 'taille 1', args: ['square', '1'], checkExit: true, kind: 'limit' },
          { name: 'taille 050', args: ['square', '050'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'triangle',
        points: 3,
        skills: ['loops'],
        statement: [{ t: 'code', code: '~$> ./shapes triangle 4\n*\n**\n***\n****', lang: 'sh' }],
        tests: [
          { name: 'taille 4', args: ['triangle', '4'], checkExit: true },
          { name: 'taille 1', args: ['triangle', '1'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'frame',
        points: 4,
        skills: ['loops', 'cond'],
        statement: [
          { t: 'p', text: 'Un carré creux : bord en `*`, intérieur en espaces.' },
          { t: 'code', code: '~$> ./shapes frame 4 | cat -e\n****$\n*  *$\n*  *$\n****$', lang: 'sh' },
        ],
        tests: [
          { name: 'taille 4', args: ['frame', '4'], checkExit: true },
          { name: 'taille 2', args: ['frame', '2'], checkExit: true, kind: 'limit' },
          { name: 'taille 1', args: ['frame', '1'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'pyramid',
        points: 5,
        skills: ['loops', 'vars'],
        statement: [
          { t: 'p', text: 'Ligne i (de 1 à TAILLE) : TAILLE - i espaces, puis 2 × i - 1 étoiles. Pas d\'espace en fin de ligne.' },
          { t: 'code', code: '~$> ./shapes pyramid 3 | cat -e\n  *$\n ***$\n*****$', lang: 'sh' },
        ],
        tests: [
          { name: 'taille 3', args: ['pyramid', '3'], checkExit: true },
          { name: 'taille 5', args: ['pyramid', '5'], checkExit: true },
          { name: 'taille 1', args: ['pyramid', '1'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'cross',
        points: 6,
        skills: ['loops', 'cond'],
        statement: [
          { t: 'p', text: 'Un X de TAILLE lignes : sur la ligne y (de 0 à TAILLE - 1), une étoile aux colonnes y et TAILLE - 1 - y, des espaces ailleurs. On n\'écrit pas les espaces après la dernière étoile de la ligne.' },
          { t: 'code', code: '~$> ./shapes cross 5 | cat -e\n*   *$\n * *$\n  *$\n * *$\n*   *$', lang: 'sh' },
        ],
        tests: [
          { name: 'taille 5', args: ['cross', '5'], checkExit: true },
          { name: 'taille 4 (paire)', args: ['cross', '4'], checkExit: true, kind: 'limit' },
          { name: 'taille 1', args: ['cross', '1'], checkExit: true, kind: 'limit' },
        ],
      },
    ],
    starter: STARTER,
    correction: [
      { step: 0, blocks: [
        { t: 'p', text: 'Deux fonctions utilitaires : str_eq(a, b) pour comparer la forme, et parse_size(s) qui renvoie -1 si s est vide ou contient autre chose que des chiffres, sinon la valeur (en limitant pour éviter un débordement : on peut s\'arrêter dès que la valeur dépasse 50).' },
        { t: 'code', code: 'static int parse_size(char const *s)\n{\n    int n = 0;\n\n    if (*s == \'\\0\')\n        return -1;\n    for (; *s; s++) {\n        if (*s < \'0\' || *s > \'9\')\n            return -1;\n        n = n * 10 + *s - \'0\';\n        if (n > 50)\n            return -1;\n    }\n    return n;\n}', lang: 'c' },
      ] },
      { step: 1, blocks: [{ t: 'p', text: 'Une fonction put_n(c, n) qui affiche n fois le caractère c rend toutes les formes faciles : square = TAILLE fois put_n(\'*\', TAILLE) + \\n.' }] },
      { step: 2, blocks: [{ t: 'p', text: 'Ligne i (1..TAILLE) : put_n(\'*\', i).' }] },
      { step: 3, blocks: [{ t: 'p', text: 'Pour chaque case, bord si y == 0 || y == n - 1 || x == 0 || x == n - 1. C\'est exactement l\'exercice « Afficher un carré ».' }] },
      { step: 4, blocks: [{ t: 'p', text: 'put_n(\' \', n - i) puis put_n(\'*\', 2 * i - 1). Comme on n\'écrit rien après les étoiles, pas d\'espace final.' }] },
      { step: 5, blocks: [
        { t: 'p', text: 'Sur la ligne y, la dernière étoile est à la colonne max(y, n - 1 - y). On parcourt x de 0 à ce max, en écrivant \'*\' si x == y ou x == n - 1 - y.' },
      ] },
    ],
    solution: String.raw`#include <unistd.h>

static int str_eq(char const *a, char const *b)
{
    while (*a != '\0' && *a == *b) {
        a++;
        b++;
    }
    return *a == *b;
}

static int parse_size(char const *s)
{
    int n = 0;

    if (*s == '\0')
        return -1;
    while (*s != '\0') {
        if (*s < '0' || *s > '9')
            return -1;
        n = n * 10 + (*s - '0');
        if (n > 50)
            return -1;
        s++;
    }
    return n >= 1 ? n : -1;
}

static void put_n(char c, int n)
{
    while (n > 0) {
        write(1, &c, 1);
        n--;
    }
}

static void square(int n)
{
    for (int y = 0; y < n; y++) {
        put_n('*', n);
        write(1, "\n", 1);
    }
}

static void triangle(int n)
{
    for (int i = 1; i <= n; i++) {
        put_n('*', i);
        write(1, "\n", 1);
    }
}

static void frame(int n)
{
    for (int y = 0; y < n; y++) {
        for (int x = 0; x < n; x++)
            put_n(y == 0 || y == n - 1 || x == 0 || x == n - 1 ? '*' : ' ', 1);
        write(1, "\n", 1);
    }
}

static void pyramid(int n)
{
    for (int i = 1; i <= n; i++) {
        put_n(' ', n - i);
        put_n('*', 2 * i - 1);
        write(1, "\n", 1);
    }
}

static void cross(int n)
{
    int last;

    for (int y = 0; y < n; y++) {
        last = y > n - 1 - y ? y : n - 1 - y;
        for (int x = 0; x <= last; x++)
            put_n(x == y || x == n - 1 - y ? '*' : ' ', 1);
        write(1, "\n", 1);
    }
}

static int error(void)
{
    write(2, "Usage: ./shapes SHAPE SIZE\n", 27);
    return 84;
}

int main(int argc, char **argv)
{
    int n;

    if (argc != 3)
        return error();
    n = parse_size(argv[2]);
    if (n == -1)
        return error();
    if (str_eq(argv[1], "square"))
        square(n);
    else if (str_eq(argv[1], "triangle"))
        triangle(n);
    else if (str_eq(argv[1], "frame"))
        frame(n);
    else if (str_eq(argv[1], "pyramid"))
        pyramid(n);
    else if (str_eq(argv[1], "cross"))
        cross(n);
    else
        return error();
    return 0;
}
`,
    followUp: ['ex_print_line', 'ex_print_square', 'ex_print_comb', 'ex_getnbr'],
  },
  {
    id: 'exam_freq',
    title: 'freq',
    binary: 'freq',
    file: 'main.c',
    intro: [
      { t: 'p', text: 'Écris un programme `freq` qui compte les lettres et chiffres d\'un texte : `./freq TEXTE [OPTION]`.' },
      { t: 'p', text: 'Seuls les caractères alphanumériques (a-z, A-Z, 0-9) sont comptés ; les autres sont ignorés. Majuscules et minuscules sont différentes. Chaque ligne de sortie a la forme `c:N`.' },
    ],
    rules: COMMON_RULES,
    allowed: ['write', 'malloc', 'free'],
    steps: [
      {
        title: 'Arguments et erreurs',
        points: 2,
        skills: ['argv', 'errors84'],
        statement: [{ t: 'p', text: '1 ou 2 arguments. Si une option est donnée, elle doit être exactement `-a`, `-n` ou `-t`. Sinon erreur (code 84, message sur la sortie d\'erreur).' }],
        tests: [
          { name: 'aucun argument', args: [], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'trop d\'arguments', args: ['abc', '-a', 'x'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'option inconnue', args: ['abc', '-z'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'option vide', args: ['abc', ''], checkExit: true, stderr: 'any', kind: 'error' },
        ],
      },
      {
        title: 'Sans option : ordre d\'apparition',
        points: 5,
        skills: ['arrays', 'chars', 'putnbr'],
        statement: [
          { t: 'p', text: 'Affiche chaque caractère compté, dans l\'ordre de sa **première apparition**, avec son nombre d\'occurrences.' },
          { t: 'code', code: '~$> ./freq "hello, world 2"\nh:1\ne:1\nl:3\no:2\nw:1\nr:1\nd:1\n2:1', lang: 'sh' },
        ],
        tests: [
          { name: 'phrase', args: ['hello, world 2'], checkExit: true },
          { name: 'majuscules distinctes', args: ['aAaA'], checkExit: true, kind: 'limit' },
          { name: 'rien à compter', args: ['!? ,'], checkExit: true, kind: 'empty' },
          { name: 'vide', args: [''], checkExit: true, kind: 'empty' },
          { name: 'grand compte', args: ['z'.repeat(123)], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: '-a : ordre ASCII',
        points: 4,
        skills: ['arrays', 'loops'],
        statement: [
          { t: 'p', text: 'Même affichage, mais trié par ordre ASCII du caractère (chiffres, puis majuscules, puis minuscules).' },
          { t: 'code', code: '~$> ./freq "banana B12" -a\n1:1\n2:1\nB:1\na:3\nb:1\nn:2', lang: 'sh' },
        ],
        tests: [
          { name: 'banana B12', args: ['banana B12', '-a'], checkExit: true },
          { name: 'vide', args: ['', '-a'], checkExit: true, kind: 'empty' },
        ],
      },
      {
        title: '-n : par fréquence',
        points: 5,
        skills: ['arrays', 'loops'],
        statement: [
          { t: 'p', text: 'Trié par nombre d\'occurrences décroissant. En cas d\'égalité, l\'ordre de première apparition est conservé.' },
          { t: 'code', code: '~$> ./freq "abracadabra" -n\na:5\nb:2\nr:2\nc:1\nd:1', lang: 'sh' },
        ],
        tests: [
          { name: 'abracadabra', args: ['abracadabra', '-n'], checkExit: true },
          { name: 'égalités', args: ['zyx', '-n'], checkExit: true, kind: 'limit' },
          { name: 'vide', args: ['', '-n'], checkExit: true, kind: 'empty' },
        ],
      },
      {
        title: '-t : le plus fréquent',
        points: 4,
        skills: ['arrays', 'cond'],
        statement: [
          { t: 'p', text: 'Affiche seulement le caractère le plus fréquent (`c:N`). En cas d\'égalité, celui qui a le plus petit code ASCII. S\'il n\'y a rien à compter, affiche `none`.' },
          { t: 'code', code: '~$> ./freq "aabbc" -t\na:2\n~$> ./freq "!!" -t\nnone', lang: 'sh' },
        ],
        tests: [
          { name: 'égalité a/b', args: ['bbaac', '-t'], checkExit: true },
          { name: 'clair', args: ['xyzzy', '-t'], checkExit: true },
          { name: 'rien', args: ['!!', '-t'], checkExit: true, kind: 'empty' },
        ],
      },
    ],
    starter: STARTER,
    correction: [
      { step: 0, blocks: [{ t: 'p', text: 'argc vaut 2 ou 3. Avec 3, argv[2] doit être « -a », « -n » ou « -t » : compare caractère par caractère (longueur exactement 2).' }] },
      { step: 1, blocks: [
        { t: 'p', text: 'L\'outil clé est un tableau de compteurs indexé par le code du caractère : int count[128] = {0}; puis count[(int)c]++. Pour l\'ordre d\'apparition, un second tableau garde les caractères dans l\'ordre où on les découvre (quand count passe de 0 à 1).' },
        { t: 'memory', caption: 'count après "aba"', cells: [{ id: 'c97', name: "count['a'] (97)", value: '2' }, { id: 'c98', name: "count['b'] (98)", value: '1' }, { id: 'c99', name: "count['c'] (99)", value: '0' }] },
      ] },
      { step: 2, blocks: [{ t: 'p', text: 'Parcourir c de 0 à 127 et afficher ceux dont count[c] > 0 : c\'est déjà l\'ordre ASCII, aucun tri nécessaire.' }] },
      { step: 3, blocks: [{ t: 'p', text: 'Trier le tableau « ordre d\'apparition » par count décroissant avec un tri **stable** (le tri à bulles avec > strict est stable : on n\'échange jamais deux éléments égaux).' }] },
      { step: 4, blocks: [{ t: 'p', text: 'Parcourir c de 0 à 127 en gardant le meilleur avec un > strict : à égalité, le premier rencontré (plus petit code) reste.' }] },
    ],
    solution: String.raw`#include <unistd.h>

static void put_nbr(int n)
{
    char c;

    if (n >= 10)
        put_nbr(n / 10);
    c = n % 10 + '0';
    write(1, &c, 1);
}

static void put_entry(char c, int n)
{
    write(1, &c, 1);
    write(1, ":", 1);
    put_nbr(n);
    write(1, "\n", 1);
}

static int is_alnum(char c)
{
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

static int error(void)
{
    write(2, "Usage: ./freq TEXT [-a|-n|-t]\n", 30);
    return 84;
}

int main(int argc, char **argv)
{
    int count[128] = {0};
    char order[128];
    int nb = 0;
    char opt = 0;
    char tmp;
    int sorted = 0;
    int best = -1;

    if (argc != 2 && argc != 3)
        return error();
    if (argc == 3) {
        if (argv[2][0] != '-' || argv[2][1] == '\0' || argv[2][2] != '\0')
            return error();
        opt = argv[2][1];
        if (opt != 'a' && opt != 'n' && opt != 't')
            return error();
    }
    for (int i = 0; argv[1][i] != '\0'; i++) {
        char c = argv[1][i];
        if (!is_alnum(c))
            continue;
        if (count[(int)c] == 0)
            order[nb++] = c;            /* première apparition */
        count[(int)c]++;
    }
    if (opt == 0) {
        for (int i = 0; i < nb; i++)
            put_entry(order[i], count[(int)order[i]]);
    } else if (opt == 'a') {
        for (int c = 0; c < 128; c++)
            if (count[c] > 0)
                put_entry(c, count[c]);
    } else if (opt == 'n') {
        while (!sorted) {
            sorted = 1;
            for (int i = 0; i < nb - 1; i++) {
                if (count[(int)order[i]] < count[(int)order[i + 1]]) {
                    tmp = order[i];
                    order[i] = order[i + 1];
                    order[i + 1] = tmp;
                    sorted = 0;
                }
            }
        }
        for (int i = 0; i < nb; i++)
            put_entry(order[i], count[(int)order[i]]);
    } else {
        for (int c = 0; c < 128; c++)
            if (count[c] > 0 && (best == -1 || count[c] > count[best]))
                best = c;
        if (best == -1)
            write(1, "none\n", 5);
        else
            put_entry(best, count[best]);
    }
    return 0;
}
`,
    followUp: ['ex_count_char', 'ex_array_max', 'ex_sort_int_array', 'ex_put_nbr'],
  },
  {
    id: 'exam_nbconv',
    title: 'nbconv',
    binary: 'nbconv',
    file: 'main.c',
    intro: [
      { t: 'p', text: 'Écris un programme `nbconv` qui écrit un nombre dans une autre base : `./nbconv NOMBRE BASE`, suivi d\'un retour à la ligne.' },
      { t: 'p', text: 'NOMBRE est valide s\'il est formé d\'un `-` optionnel suivi d\'au moins un chiffre, sans rien d\'autre, et s\'il tient dans un int.' },
    ],
    rules: COMMON_RULES,
    allowed: ['write', 'malloc', 'free'],
    steps: [
      {
        title: 'Arguments et validation',
        points: 4,
        skills: ['argv', 'errors84', 'getnbr'],
        statement: [
          { t: 'p', text: 'Exactement 2 arguments, NOMBRE valide (voir ci-dessus). Sinon erreur, code 84. Les bases valides sont décrites dans les étapes suivantes ; une base invalide est aussi une erreur.' },
          { t: 'code', code: '~$> ./nbconv 12a bin ; echo $?\nnbconv: invalid number\n84\n~$> ./nbconv 2147483648 bin ; echo $?\nnbconv: invalid number\n84', lang: 'sh' },
        ],
        tests: [
          { name: 'aucun argument', args: [], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'nombre avec lettre', args: ['12a', 'bin'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'signe seul', args: ['-', 'bin'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'signe +', args: ['+5', 'bin'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'trop grand', args: ['2147483648', 'bin'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'vide', args: ['', 'bin'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'base trop courte', args: ['5', 'x'], checkExit: true, stderr: 'any', kind: 'error' },
        ],
      },
      {
        title: 'bin',
        points: 4,
        skills: ['bases', 'putnbr'],
        statement: [{ t: 'code', code: '~$> ./nbconv 10 bin\n1010\n~$> ./nbconv 0 bin\n0', lang: 'sh' }],
        tests: [
          { name: '10', args: ['10', 'bin'], checkExit: true },
          { name: '0', args: ['0', 'bin'], checkExit: true, kind: 'limit' },
          { name: '255', args: ['255', 'bin'], checkExit: true },
          { name: 'zéros devant', args: ['007', 'bin'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'oct et hex',
        points: 4,
        skills: ['bases'],
        statement: [
          { t: 'p', text: '`oct` : base 8. `hex` : base 16 avec les chiffres `0123456789ABCDEF` (majuscules).' },
          { t: 'code', code: '~$> ./nbconv 255 hex\nFF\n~$> ./nbconv 64 oct\n100', lang: 'sh' },
        ],
        tests: [
          { name: '255 hex', args: ['255', 'hex'], checkExit: true },
          { name: '64 oct', args: ['64', 'oct'], checkExit: true },
          { name: 'INT_MAX hex', args: ['2147483647', 'hex'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'Nombres négatifs',
        points: 4,
        skills: ['bases', 'putnbr'],
        statement: [
          { t: 'p', text: 'Un nombre négatif s\'écrit `-` suivi de la conversion de sa valeur absolue.' },
          { t: 'code', code: '~$> ./nbconv -10 bin\n-1010\n~$> ./nbconv -2147483648 hex\n-80000000', lang: 'sh' },
        ],
        tests: [
          { name: '-10 bin', args: ['-10', 'bin'], checkExit: true },
          { name: 'INT_MIN hex', args: ['-2147483648', 'hex'], checkExit: true, kind: 'limit' },
          { name: '-0', args: ['-0', 'oct'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'Base personnalisée',
        points: 4,
        skills: ['bases', 'strings'],
        statement: [
          { t: 'p', text: 'Toute autre BASE de 2 caractères ou plus, sans caractère en double et sans `-`, est utilisée comme liste de symboles (comme my_putnbr_base). Sinon : erreur 84.' },
          { t: 'code', code: '~$> ./nbconv 42 poneyvif\nvn\n~$> ./nbconv 5 aa ; echo $?\nnbconv: invalid base\n84', lang: 'sh' },
        ],
        tests: [
          { name: 'poneyvif', args: ['42', 'poneyvif'], checkExit: true },
          { name: 'base 3', args: ['-8', 'abc'], checkExit: true },
          { name: 'doublon', args: ['5', 'aa'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'contient -', args: ['5', '0-1'], checkExit: true, stderr: 'any', kind: 'error' },
        ],
      },
    ],
    starter: STARTER,
    correction: [
      { step: 0, blocks: [
        { t: 'p', text: 'Valider avant de convertir : un - optionnel, puis au moins un chiffre, puis rien d\'autre. Accumuler dans un long et s\'arrêter dès que la valeur dépasse 2147483648 (cas négatif) ou 2147483647 (positif).' },
      ] },
      { step: 1, blocks: [{ t: 'p', text: 'bin, oct, hex et la base personnalisée sont le même problème : choisir la chaîne de symboles ("01", "01234567", "0123456789ABCDEF" ou argv[2]) puis appeler une seule fonction my_putnbr_base.' }] },
      { step: 2, blocks: [{ t: 'p', text: 'Voir étape 2 : seule la chaîne de symboles change.' }] },
      { step: 3, blocks: [{ t: 'p', text: 'Travailler sur un long : -(-2147483648) tient dans un long. Afficher \'-\' puis la valeur absolue. Attention, -0 vaut 0 : pas de signe.' }] },
      { step: 4, blocks: [{ t: 'p', text: 'Une base est valide si sa longueur ≥ 2, qu\'elle ne contient pas \'-\' et qu\'aucun caractère n\'apparaît deux fois (double boucle i < j).' }] },
    ],
    solution: String.raw`#include <unistd.h>

static int len_of(char const *s)
{
    int n = 0;

    while (s[n] != '\0')
        n++;
    return n;
}

static int str_eq(char const *a, char const *b)
{
    while (*a != '\0' && *a == *b) {
        a++;
        b++;
    }
    return *a == *b;
}

static int error(char const *msg)
{
    write(2, msg, len_of(msg));
    return 84;
}

static int parse(char const *s, long *out)
{
    int neg = 0;
    long r = 0;

    if (*s == '-') {
        neg = 1;
        s++;
    }
    if (*s == '\0')
        return 0;
    while (*s != '\0') {
        if (*s < '0' || *s > '9')
            return 0;
        r = r * 10 + (*s - '0');
        if (r > 2147483648)
            return 0;
        s++;
    }
    if (!neg && r > 2147483647)
        return 0;
    *out = neg ? -r : r;
    return 1;
}

static int valid_base(char const *b)
{
    int len = len_of(b);

    if (len < 2)
        return 0;
    for (int i = 0; i < len; i++) {
        if (b[i] == '-')
            return 0;
        for (int j = i + 1; j < len; j++)
            if (b[i] == b[j])
                return 0;
    }
    return 1;
}

static void put_base(long n, char const *base, int len)
{
    if (n >= len)
        put_base(n / len, base, len);
    write(1, &base[n % len], 1);
}

int main(int argc, char **argv)
{
    long n;
    char const *base;

    if (argc != 3)
        return error("Usage: ./nbconv NUMBER BASE\n");
    if (!parse(argv[1], &n))
        return error("nbconv: invalid number\n");
    if (str_eq(argv[2], "bin"))
        base = "01";
    else if (str_eq(argv[2], "oct"))
        base = "01234567";
    else if (str_eq(argv[2], "hex"))
        base = "0123456789ABCDEF";
    else if (valid_base(argv[2]))
        base = argv[2];
    else
        return error("nbconv: invalid base\n");
    if (n < 0) {
        write(1, "-", 1);
        n = -n;
    }
    put_base(n, base, len_of(base));
    write(1, "\n", 1);
    return 0;
}
`,
    followUp: ['ex_putnbr_base', 'ex_getnbr', 'ex_put_nbr', 'ex_showstr'],
  },
  {
    id: 'exam_calc',
    title: 'calc',
    binary: 'calc',
    file: 'main.c',
    intro: [
      { t: 'p', text: 'Écris un programme `calc` qui calcule une expression donnée en **un seul argument** : `./calc "EXPRESSION"`, puis affiche le résultat suivi d\'un retour à la ligne.' },
      { t: 'p', text: 'Un nombre est une suite de chiffres, éventuellement précédée d\'un `-`. Les opérateurs sont `+ - * / %`. Tous les calculs tiennent dans un int.' },
    ],
    rules: COMMON_RULES,
    allowed: ['write', 'malloc', 'free'],
    steps: [
      {
        title: 'Arguments et nombre seul',
        points: 3,
        skills: ['argv', 'errors84', 'getnbr'],
        statement: [
          { t: 'p', text: 'Exactement 1 argument, sinon erreur 84. Une expression qui est juste un nombre s\'affiche telle quelle (sans zéros inutiles). Une expression vide est une erreur.' },
          { t: 'code', code: '~$> ./calc "42"\n42\n~$> ./calc "007"\n7', lang: 'sh' },
        ],
        tests: [
          { name: 'aucun argument', args: [], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'deux arguments', args: ['1', '2'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: 'vide', args: [''], checkExit: true, stderr: 'any', kind: 'error' },
          { name: '"42"', args: ['42'], checkExit: true },
          { name: '"007"', args: ['007'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'Addition et soustraction',
        points: 4,
        skills: ['getnbr', 'putnbr'],
        statement: [{ t: 'code', code: '~$> ./calc "12+30"\n42\n~$> ./calc "5-8"\n-3', lang: 'sh' }],
        tests: [
          { name: '12+30', args: ['12+30'], checkExit: true },
          { name: '5-8', args: ['5-8'], checkExit: true },
          { name: '0+0', args: ['0+0'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'Multiplication, division, modulo',
        points: 4,
        skills: ['getnbr', 'cond'],
        statement: [
          { t: 'p', text: 'Division entière (comme en C). Division ou modulo par 0 : erreur 84.' },
          { t: 'code', code: '~$> ./calc "6*7"\n42\n~$> ./calc "7/2"\n3\n~$> ./calc "1/0" ; echo $?\ncalc: division by zero\n84', lang: 'sh' },
        ],
        tests: [
          { name: '6*7', args: ['6*7'], checkExit: true },
          { name: '7/2', args: ['7/2'], checkExit: true },
          { name: '17%5', args: ['17%5'], checkExit: true },
          { name: '1/0', args: ['1/0'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: '1%0', args: ['1%0'], checkExit: true, stderr: 'any', kind: 'error' },
        ],
      },
      {
        title: 'Nombres négatifs et espaces',
        points: 4,
        skills: ['getnbr', 'strings'],
        statement: [
          { t: 'p', text: 'Les espaces sont ignorés partout. Un `-` qui suit un opérateur (ou est au début) fait partie du nombre.' },
          { t: 'code', code: '~$> ./calc " -5 * -3 "\n15\n~$> ./calc "10--2"\n12', lang: 'sh' },
        ],
        tests: [
          { name: ' -5 * -3 ', args: [' -5 * -3 '], checkExit: true },
          { name: '10--2', args: ['10--2'], checkExit: true },
          { name: '-7/2', args: ['-7/2'], checkExit: true, kind: 'limit' },
        ],
      },
      {
        title: 'Chaînes d\'opérations et erreurs de syntaxe',
        points: 5,
        skills: ['getnbr', 'loops', 'errors84'],
        statement: [
          { t: 'p', text: 'Plusieurs opérations sont calculées **de gauche à droite**, sans priorité : "1+2*3" vaut 9. Toute expression mal formée (opérateur manquant ou en trop, caractère inconnu) est une erreur 84.' },
          { t: 'code', code: '~$> ./calc "1+2*3"\n9\n~$> ./calc "2+" ; echo $?\ncalc: syntax error\n84', lang: 'sh' },
        ],
        tests: [
          { name: '1+2*3', args: ['1+2*3'], checkExit: true },
          { name: '100/10/5-1', args: ['100/10/5-1'], checkExit: true },
          { name: '2+', args: ['2+'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: '2 3', args: ['2 3'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: '4x2', args: ['4x2'], checkExit: true, stderr: 'any', kind: 'error' },
          { name: '*3', args: ['*3'], checkExit: true, stderr: 'any', kind: 'error' },
        ],
      },
    ],
    starter: STARTER,
    correction: [
      { step: 0, blocks: [{ t: 'p', text: 'Écrire une fonction read_number(char const *s, int *i, long *out) qui lit un nombre à partir de la position *i (signe - optionnel puis chiffres), avance *i, et renvoie 0 s\'il n\'y a pas de chiffre. Tout le sujet repose sur elle.' }] },
      { step: 1, blocks: [{ t: 'p', text: 'Lire un nombre, puis tant qu\'il reste un opérateur : lire l\'opérateur, lire le nombre suivant, appliquer. Pour l\'étape 2, seuls + et - sont nécessaires.' }] },
      { step: 2, blocks: [{ t: 'p', text: 'Ajouter * / %, en vérifiant le zéro AVANT de diviser.' }] },
      { step: 3, blocks: [{ t: 'p', text: 'Sauter les espaces avant chaque lecture (nombre ou opérateur). Le - après un opérateur est lu par read_number.' }] },
      { step: 4, blocks: [{ t: 'p', text: 'La boucle « opérateur puis nombre » donne naturellement le calcul de gauche à droite. Si après un nombre on trouve autre chose qu\'un opérateur ou la fin : erreur. Si après un opérateur on ne trouve pas de nombre : erreur.' }] },
    ],
    solution: String.raw`#include <unistd.h>

static int len_of(char const *s)
{
    int n = 0;

    while (s[n] != '\0')
        n++;
    return n;
}

static int error(char const *msg)
{
    write(2, msg, len_of(msg));
    return 84;
}

static void put_nbr(long n)
{
    char c;

    if (n < 0) {
        write(1, "-", 1);
        n = -n;
    }
    if (n >= 10)
        put_nbr(n / 10);
    c = n % 10 + '0';
    write(1, &c, 1);
}

static void skip_spaces(char const *s, int *i)
{
    while (s[*i] == ' ')
        (*i)++;
}

static int read_number(char const *s, int *i, long *out)
{
    int neg = 0;
    long r = 0;
    int digits = 0;

    skip_spaces(s, i);
    if (s[*i] == '-') {
        neg = 1;
        (*i)++;
    }
    while (s[*i] >= '0' && s[*i] <= '9') {
        r = r * 10 + (s[*i] - '0');
        (*i)++;
        digits++;
    }
    *out = neg ? -r : r;
    return digits > 0;
}

static int is_op(char c)
{
    return c == '+' || c == '-' || c == '*' || c == '/' || c == '%';
}

int main(int argc, char **argv)
{
    char const *s;
    int i = 0;
    long acc;
    long b;
    char op;

    if (argc != 2)
        return error("Usage: ./calc EXPRESSION\n");
    s = argv[1];
    if (!read_number(s, &i, &acc))
        return error("calc: syntax error\n");
    skip_spaces(s, &i);
    while (s[i] != '\0') {
        if (!is_op(s[i]))
            return error("calc: syntax error\n");
        op = s[i];
        i++;
        if (!read_number(s, &i, &b))
            return error("calc: syntax error\n");
        if ((op == '/' || op == '%') && b == 0)
            return error(op == '/' ? "calc: division by zero\n" : "calc: modulo by zero\n");
        if (op == '+')
            acc = acc + b;
        else if (op == '-')
            acc = acc - b;
        else if (op == '*')
            acc = acc * b;
        else if (op == '/')
            acc = acc / b;
        else
            acc = acc % b;
        skip_spaces(s, &i);
    }
    put_nbr(acc);
    write(1, "\n", 1);
    return 0;
}
`,
    followUp: ['ex_do_op', 'ex_getnbr', 'ex_put_nbr'],
  },
];

export const exam = (id: string) => EXAMS.find((e) => e.id === id);
