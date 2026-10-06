import type { CodeExercise } from '../types';

const PUTCHAR_DECL = 'void my_putchar(char c);\n';

// ---------------------------------------------------------------- complements (bases)

export const BASICS: CodeExercise[] = [
  {
    id: 'ex_print_line',
    title: 'Afficher une ligne de n étoiles',
    skills: ['loops', 'chars'],
    level: 1,
    kind: 'function',
    relation: 'complement',
    minutes: 8,
    statement: [
      { t: 'p', text: 'Écris une fonction qui affiche `n` fois le caractère `*`, puis un retour à la ligne `\\n`. Si `n` vaut 0 ou est négatif, elle affiche seulement le retour à la ligne. Elle renvoie 0.' },
      { t: 'code', code: 'my_print_line(4);   /* affiche ****$ */\nmy_print_line(0);   /* affiche $ */', lang: 'c', caption: 'Le $ représente le \\n, comme avec cat -e.' },
    ],
    file: 'my_print_line.c',
    prototype: 'int my_print_line(int n);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_print_line(int n)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'n = 4', code: 'my_print_line(4);', kind: 'normal' },
      { name: 'n = 1', code: 'my_print_line(1);', kind: 'limit' },
      { name: 'n = 0', code: 'my_print_line(0);', kind: 'empty' },
      { name: 'n = -3', code: 'my_print_line(-3);', kind: 'limit' },
      { name: 'valeur de retour', code: 'tst_int(my_print_line(2));', kind: 'normal' },
    ],
    hints: [
      'Il faut répéter une action (afficher une étoile) un nombre de fois connu : n. Ensuite, une seule fois, afficher \\n.',
      'Une variable compteur i qui part de 0 et avance tant que i < n. Si n ≤ 0, la condition i < n est fausse dès le départ : la boucle ne tourne pas, c\'est exactement ce qu\'on veut.',
      '1) déclarer int i = 0 ; 2) while (i < n) : afficher \'*\' puis i++ ; 3) après la boucle, afficher \'\\n\' ; 4) return 0.',
      'int my_print_line(int n)\n{\n    int i = 0;\n\n    while (i < n) {\n        /* afficher une étoile */\n        /* avancer le compteur */\n    }\n    /* retour à la ligne */\n    return 0;\n}',
    ],
    solution: String.raw`void my_putchar(char c);

int my_print_line(int n)
{
    int i = 0;

    while (i < n) {          /* tourne exactement n fois (0 fois si n <= 0) */
        my_putchar('*');
        i++;                 /* sans cette ligne : boucle infinie */
    }
    my_putchar('\n');
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Pas besoin de cas spécial pour n ≤ 0 : la condition `i < n` est fausse dès le premier test.' }],
    pitfalls: ['Oublier i++ → boucle infinie.', 'Écrire `i <= n` → une étoile de trop.', 'Afficher \\n dans la boucle au lieu d\'après.'],
    prereqs: ['loops', 'chars'],
  },
  {
    id: 'ex_print_square',
    title: 'Afficher un carré',
    skills: ['loops', 'chars'],
    level: 2,
    kind: 'function',
    relation: 'complement',
    minutes: 12,
    statement: [
      { t: 'p', text: 'Écris une fonction qui affiche un carré de `size` lignes et `size` colonnes. Les bords sont faits de `#` et l\'intérieur d\'espaces. Chaque ligne se termine par `\\n`. Si `size` ≤ 0, rien n\'est affiché. Renvoie 0.' },
      { t: 'code', code: 'my_print_square(4);\n####\n#  #\n#  #\n####', lang: 'text' },
      { t: 'p', text: 'Pour `size = 1` : une seule ligne `#`.' },
    ],
    file: 'my_print_square.c',
    prototype: 'int my_print_square(int size);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_print_square(int size)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'size = 4', code: 'my_print_square(4);', kind: 'normal' },
      { name: 'size = 5', code: 'my_print_square(5);', kind: 'normal' },
      { name: 'size = 1', code: 'my_print_square(1);', kind: 'limit' },
      { name: 'size = 2', code: 'my_print_square(2);', kind: 'limit' },
      { name: 'size = 0', code: 'my_print_square(0);', kind: 'empty' },
      { name: 'size = -2', code: 'my_print_square(-2);', kind: 'limit' },
    ],
    hints: [
      'Un carré = des lignes, et chaque ligne = des colonnes. Pour chaque case (ligne, colonne), on décide : # ou espace.',
      'Deux boucles imbriquées : y pour la ligne, x pour la colonne. Une case est un bord si y vaut 0 ou size-1, ou si x vaut 0 ou size-1.',
      '1) y = 0 ; tant que y < size : 2) x = 0 ; tant que x < size : afficher \'#\' si bord sinon \' \' ; x++ ; 3) après la boucle des x, afficher \\n ; y++.',
      'int y = 0;\nint x;\n\nwhile (y < size) {\n    x = 0;\n    while (x < size) {\n        if (/* bord ? */)\n            my_putchar(\'#\');\n        else\n            my_putchar(\' \');\n        x++;\n    }\n    my_putchar(\'\\n\');\n    y++;\n}',
    ],
    solution: String.raw`void my_putchar(char c);

int my_print_square(int size)
{
    int y = 0;
    int x;

    while (y < size) {
        x = 0;                          /* on remet x à 0 à chaque ligne ! */
        while (x < size) {
            if (y == 0 || y == size - 1 || x == 0 || x == size - 1)
                my_putchar('#');        /* bord */
            else
                my_putchar(' ');        /* intérieur */
            x++;
        }
        my_putchar('\n');
        y++;
    }
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Erreur classique : initialiser x une seule fois avant les deux boucles. Après la première ligne, x vaut déjà size et les lignes suivantes sont vides.' }],
    pitfalls: ['Ne pas remettre x à 0 pour chaque ligne.', 'Confondre size et size - 1 pour le dernier bord.'],
    prereqs: ['loops', 'cond'],
  },
  {
    id: 'ex_max3',
    title: 'Le plus grand de trois nombres',
    skills: ['cond', 'functions'],
    level: 1,
    kind: 'function',
    relation: 'complement',
    minutes: 6,
    statement: [{ t: 'p', text: 'Écris une fonction qui renvoie le plus grand des trois entiers reçus. Elle n\'affiche rien.' }],
    file: 'my_max3.c',
    prototype: 'int my_max3(int a, int b, int c);',
    allowed: [],
    starter: 'int my_max3(int a, int b, int c)\n{\n    return 0;\n}\n',
    tests: [
      { name: '(1, 2, 3)', code: 'tst_int(my_max3(1, 2, 3));' },
      { name: '(3, 2, 1)', code: 'tst_int(my_max3(3, 2, 1));' },
      { name: '(2, 9, 4)', code: 'tst_int(my_max3(2, 9, 4));' },
      { name: 'égalités (5, 5, 5)', code: 'tst_int(my_max3(5, 5, 5));', kind: 'limit' },
      { name: 'négatifs (-7, -2, -9)', code: 'tst_int(my_max3(-7, -2, -9));', kind: 'limit' },
    ],
    hints: [
      'Il faut renvoyer (return) une valeur, pas l\'afficher.',
      'Garde « le plus grand vu jusqu\'ici » dans une variable max, puis compare-la aux autres.',
      '1) max = a ; 2) si b > max, max = b ; 3) si c > max, max = c ; 4) return max.',
      'int max = a;\n\nif (b > max)\n    max = b;\n/* même chose pour c */\nreturn max;',
    ],
    solution: String.raw`int my_max3(int a, int b, int c)
{
    int max = a;    /* hypothèse de départ : a est le plus grand */

    if (b > max)
        max = b;
    if (c > max)
        max = c;
    return max;
}
`,
    solutionNotes: [{ t: 'p', text: 'Initialiser max à 0 serait faux avec trois nombres négatifs : on renverrait 0, qui n\'est même pas dans la liste.' }],
    pitfalls: ['Initialiser max à 0 (faux avec des négatifs).', 'Utiliser else if et oublier un cas.'],
    prereqs: ['cond', 'functions'],
  },
  {
    id: 'ex_sum_to_n',
    title: 'Somme de 1 à n',
    skills: ['loops', 'functions'],
    level: 1,
    kind: 'function',
    relation: 'complement',
    minutes: 6,
    statement: [{ t: 'p', text: 'Écris une fonction qui renvoie 1 + 2 + … + n. Si n ≤ 0, elle renvoie 0.' }],
    file: 'my_sum_to_n.c',
    prototype: 'int my_sum_to_n(int n);',
    allowed: [],
    starter: 'int my_sum_to_n(int n)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'n = 4', code: 'tst_int(my_sum_to_n(4));' },
      { name: 'n = 10', code: 'tst_int(my_sum_to_n(10));' },
      { name: 'n = 1', code: 'tst_int(my_sum_to_n(1));', kind: 'limit' },
      { name: 'n = 0', code: 'tst_int(my_sum_to_n(0));', kind: 'empty' },
      { name: 'n = -5', code: 'tst_int(my_sum_to_n(-5));', kind: 'limit' },
    ],
    hints: [
      'On additionne tous les entiers de 1 jusqu\'à n compris.',
      'Une variable sum qui commence à 0, et un compteur i qui va de 1 à n.',
      '1) sum = 0, i = 1 ; 2) tant que i <= n : sum = sum + i ; i++ ; 3) return sum.',
      'int sum = 0;\nint i = 1;\n\nwhile (i <= n) {\n    /* ajouter i à sum */\n    i++;\n}\nreturn sum;',
    ],
    solution: String.raw`int my_sum_to_n(int n)
{
    int sum = 0;
    int i = 1;

    while (i <= n) {    /* si n <= 0, on n'entre jamais : sum reste 0 */
        sum += i;
        i++;
    }
    return sum;
}
`,
    solutionNotes: [{ t: 'p', text: 'Une variable locale non initialisée (int sum;) contient une valeur indéterminée : toujours l\'initialiser.' }],
    pitfalls: ['Oublier d\'initialiser sum à 0.', 'Utiliser i < n et oublier n.'],
    prereqs: ['loops'],
  },
  {
    id: 'ex_count_digits',
    title: 'Compter les chiffres d\'un nombre',
    skills: ['loops', 'vars'],
    level: 2,
    kind: 'function',
    relation: 'complement',
    minutes: 10,
    statement: [
      { t: 'p', text: 'Écris une fonction qui renvoie le nombre de chiffres de `nb` (le signe ne compte pas). `0` a 1 chiffre.' },
      { t: 'code', code: 'my_count_digits(42)     -> 2\nmy_count_digits(-1500)  -> 4\nmy_count_digits(0)      -> 1', lang: 'text' },
    ],
    file: 'my_count_digits.c',
    prototype: 'int my_count_digits(int nb);',
    allowed: [],
    starter: 'int my_count_digits(int nb)\n{\n    return 0;\n}\n',
    tests: [
      { name: '42', code: 'tst_int(my_count_digits(42));' },
      { name: '-1500', code: 'tst_int(my_count_digits(-1500));' },
      { name: '0', code: 'tst_int(my_count_digits(0));', kind: 'limit' },
      { name: '7', code: 'tst_int(my_count_digits(7));', kind: 'limit' },
      { name: '2147483647', code: 'tst_int(my_count_digits(2147483647));', kind: 'limit' },
      { name: '-2147483648', code: 'tst_int(my_count_digits(-2147483647 - 1));', kind: 'limit' },
    ],
    hints: [
      'Combien de fois peut-on diviser le nombre par 10 avant d\'arriver à 0 ?',
      'nb / 10 enlève le dernier chiffre (42 / 10 = 4). Compte les divisions. Attention : 0 doit donner 1, donc on fait au moins un tour (do … while).',
      '1) count = 0 ; 2) faire : nb = nb / 10 ; count++ ; tant que nb != 0 ; 3) return count. Pas besoin de rendre nb positif : -15 / 10 = -1 en C, on arrive aussi à 0.',
      'int count = 0;\n\ndo {\n    nb = nb / 10;\n    count++;\n} while (/* ? */);\nreturn count;',
    ],
    solution: String.raw`int my_count_digits(int nb)
{
    int count = 0;

    do {
        nb = nb / 10;   /* enlève le dernier chiffre ; marche aussi pour les négatifs */
        count++;
    } while (nb != 0);  /* do-while : au moins un tour, donc 0 -> 1 */
    return count;
}
`,
    solutionNotes: [
      { t: 'p', text: 'Si tu fais `nb = -nb` pour rendre le nombre positif, -2147483648 déborde (il n\'existe pas de +2147483648 en int) : comportement indéfini. Diviser directement évite le problème, car en C la division entière tronque vers 0 (-15 / 10 vaut -1).' },
    ],
    pitfalls: ['while au lieu de do-while : 0 renvoie 0.', 'Rendre nb positif avec -nb : débordement pour INT_MIN.'],
    prereqs: ['loops', 'vars'],
  },
  // ---------------------------------------------------------------- Day 03
  {
    id: 'ex_print_alpha',
    title: 'my_print_alpha',
    skills: ['chars', 'loops'],
    level: 1,
    kind: 'function',
    source: { day: 'd03', section: 'Task 01 - my_print_alpha', page: 3 },
    relation: 'reproduces',
    minutes: 8,
    statement: [
      { t: 'p', text: 'Écris une fonction qui, en commençant par `a`, affiche l\'alphabet minuscule dans l\'ordre croissant, sur une seule ligne.' },
      { t: 'note', kind: 'pdf', text: 'Le PDF ne précise pas la valeur de retour ni s\'il faut un \\n final. Ici, les tests attendent `abcdefghijklmnopqrstuvwxyz` puis `\\n`, et un retour de 0 (convention de la piscine). Vérifie avec ton sujet et la moulinette.' },
    ],
    file: 'my_print_alpha.c',
    prototype: 'int my_print_alpha(void);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_print_alpha(void)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'affichage', code: 'my_print_alpha();' },
      { name: 'valeur de retour', code: 'tst_nl();\ntst_int(my_print_alpha());' },
    ],
    hints: [
      'Afficher les 26 lettres l\'une après l\'autre, de \'a\' à \'z\', puis un \\n.',
      'Un char est un nombre : \'a\' vaut 97, \'b\' 98… On peut donc faire une boucle sur une variable char qui va de \'a\' à \'z\'.',
      '1) char c = \'a\' ; 2) tant que c <= \'z\' : my_putchar(c) ; c++ ; 3) my_putchar(\'\\n\') ; 4) return 0.',
      'char c = \'a\';\n\nwhile (c <= \'z\') {\n    my_putchar(c);\n    /* lettre suivante */\n}\n/* retour à la ligne */\nreturn 0;',
    ],
    solution: String.raw`void my_putchar(char c);

