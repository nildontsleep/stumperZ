import type { Lesson } from '../types';

export const LESSONS_MEMORY: Lesson[] = [
  {
    id: 'l_pointers', skill: 'pointers', title: 'Pointeurs et adresses', minutes: 25,
    sources: [{ day: 'd04', section: 'Task 01 - my_swap', page: 2 }, { day: 'd04', section: 'Task 02 - my_putstr', page: 2 }],
    why: [
      { t: 'p', text: 'Une fonction reçoit des **copies** de ses arguments. Pour qu\'elle modifie une variable de l\'appelant (my_swap), ou pour lui donner une chaîne entière sans la copier (my_putstr), on lui passe une **adresse**. Une variable qui contient une adresse s\'appelle un pointeur.' },
    ],
    how: [
      { t: 'memory', caption: 'int x = 7; int *p = &x;   — p contient l\'adresse de x', cells: [
        { id: 'x', addr: '0x7ffc10', name: 'x', value: '7', kind: 'var' },
        { id: 'p', addr: '0x7ffc18', name: 'p', value: '0x7ffc10', kind: 'ptr' },
      ], arrows: [{ from: 'p', to: 'x' }] },
      { t: 'list', items: [
        '**&x** : l\'adresse de x.',
        '**int *p** (dans une déclaration) : p est un pointeur vers un int.',
        '**\\*p** (dans une instruction) : la valeur rangée à l\'adresse p. `*p = 42;` modifie x.',
        '**NULL** : un pointeur qui ne pointe vers rien. Le déréférencer fait planter (en général Segmentation fault).',
        'Les adresses affichées ici (0x7ffc10…) sont des exemples : elles changent à chaque exécution.',
      ] },
    ],
    example: {
      code: 'void my_swap(int *a, int *b)\n{\n    int tmp = *a;\n\n    *a = *b;\n    *b = tmp;\n}\n\n/* appel : */\nint x = 1;\nint y = 2;\nmy_swap(&x, &y);   /* x vaut 2, y vaut 1 */',
      explain: [
        { t: 'trace', caption: 'Avec a = &x et b = &y', columns: ['instruction', 'tmp', 'x (= *a)', 'y (= *b)'], rows: [['départ', '?', '1', '2'], ['tmp = *a', '1', '1', '2'], ['*a = *b', '1', '2', '2'], ['*b = tmp', '1', '2', '1']] },
        { t: 'p', text: 'La fonction ne connaît pas x et y, mais elle connaît leurs adresses : en écrivant à ces adresses, elle modifie les variables de l\'appelant.' },
      ],
    },
    pitfall: [
      { t: 'p', text: 'Écrire `a = b;` au lieu de `*a = *b;` : on change seulement la copie locale de l\'adresse, rien ne change chez l\'appelant.' },
      { t: 'p', text: 'Confondre l\'étoile de la déclaration (`int *p` : « p est un pointeur ») et celle de l\'utilisation (`*p` : « ce qui est pointé »).' },
    ],
    guided: 'ex_swap', solo: 'ex_evil_str',
    check: ['q_ptr_1', 'q_ptr_2', 'q_ptr_3', 'q_ptr_4'],
    videos: ['v_c_pointers'],
  },
  {
    id: 'l_strings', skill: 'strings', title: 'Chaînes et caractère nul', minutes: 20,
    sources: [{ day: 'd04', section: 'Task 02 - my_putstr', page: 2 }, { day: 'd04', section: 'Task 03 - my_strlen', page: 2 }, { day: 'd04', section: 'Task 04 - my_evil_str', page: 3 }],
    why: [{ t: 'p', text: 'Arguments du programme, mots à trier, lignes d\'un fichier : à partir du Day 04, presque tout est une chaîne. Une chaîne n\'a pas de taille stockée : sa fin est marquée par le caractère nul \'\\0\'.' }],
    how: [
      { t: 'memory', caption: 'char const *s = "Hi!";   — s contient l\'adresse du premier caractère', cells: [
        { id: 's', name: 's', value: '0x4010', kind: 'ptr' },
        { id: 'c0', addr: '0x4010', name: 's[0]', value: "'H'", kind: 'char' },
        { id: 'c1', addr: '0x4011', name: 's[1]', value: "'i'", kind: 'char' },
        { id: 'c2', addr: '0x4012', name: 's[2]', value: "'!'", kind: 'char' },
        { id: 'c3', addr: '0x4013', name: 's[3]', value: "'\\0'", kind: 'nul' },
      ], arrows: [{ from: 's', to: 'c0' }] },
      { t: 'list', items: [
        '`s[i]` est le caractère numéro i (en partant de 0). `s[i]` = `*(s + i)`.',
        'Parcours type : `while (s[i] != \'\\0\') { …; i++; }`.',
        'Longueur de "Hi!" = 3, mais elle occupe 4 octets (avec le \\0).',
        '`char const *` : la fonction promet de ne pas modifier la chaîne (my_strlen, my_putstr).',
        'Un littéral "abc" est en **lecture seule**. Pour une chaîne modifiable : `char s[] = "abc";` (tableau) ou une copie allouée.',
      ] },
    ],
    example: {
      code: 'int my_strlen(char const *str)\n{\n    int i = 0;\n\n    while (str[i] != \'\\0\')\n        i++;\n    return i;\n}',
      explain: [{ t: 'p', text: 'Pour "Hi!", i passe par 0, 1, 2 ; à i = 3, str[3] est \'\\0\' : on s\'arrête et on renvoie 3.' }],
    },
    pitfall: [
      { t: 'p', text: 'Comparer à \'0\' au lieu de \'\\0\'.' },
      { t: 'p', text: 'Oublier d\'écrire le \\0 à la fin d\'une chaîne qu\'on construit (my_strcpy, my_strdup) : la suite de la mémoire est lue comme si elle faisait partie de la chaîne.' },
      { t: 'note', kind: 'pdf', text: 'Day 04, my_evil_str : « you may encounter "Segmentation fault" errors. Either you\'re messing with the pointers in your function or the string given in parameter is read-only! »' },
    ],
    guided: 'ex_strlen', solo: 'ex_count_char',
    check: ['q_str_1', 'q_str_2', 'q_str_3', 'q_str_4', 'q_str_5', 'q_str_6'],
    videos: ['v_c_strings'],
  },
  {
    id: 'l_arrays', skill: 'arrays', title: 'Tableaux', minutes: 15,
    sources: [{ day: 'd04', section: 'Task 06 - my_sort_int_array', page: 4 }],
    why: [{ t: 'p', text: 'Un tableau range plusieurs valeurs du même type côte à côte : des scores, des compteurs par caractère, des mots. Le Day 04 demande de trier un tableau d\'entiers.' }],
    how: [
      { t: 'memory', caption: 'int t[4] = {5, 2, 9, 1};   — 4 cases consécutives de 4 octets', cells: [
        { id: 't0', addr: '0x2000', name: 't[0]', value: '5' }, { id: 't1', addr: '0x2004', name: 't[1]', value: '2' },
        { id: 't2', addr: '0x2008', name: 't[2]', value: '9' }, { id: 't3', addr: '0x200c', name: 't[3]', value: '1' },
        { id: 't4', addr: '0x2010', name: 't[4]', value: 'hors tableau !', kind: 'unknown' },
      ] },
      { t: 'list', items: [
        'Indices valides : 0 à taille - 1. Lire t[4] ici est un comportement indéfini.',
        'Passé à une fonction, un tableau devient l\'adresse de sa première case : `void f(int *array, int size)`. La taille doit être passée à part.',
        'Échanger deux cases : variable temporaire, comme my_swap.',
        'Tableau de compteurs : `int count[128] = {0};` puis `count[(int)c]++;` compte chaque caractère ASCII.',
      ] },
    ],
    example: {
      code: 'void my_sort_int_array(int *array, int size)\n{\n    int i;\n    int tmp;\n    int sorted = 0;\n\n    while (!sorted) {\n        sorted = 1;\n        for (i = 0; i < size - 1; i++) {\n            if (array[i] > array[i + 1]) {\n                tmp = array[i];\n                array[i] = array[i + 1];\n                array[i + 1] = tmp;\n                sorted = 0;\n            }\n        }\n    }\n}',
      explain: [
        { t: 'trace', caption: 'Tri à bulles sur {5, 2, 9, 1}', columns: ['passage', 'tableau après', 'échange ?'], rows: [['1', '{2, 5, 1, 9}', 'oui'], ['2', '{2, 1, 5, 9}', 'oui'], ['3', '{1, 2, 5, 9}', 'oui'], ['4', '{1, 2, 5, 9}', 'non → fini']] },
        { t: 'p', text: '`i < size - 1` : on compare array[i] et array[i + 1], donc i + 1 doit rester < size.' },
      ],
    },
    pitfall: [{ t: 'p', text: 'Boucler jusqu\'à `i < size` et lire array[size] : une case qui n\'existe pas.' }],
    guided: 'ex_array_max', solo: 'ex_sort_int_array',
    check: ['q_arr_1', 'q_arr_2', 'q_arr_3'],
    videos: ['v_c_arrays', 'v_bubble'],
  },
  {
    id: 'l_getnbr', skill: 'getnbr', title: 'Lire un nombre dans une chaîne', minutes: 25,
    sources: [{ day: 'd04', section: 'Task 05 - my_getnbr', page: 3 }, { day: 'd10', section: 'Task 02 - do-op', page: 2 }],
    why: [{ t: 'p', text: 'Les arguments d\'un programme sont des chaînes : "42" n\'est pas le nombre 42. Pour calculer (do-op, calc, shapes…), il faut convertir. my_getnbr est l\'une des fonctions les plus réutilisées de la piscine.' }],
    how: [
      { t: 'list', items: [
        '**Étape 1 : les signes.** Tant qu\'on voit \'+\' ou \'-\', on avance ; chaque \'-\' inverse le signe.',
        '**Étape 2 : les chiffres.** `result = result * 10 + (c - \'0\')` tant que c est un chiffre.',
        '**Étape 3 : arrêt** au premier caractère qui n\'est pas un chiffre ("42a43" → 42).',
        '**Débordement** : vérifier à CHAQUE chiffre que le résultat reste dans les limites (2147483647, ou 2147483648 si négatif) ; sinon renvoyer 0 (règle du PDF).',
      ] },
      { t: 'trace', caption: 'my_getnbr("--42x")', columns: ['caractère', 'phase', 'neg', 'result'], rows: [["'-'", 'signes', '1', '0'], ["'-'", 'signes', '0', '0'], ["'4'", 'chiffres', '0', '4'], ["'2'", 'chiffres', '0', '42'], ["'x'", 'arrêt', '0', '→ 42']] },
    ],
    example: {
      code: 'int my_getnbr(char const *str)\n{\n    int i = 0;\n    int neg = 0;\n    long r = 0;\n\n    while (str[i] == \'+\' || str[i] == \'-\') {\n        if (str[i] == \'-\')\n            neg = !neg;\n        i++;\n    }\n    while (str[i] >= \'0\' && str[i] <= \'9\') {\n        r = r * 10 + (str[i] - \'0\');\n        if ((!neg && r > 2147483647) || (neg && r > 2147483648))\n            return 0;\n        i++;\n    }\n    return neg ? -r : r;\n}',
      explain: [{ t: 'p', text: 'On accumule dans un long (64 bits sur Linux) et on vérifie à chaque chiffre : r ne peut donc jamais dépasser environ 21 milliards, bien loin de la limite d\'un long.' }],
    },
    pitfall: [
      { t: 'p', text: 'Vérifier le débordement seulement à la fin : avec "11000000000000000000000042", même un long a débordé avant (exemple du PDF).' },
      { t: 'p', text: 'Calculer dans un int puis tester `if (r < 0)` pour détecter le débordement : le débordement d\'un int signé est un comportement indéfini, ce test n\'est pas fiable.' },
    ],
    guided: 'ex_atoi_simple', solo: 'ex_getnbr',
    check: ['q_getnbr_1', 'q_getnbr_2', 'q_getnbr_3'],
  },
  {
    id: 'l_strfuncs', skill: 'strfuncs', title: 'Fonctions de chaînes', minutes: 30,
    sources: [{ day: 'd06', section: 'Task 01 - my_strcpy', page: 2 }, { day: 'd06', section: 'Task 06 - my_strcmp', page: 4 }, { day: 'd06', section: 'Task 10 - my_strcapitalize', page: 5 }, { day: 'd07', section: 'Task 02 - my_strcat', page: 4 }],
    why: [
      { t: 'p', text: 'Le Day 06 te fait recoder la bibliothèque string (interdite dans tes rendus). Ces fonctions servent ensuite partout : comparer des arguments, trier des mots, chercher un motif (grep).' },
      { t: 'note', kind: 'pdf', text: 'Day 06 : « Beware that none of your deliveries contains a function from this string library! » Utilise man (man strcmp, man strstr) pour connaître le comportement exact à reproduire.' },
    ],
    how: [
      { t: 'p', text: 'Elles suivent toutes 3 schémas :' },
      { t: 'list', items: [
        '**Parcours + copie** (strcpy, strcat, strncpy) : copier caractère par caractère, puis écrire le \\0.',
        '**Parcours en parallèle** (strcmp, strncmp) : avancer tant que les deux chaînes sont égales, puis comparer le premier caractère différent.',
        '**Chercher un contre-exemple** (str_isalpha, str_isnum…) : renvoyer 0 dès qu\'un caractère ne convient pas, 1 à la fin.',
        '**Transformer sur place** (strupcase, revstr, capitalize) : modifier str[i] et renvoyer str.',
      ] },
      { t: 'code', lang: 'c', code: 'int my_strcmp(char const *s1, char const *s2)\n{\n    int i = 0;\n\n    while (s1[i] != \'\\0\' && s1[i] == s2[i])\n        i++;\n    return s1[i] - s2[i];\n}', caption: 'Parcours en parallèle' },
    ],
    example: {
      code: 'char *my_strcpy(char *dest, char const *src)\n{\n    int i = 0;\n\n    while (src[i] != \'\\0\') {\n        dest[i] = src[i];\n        i++;\n    }\n    dest[i] = \'\\0\';\n    return dest;\n}',
      explain: [
        { t: 'p', text: 'La boucle s\'arrête AVANT de copier le \\0 : il faut donc l\'écrire après. La fonction renvoie dest, comme la vraie strcpy (pratique pour enchaîner : my_putstr(my_strcpy(buf, "hi"))).' },
      ],
    },
    pitfall: [
      { t: 'p', text: 'my_strncpy : le PDF impose une règle précise sur le \\0 (ajouté si n > longueur, pas ajouté si n < longueur). Lis toujours le sujet plutôt que de supposer.' },
      { t: 'p', text: 'my_strcapitalize : un « mot » commence après n\'importe quel caractère non alphanumérique (« forty-two » → « Forty-Two »), pas seulement après un espace.' },
    ],
    guided: 'ex_strcpy', solo: 'ex_strcmp',
    check: ['q_strf_1', 'q_strf_2', 'q_strf_3', 'q_strf_4'],
    videos: ['v_c_strings'],
  },
  {
    id: 'l_argv', skill: 'argv', title: 'Arguments du programme', minutes: 15,
    sources: [{ day: 'd07', section: 'Task 04 - my_print_params', page: 5 }, { day: 'd07', section: 'Task 06 - my_sort_params', page: 6 }],
    why: [{ t: 'p', text: 'Un sujet d\'examen est presque toujours un programme qui reçoit des arguments : `./prog option texte`. argc et argv sont ta porte d\'entrée.' }],
    how: [
      { t: 'code', lang: 'c', code: 'int main(int argc, char **argv)' },
      { t: 'memory', caption: './a.out hello "a b"   →   argc = 3', cells: [
        { id: 'a0', name: 'argv[0]', value: '→ "./a.out"', kind: 'ptr' },
        { id: 'a1', name: 'argv[1]', value: '→ "hello"', kind: 'ptr' },
        { id: 'a2', name: 'argv[2]', value: '→ "a b"', kind: 'ptr' },
        { id: 'a3', name: 'argv[3]', value: 'NULL', kind: 'nul' },
      ] },
      { t: 'list', items: [
        '**argc** = nombre d\'arguments, nom du programme compris.',
        '**argv[i]** = la i-ème chaîne ; **argv[i][j]** = son j-ème caractère.',
        'Le shell découpe la ligne : les guillemets regroupent ("a b" = un seul argument).',
        'Toujours vérifier argc AVANT de lire argv[1] : sinon on lit au-delà du tableau.',
      ] },
    ],
    example: {
      code: '#include <unistd.h>\n\nstatic void put(char const *s)\n{\n    while (*s)\n        write(1, s++, 1);\n}\n\nint main(int argc, char **argv)\n{\n    int i = argc - 1;\n\n    while (i >= 0) {\n        put(argv[i]);\n        write(1, "\\n", 1);\n        i--;\n    }\n    return 0;\n}',
      explain: [{ t: 'p', text: 'my_rev_params (Day 07) : on part du dernier argument (argc - 1) et on descend jusqu\'à argv[0].' }],
    },
    pitfall: [
      { t: 'p', text: 'Lire argv[1] sans vérifier argc : si le programme est lancé sans argument, argv[1] vaut NULL et le programme plante.' },
      { t: 'p', text: 'Oublier argv[0] quand le sujet dit « including argv[0] ».' },
    ],
    guided: 'ex_print_params', solo: 'ex_rev_params',
    check: ['q_argv_1', 'q_argv_2', 'q_argv_3', 'q_argv_4'],
    videos: ['v_c_args'],
  },
  {
    id: 'l_errors84', skill: 'errors84', title: 'Erreurs, sortie d\'erreur et code 84', minutes: 15,
    sources: [{ day: 'd10', section: 'Task 02 - do-op', page: 2 }, { day: 'd12', section: 'Task 01 - Cat', page: 2 }],
    why: [
      { t: 'p', text: 'Un bon programme ne plante pas quand on l\'utilise mal : il explique le problème et le signale au shell. À la piscine, la règle est imposée à partir du Day 10.' },
      { t: 'note', kind: 'pdf', text: '« Error messages have to be written on the error output, and the program should then exit with the 84 error code (0 if there is no error). » (Day 10, 11, 12)' },
    ],
    how: [
      { t: 'list', items: [
        'Trois sorties standard : **0** = entrée, **1** = sortie standard, **2** = sortie d\'erreur.',
        'Message d\'erreur : `write(2, msg, longueur);`.',
        'Code de sortie : `return 84;` dans main. Le shell le voit avec `echo $?`.',
        'En cas d\'erreur, n\'écris rien d\'autre sur la sortie standard (sauf si le sujet le demande, comme le « 0 » de do-op).',
        'Vérifie les erreurs **avant** l\'opération dangereuse (division par zéro, argv[1] absent, open qui échoue).',
      ] },
      { t: 'code', lang: 'sh', code: '$ ./do-op 25 / 0 > /dev/null\nStop: division by zero\n$ echo $?\n84', caption: '> /dev/null jette la sortie standard : le message reste visible car il est sur la sortie d\'erreur (exemple du Day 10)' },
    ],
    example: {
      code: '#include <unistd.h>\n\nstatic int my_puterr(char const *s)\n{\n    int n = 0;\n\n    while (s[n])\n        n++;\n    write(2, s, n);\n    return 84;\n}\n\nint main(int argc, char **argv)\n{\n    if (argc != 2)\n        return my_puterr("Usage: ./prog TEXT\\n");\n    /* ... travail normal ... */\n    (void)argv;\n    return 0;\n}',
      explain: [{ t: 'p', text: 'my_puterr calcule la longueur elle-même (pas de nombre à compter à la main) et renvoie 84 : `return my_puterr(...)` fait les deux en une ligne.' }],
    },
    pitfall: [
      { t: 'p', text: 'Écrire l\'erreur avec write(1, …) : elle part sur la sortie standard, les tests qui attendent une sortie vide échouent.' },
      { t: 'p', text: 'Compter à la main la longueur du message et se tromper d\'un caractère (le \\n compte pour 1).' },
    ],
    guided: 'ex_last_arg_len', solo: 'ex_do_op',
    check: ['q_err_1', 'q_err_2', 'q_err_3'],
    videos: ['v_redirect'],
  },
  {
    id: 'l_recursion', skill: 'recursion', title: 'Récursivité', minutes: 20,
    sources: [{ day: 'd05', section: 'Task 02 - my_compute_factorial_rec', page: 2 }, { day: 'd05', section: 'Task 08 - The n queens', page: 4 }],
    why: [{ t: 'p', text: 'Certains problèmes se décrivent naturellement à partir d\'une version plus petite d\'eux-mêmes : n! = n × (n-1)!. Le Day 05 (« Damn it, this is recursion day! ») demande des versions récursives, et my_put_nbr en profite.' }],
    how: [
      { t: 'list', items: [
        '**Cas de base** : une entrée simple pour laquelle on renvoie directement le résultat (0! = 1).',
        '**Appel récursif** sur un problème plus petit (n - 1), qui se rapproche du cas de base.',
        'Chaque appel a ses propres variables. Les appels s\'empilent, puis se terminent dans l\'ordre inverse.',
      ] },
      { t: 'trace', caption: 'fact(3)', columns: ['appel', 'attend', 'renvoie'], rows: [['fact(3)', '3 × fact(2)', '6'], ['fact(2)', '2 × fact(1)', '2'], ['fact(1)', '1 × fact(0)', '1'], ['fact(0)', '— cas de base —', '1']] },
    ],
    example: {
      code: 'int my_compute_power_rec(int nb, int p)\n{\n    if (p < 0)\n        return 0;\n    if (p == 0)\n        return 1;\n    return nb * my_compute_power_rec(nb, p - 1);\n}',
      explain: [{ t: 'p', text: 'nb^p = nb × nb^(p-1). p diminue de 1 à chaque appel jusqu\'à 0. (La version du Day 05 doit en plus détecter le débordement.)' }],
    },
    pitfall: [
      { t: 'p', text: 'Pas de cas de base, ou un appel qui ne rapproche pas du cas de base (`f(n)` au lieu de `f(n - 1)`) : la pile d\'appels déborde, le programme plante.' },
    ],
    guided: 'ex_factorial_rec', solo: 'ex_sum_digits_rec',
    check: ['q_rec_1', 'q_rec_2', 'q_rec_3'],
    videos: ['v_c_recursion'],
  },
  {
    id: 'l_malloc', skill: 'malloc', title: 'Allocation dynamique', minutes: 20,
    sources: [{ day: 'd08', section: 'Task 01 - my_strdup', page: 3 }, { day: 'd08', section: 'Task 02 - concat_params', page: 3 }],
    why: [{ t: 'p', text: 'Une variable locale disparaît à la fin de sa fonction. Pour **créer** une chaîne ou un tableau dont la taille n\'est connue qu\'à l\'exécution, et le renvoyer, il faut demander de la mémoire avec malloc.' }],
    how: [
      { t: 'code', lang: 'c', code: '#include <stdlib.h>\n\nchar *s = malloc(sizeof(char) * (len + 1));  /* +1 pour le \\0 */\nif (s == NULL)\n    return NULL;                             /* plus de mémoire */\n/* ... remplir s ... */\nfree(s);                                     /* quand on n\'en a plus besoin */' },
      { t: 'memory', caption: 'La zone allouée vit dans le « tas » : elle survit à la fin de la fonction', cells: [
        { id: 'p', name: 's (pile)', value: '0x55a0', kind: 'ptr' },
        { id: 'h0', addr: '0x55a0', name: 'tas', value: "'H'", kind: 'heap' },
        { id: 'h1', addr: '0x55a1', name: 'tas', value: "'i'", kind: 'heap' },
        { id: 'h2', addr: '0x55a2', name: 'tas', value: "'\\0'", kind: 'nul' },
      ], arrows: [{ from: 'p', to: 'h0' }] },
      { t: 'list', items: [
        'malloc(n) réserve n octets et renvoie leur adresse, ou NULL.',
        'La mémoire obtenue n\'est pas initialisée.',
        'Une zone = un free, quand elle ne sert plus. Ne jamais l\'utiliser après free.',
        'Fonctions autorisées à partir du Day 08 : write, malloc, free.',
      ] },
    ],
    example: {
      code: '#include <stdlib.h>\n\nchar *my_strdup(char const *src)\n{\n    int len = 0;\n    char *dest;\n\n    while (src[len])\n        len++;\n    dest = malloc(sizeof(char) * (len + 1));\n    if (dest == NULL)\n        return NULL;\n    for (int i = 0; i <= len; i++)\n        dest[i] = src[i];\n    return dest;\n}',
      explain: [{ t: 'p', text: '`i <= len` copie aussi le \\0 (src[len]). La nouvelle chaîne est indépendante : modifier src après coup ne change pas dest.' }],
    },
    pitfall: [
      { t: 'p', text: 'Oublier le +1 : le \\0 est écrit un octet trop loin. Le programme peut sembler marcher… puis planter ailleurs : c\'est un comportement indéfini.' },
      { t: 'p', text: 'Renvoyer l\'adresse d\'un tableau local (`char buf[10]; return buf;`) : il n\'existe plus après le return.' },
    ],
    guided: 'ex_strdup', solo: 'ex_concat_params',
    check: ['q_malloc_1', 'q_malloc_2', 'q_malloc_3', 'q_malloc_4'],
    videos: ['v_c_malloc'],
  },
  {
    id: 'l_wordarray', skill: 'wordarray', title: 'Tableaux de mots (char **)', minutes: 30,
    sources: [{ day: 'd08', section: 'Task 03 - my_show_word_array', page: 4 }, { day: 'd08', section: 'Task 04 - my_str_to_word_array', page: 4 }, { day: 'd10', section: 'Task 03 - my_sort_word_array', page: 4 }],
    why: [{ t: 'p', text: 'Découper un texte en mots puis les traiter (trier, inverser, compter) est un classique des sujets. argv est d\'ailleurs lui-même un tableau de mots terminé par NULL.' }],
    how: [
      { t: 'memory', caption: 'char **tab pour "Hi you"', cells: [
        { id: 't', name: 'tab', value: '→ tab[0]', kind: 'ptr' },
        { id: 't0', name: 'tab[0]', value: '→ "Hi"', kind: 'ptr' },
        { id: 't1', name: 'tab[1]', value: '→ "you"', kind: 'ptr' },
        { id: 't2', name: 'tab[2]', value: 'NULL', kind: 'nul' },
      ] },
      { t: 'list', items: [
        '`char **tab` : tab pointe vers des cases qui contiennent chacune une adresse de chaîne.',
        'La dernière case vaut NULL : on parcourt avec `while (tab[i] != NULL)`.',
        'Construction en 3 temps : **compter** les mots → **allouer** le tableau (`sizeof(char *) * (n + 1)`) → pour chaque mot, **allouer et copier**.',
        'Trier = échanger les pointeurs tab[i] et tab[i + 1], jamais les caractères (Day 10).',
      ] },
    ],
    example: {
      code: 'int my_show_word_array(char * const *tab)\n{\n    for (int i = 0; tab[i] != NULL; i++) {\n        my_putstr(tab[i]);\n        my_putchar(\'\\n\');\n    }\n    return 0;\n}',
      explain: [{ t: 'p', text: 'tab[i] est une chaîne entière : on peut la passer directement à my_putstr.' }],
    },
    pitfall: [
      { t: 'p', text: '`malloc(sizeof(char) * n)` pour le tableau : chaque case doit contenir une adresse (4 ou 8 octets), pas un caractère.' },
      { t: 'p', text: 'Oublier la case NULL finale : la boucle d\'affichage lit au-delà du tableau.' },
    ],
    guided: 'ex_show_word_array', solo: 'ex_str_to_word_array',
    check: ['q_wa_1', 'q_wa_2', 'q_malloc_1'],
  },
  {
    id: 'l_bases', skill: 'bases', title: 'Bases numériques', minutes: 20,
    sources: [{ day: 'd06', section: 'Task 18 - my_putnbr_base', page: 8 }, { day: 'd06', section: 'Task 20 - my_showstr', page: 8 }, { day: 'd08', section: 'Task 05 - convert_base', page: 4 }],
    why: [{ t: 'p', text: 'Binaire, hexadécimal : la mémoire et les couleurs (Day 09) s\'expriment dans ces bases. my_putnbr_base généralise my_put_nbr : la même idée marche pour n\'importe quelle base.' }],
    how: [
      { t: 'list', items: [
        'En base 10 : chiffre = n % 10, suite = n / 10. En base b : chiffre = n % b, suite = n / b.',
        'La base est donnée comme une chaîne de symboles : "01", "0123456789ABCDEF", "poneyvif". Sa longueur = b.',
        'Le « chiffre » d s\'écrit `base[d]`.',
        'Hexadécimal sur deux chiffres (my_showstr) : `hex[c / 16]` puis `hex[c % 16]`.',
      ] },
      { t: 'trace', caption: '42 en binaire (n % 2, lu de bas en haut : 101010)', columns: ['n', 'n % 2', 'n / 2'], rows: [['42', '0', '21'], ['21', '1', '10'], ['10', '0', '5'], ['5', '1', '2'], ['2', '0', '1'], ['1', '1', '0']] },
    ],
    example: {
      code: 'static void put_base(long n, char const *base, int len)\n{\n    if (n >= len)\n        put_base(n / len, base, len);\n    my_putchar(base[n % len]);\n}',
      explain: [{ t: 'p', text: 'Exactement my_put_nbr, où 10 devient len et `+ \'0\'` devient `base[…]`.' }],
    },
    pitfall: [{ t: 'p', text: 'Écrire `n % len + \'0\'` : faux dès que la base a plus de 10 symboles, ou n\'utilise pas des chiffres.' }],
    guided: 'ex_showstr', solo: 'ex_putnbr_base',
    check: ['q_bases_1', 'q_bases_2', 'q_bases_3'],
    videos: ['v_base_conv'],
  },
];