int my_print_alpha(void)
{
    char c = 'a';

    while (c <= 'z') {      /* 'a' = 97 ... 'z' = 122 */
        my_putchar(c);
        c++;                /* passe à la lettre suivante */
    }
    my_putchar('\n');
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Aucun tableau ni chaîne : c\'est imposé par le Day 03. On s\'appuie uniquement sur le fait que les lettres se suivent dans la table ASCII.' }],
    pitfalls: ['Écrire my_putchar("a") (chaîne) au lieu de my_putchar(\'a\') (caractère).', 'Écrire c < \'z\' et oublier le z.'],
    prereqs: ['chars', 'loops'],
  },
  {
    id: 'ex_print_revalpha',
    title: 'my_print_revalpha',
    skills: ['chars', 'loops'],
    level: 1,
    kind: 'function',
    source: { day: 'd03', section: 'Task 02 - my_print_revalpha', page: 3 },
    relation: 'reproduces',
    minutes: 5,
    statement: [
      { t: 'p', text: 'Écris une fonction qui, en commençant par `z`, affiche l\'alphabet minuscule en ordre décroissant, sur une seule ligne (tests : suivi de `\\n`, retour 0).' },
    ],
    file: 'my_print_revalpha.c',
    prototype: 'int my_print_revalpha(void);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_print_revalpha(void)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'affichage', code: 'my_print_revalpha();' },
      { name: 'valeur de retour', code: 'tst_nl();\ntst_int(my_print_revalpha());' },
    ],
    hints: [
      'Même chose que my_print_alpha, mais à l\'envers.',
      'Commence à \'z\' et décrémente (c--) tant que c >= \'a\'.',
      '1) c = \'z\' ; 2) tant que c >= \'a\' : afficher, c-- ; 3) \\n ; 4) return 0.',
      'char c = \'z\';\n\nwhile (c >= \'a\') {\n    my_putchar(c);\n    c--;\n}',
    ],
    solution: String.raw`void my_putchar(char c);

int my_print_revalpha(void)
{
    char c = 'z';

    while (c >= 'a') {
        my_putchar(c);
        c--;
    }
    my_putchar('\n');
    return 0;
}
`,
    solutionNotes: [],
    pitfalls: ['Condition c > \'a\' : le a manque.'],
    prereqs: ['chars', 'loops'],
  },
  {
    id: 'ex_print_digits',
    title: 'my_print_digits',
    skills: ['chars', 'loops'],
    level: 1,
    kind: 'function',
    source: { day: 'd03', section: 'Task 03 - my_print_digits', page: 3 },
    relation: 'reproduces',
    minutes: 5,
    statement: [{ t: 'p', text: 'Écris une fonction qui affiche tous les chiffres, sur une seule ligne, dans l\'ordre croissant (tests : `0123456789` puis `\\n`, retour 0).' }],
    file: 'my_print_digits.c',
    prototype: 'int my_print_digits(void);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_print_digits(void)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'affichage', code: 'my_print_digits();' },
      { name: 'valeur de retour', code: 'tst_nl();\ntst_int(my_print_digits());' },
    ],
    hints: [
      'Afficher les caractères \'0\' à \'9\'.',
      'Attention : my_putchar(0) n\'affiche pas le chiffre 0 (c\'est le caractère nul). Il faut le caractère \'0\' (code 48).',
      'Boucle sur char c de \'0\' à \'9\'.',
      'char c = \'0\';\n\nwhile (c <= \'9\') {\n    my_putchar(c);\n    c++;\n}',
    ],
    solution: String.raw`void my_putchar(char c);

int my_print_digits(void)
{
    char c = '0';           /* le caractère '0' vaut 48, pas 0 */

    while (c <= '9') {
        my_putchar(c);
        c++;
    }
    my_putchar('\n');
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Variante utile pour la suite : `my_putchar(i + \'0\')` avec un int i de 0 à 9 transforme un chiffre en caractère.' }],
    pitfalls: ['my_putchar(i) avec i de 0 à 9 : affiche des caractères invisibles.'],
    prereqs: ['chars'],
  },
  {
    id: 'ex_isneg',
    title: 'my_isneg',
    skills: ['cond'],
    level: 1,
    kind: 'function',
    source: { day: 'd03', section: 'Task 04 - my_isneg', page: 3 },
    relation: 'reproduces',
    minutes: 5,
    statement: [{ t: 'p', text: 'Écris une fonction qui affiche `N` si l\'entier reçu est négatif, ou `P` s\'il est positif ou nul (tests : la lettre puis `\\n`, retour 0).' }],
    file: 'my_isneg.c',
    prototype: 'int my_isneg(int n);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_isneg(int n)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'n = 21', code: 'my_isneg(21);' },
      { name: 'n = -21', code: 'my_isneg(-21);' },
      { name: 'n = 0', code: 'my_isneg(0);', kind: 'limit' },
      { name: 'n = -2147483648', code: 'my_isneg(-2147483647 - 1);', kind: 'limit' },
      { name: 'retour', code: 'tst_int(my_isneg(5));' },
    ],
    hints: [
      'Deux cas seulement : négatif → N, sinon → P. 0 est dans « sinon ».',
      'if (n < 0) … else …',
      '1) si n < 0 : afficher \'N\' ; sinon : afficher \'P\' ; 2) afficher \\n ; 3) return 0.',
      'if (n < 0)\n    my_putchar(\'N\');\nelse\n    my_putchar(\'P\');',
    ],
    solution: String.raw`void my_putchar(char c);

int my_isneg(int n)
{
    if (n < 0)
        my_putchar('N');
    else
        my_putchar('P');    /* 0 est « positif ou nul » */
    my_putchar('\n');
    return 0;
}
`,
    solutionNotes: [],
    pitfalls: ['Écrire if (n <= 0) : 0 afficherait N.', 'Écrire if (n = 0) : affectation, pas comparaison.'],
    prereqs: ['cond'],
  },
  {
    id: 'ex_print_comb',
    title: 'my_print_comb',
    skills: ['loops', 'chars'],
    level: 2,
    kind: 'function',
    source: { day: 'd03', section: 'Task 05 - my_print_comb', page: 4 },
    relation: 'reproduces',
    minutes: 20,
    statement: [
      { t: 'p', text: 'Affiche, en ordre croissant, tous les nombres composés de trois chiffres différents, en ne gardant que le plus petit (012, 013, …, 789). Séparateur : `, `. Pas de séparateur après 789.' },
      { t: 'code', code: '012, 013, 014, 015, 016, 017, 018, 019, 023, ..., 789', lang: 'text' },
      { t: 'note', kind: 'pdf', text: 'Les tests attendent un \\n après 789 et un retour 0 (le PDF ne le précise pas).' },
    ],
    file: 'my_print_comb.c',
    prototype: 'int my_print_comb(void);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_print_comb(void)\n{\n    return 0;\n}\n',
    tests: [{ name: 'affichage complet', code: 'my_print_comb();' }, { name: 'retour', code: 'tst_nl();\ntst_int(my_print_comb());', kind: 'limit' }],
    hints: [
      '« Le plus petit nombre formé par trois chiffres différents » = les chiffres sont strictement croissants : a < b < c.',
      'Trois boucles imbriquées : a de 0 à 7, b de a+1 à 8, c de b+1 à 9. Le dernier nombre est 789 : c\'est là qu\'on n\'affiche pas « , ».',
      '1) boucle a ; 2) boucle b à partir de a+1 ; 3) boucle c à partir de b+1 ; 4) afficher a+\'0\', b+\'0\', c+\'0\' ; 5) si ce n\'est pas 789 (a != 7), afficher \',\' et \' \'.',
      'int a = 0;\nint b;\nint c;\n\nwhile (a <= 7) {\n    b = a + 1;\n    while (b <= 8) {\n        c = b + 1;\n        while (c <= 9) {\n            /* afficher les 3 chiffres */\n            /* séparateur sauf pour le dernier */\n            c++;\n        }\n        b++;\n    }\n    a++;\n}',
    ],
    solution: String.raw`void my_putchar(char c);

static void print_three(int a, int b, int c)
{
    my_putchar(a + '0');    /* chiffre -> caractère */
    my_putchar(b + '0');
    my_putchar(c + '0');
    if (a != 7) {           /* 789 est le seul nombre avec a == 7 */
        my_putchar(',');
        my_putchar(' ');
    }
}

int my_print_comb(void)
{
    int a = 0;
    int b;
    int c;

    while (a <= 7) {
        b = a + 1;              /* b > a : chiffres différents et croissants */
        while (b <= 8) {
            c = b + 1;
            while (c <= 9) {
                print_three(a, b, c);
                c++;
            }
            b++;
        }
        a++;
    }
    my_putchar('\n');
    return 0;
}
`,
    solutionNotes: [
      { t: 'p', text: 'Découper en une petite fonction `static` rend chaque boucle lisible. `static` signifie : visible seulement dans ce fichier.' },
    ],
    pitfalls: ['Afficher « , » après 789.', 'Faire partir b de 0 : on obtient 001, 010, des doublons.', 'Afficher a au lieu de a + \'0\'.'],
    prereqs: ['loops', 'chars'],
  },
  {
    id: 'ex_print_comb2',
    title: 'my_print_comb2',
    skills: ['loops', 'chars'],
    level: 2,
    kind: 'function',
    source: { day: 'd03', section: 'Task 06 - my_print_comb2', page: 4 },
    relation: 'reproduces',
    minutes: 20,
    statement: [
      { t: 'p', text: 'Affiche toutes les combinaisons de deux nombres à deux chiffres, le premier strictement plus petit que le second : `00 01, 00 02, …, 01 99, 02 03, …, 98 99` (tests : suivi de `\\n`, retour 0).' },
    ],
    file: 'my_print_comb2.c',
    prototype: 'int my_print_comb2(void);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_print_comb2(void)\n{\n    return 0;\n}\n',
    tests: [{ name: 'affichage complet', code: 'my_print_comb2();' }, { name: 'retour', code: 'tst_nl();\ntst_int(my_print_comb2());', kind: 'limit' }],
    hints: [
      'Deux nombres x et y de 00 à 99 avec x < y. Chacun s\'affiche sur deux chiffres.',
      'Pour afficher x sur deux chiffres : dizaine = x / 10, unité = x % 10, chacun + \'0\'.',
      '1) x de 0 à 98 ; 2) y de x+1 à 99 ; 3) afficher x (2 chiffres), \' \', y (2 chiffres) ; 4) séparateur sauf si x == 98 et y == 99.',
      'static void put2(int n)\n{\n    my_putchar(n / 10 + \'0\');\n    my_putchar(n % 10 + \'0\');\n}',
    ],
    solution: String.raw`void my_putchar(char c);

static void put2(int n)
{
    my_putchar(n / 10 + '0');   /* dizaine */
    my_putchar(n % 10 + '0');   /* unité */
}

int my_print_comb2(void)
{
    int x = 0;
    int y;

    while (x <= 98) {
        y = x + 1;
        while (y <= 99) {
            put2(x);
            my_putchar(' ');
            put2(y);
            if (!(x == 98 && y == 99)) {
                my_putchar(',');
                my_putchar(' ');
            }
            y++;
        }
        x++;
    }
    my_putchar('\n');
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: '`/ 10` et `% 10` sont les deux outils de base pour découper un nombre en chiffres.' }],
    pitfalls: ['Afficher 0 au lieu de 00.', 'Inclure x == y (00 00).'],
    prereqs: ['loops', 'chars', 'vars'],
  },
  {
    id: 'ex_put_nbr',
    title: 'my_put_nbr',
    skills: ['putnbr'],
    level: 2,
    kind: 'function',
    source: { day: 'd03', section: 'Task 07 - my_put_nbr', page: 5 },
    relation: 'reproduces',
    minutes: 25,
    statement: [
      { t: 'p', text: 'Écris une fonction qui affiche le nombre reçu. Elle doit gérer toutes les valeurs possibles d\'un int.' },
      { t: 'code', code: 'my_put_nbr(42);           /* 42 */\nmy_put_nbr(0);            /* 0 */\nmy_put_nbr(-2147483647);  /* -2147483647 */', lang: 'c' },
      { t: 'note', kind: 'info', text: 'Les tests appellent ta fonction puis affichent eux-mêmes le \\n. Retour attendu : 0.' },
    ],
    file: 'my_put_nbr.c',
    prototype: 'int my_put_nbr(int nb);',
    allowed: ['my_putchar'],
    noArrays: true,
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_put_nbr(int nb)\n{\n    return 0;\n}\n',
    tests: [
      { name: '42', code: 'my_put_nbr(42);\ntst_nl();' },
      { name: '0', code: 'my_put_nbr(0);\ntst_nl();', kind: 'limit' },
      { name: '7', code: 'my_put_nbr(7);\ntst_nl();' },
      { name: '-5', code: 'my_put_nbr(-5);\ntst_nl();' },
      { name: '1000', code: 'my_put_nbr(1000);\ntst_nl();', kind: 'limit' },
      { name: '-2147483647', code: 'my_put_nbr(-2147483647);\ntst_nl();', kind: 'limit' },
      { name: '2147483647', code: 'my_put_nbr(2147483647);\ntst_nl();', kind: 'limit' },
      { name: '-2147483648 (INT_MIN)', code: 'my_put_nbr(-2147483647 - 1);\ntst_nl();', kind: 'limit' },
      { name: 'retour', code: 'tst_int(my_put_nbr(3));' },
    ],
    hints: [
      'Afficher un nombre = afficher ses chiffres de gauche à droite. Si négatif, d\'abord un \'-\'.',
      'Le dernier chiffre s\'obtient avec nb % 10, le reste avec nb / 10. Pour afficher dans le bon ordre, la récursion est pratique : afficher d\'abord nb / 10 (s\'il n\'est pas 0), puis nb % 10.',
      '1) si nb < 0 : afficher \'-\' ; 2) travailler sur un long (n = nb, puis n = -n) pour que -2147483648 tienne ; 3) si n >= 10 : my_put_nbr du « reste » n / 10 ; 4) afficher n % 10 + \'0\'.',
      'static void put_positive(long n)\n{\n    if (n >= 10)\n        put_positive(n / 10);\n    my_putchar(n % 10 + \'0\');\n}\n\nint my_put_nbr(int nb)\n{\n    long n = nb;\n\n    if (n < 0) {\n        /* ? */\n    }\n    put_positive(n);\n    return 0;\n}',
    ],
    solution: String.raw`void my_putchar(char c);

static void put_positive(long n)
{
    if (n >= 10)
        put_positive(n / 10);   /* d'abord tous les chiffres sauf le dernier */
    my_putchar(n % 10 + '0');   /* puis le dernier */
}

int my_put_nbr(int nb)
{
    long n = nb;    /* long : -(-2147483648) ne tient pas dans un int */

    if (n < 0) {
        my_putchar('-');
        n = -n;
    }
    put_positive(n);
    return 0;
}
`,
    solutionNotes: [
      { t: 'p', text: 'Pourquoi `long` ? Un int va de -2147483648 à 2147483647. L\'opposé de -2147483648 n\'existe pas en int : `nb = -nb` déborde (comportement indéfini). Sur les machines Linux 64 bits de la piscine, un long fait 64 bits et tout tient.' },
      { t: 'p', text: 'Sans long, une autre méthode consiste à travailler avec des nombres négatifs (on ne déborde jamais vers le bas) ou à traiter INT_MIN à part.' },
    ],
    pitfalls: ['INT_MIN : nb = -nb déborde.', 'Afficher les chiffres à l\'envers (24 au lieu de 42).', '0 n\'affiche rien avec une boucle while (nb > 0).'],
    prereqs: ['loops', 'chars', 'functions'],
  },
];
