import type { Lesson } from '../types';

export const LESSONS_CORE: Lesson[] = [
  {
    id: 'l_compile', skill: 'compile', title: 'Compiler et lire les erreurs', minutes: 15,
    sources: [{ day: 'd03', section: 'Preliminaries', page: 1 }, { day: 'd07', section: 'Task 01 - libmy.a', page: 3 }],
    why: [
      { t: 'p', text: 'L\'ordinateur n\'exécute pas ton fichier .c directement. Le **compilateur** (gcc ou clang) le traduit en programme. S\'il trouve une faute, il refuse et t\'explique pourquoi : savoir lire ce message, c\'est gagner des dizaines de minutes à l\'examen.' },
      { t: 'note', kind: 'pdf', text: 'Day 03 : « If one of your files prevents you from compiling with *.c, the Autograder will not be able to correct your work and you will receive a 0. » Un code qui ne compile pas = 0.' },
    ],
    how: [
      { t: 'code', lang: 'sh', code: '$ gcc -Wall -Wextra main.c my_strlen.c -o test\n$ ./test', caption: 'Compiler deux fichiers ensemble, avec les avertissements, en un programme nommé test' },
      { t: 'list', items: [
        '**-Wall -Wextra** : affiche les avertissements. Ce sont souvent de vrais bugs.',
        '**-o nom** : nom du programme (sinon a.out).',
        '**-c** : compile seulement en .o, sans fabriquer de programme (utilisé aux Day 07-09).',
        'Un message a toujours la forme **fichier:ligne:colonne: error/warning: explication**.',
      ] },
      { t: 'p', text: 'Deux familles d\'erreurs : celles de **compilation** (syntaxe, types, une ligne précise) et celles d\'**édition des liens** (« undefined reference » : une fonction appelée n\'existe dans aucun fichier compilé).' },
      { t: 'error', message: "main.c:5:5: error: expected ';' before 'return'", meaning: 'Le compilateur attendait un point-virgule avant le mot return.', cause: 'Il manque le ; à la fin de la ligne précédente (ligne 4).', fix: 'Regarde la fin de la ligne d\'avant, ajoute le ;, recompile.' },
      { t: 'error', message: "warning: implicit declaration of function 'my_putchar'", meaning: 'Tu appelles une fonction que le compilateur n\'a jamais vue déclarée.', cause: 'Le prototype manque en haut du fichier.', fix: 'Ajoute void my_putchar(char c); en haut (ou #include "my.h").' },
      { t: 'error', message: "undefined reference to `my_strlen'", meaning: 'L\'éditeur de liens ne trouve le code de my_strlen dans aucun fichier.', cause: 'Fichier oublié dans la commande, faute de frappe dans le nom, ou fonction déclarée static ailleurs.', fix: 'Vérifie la liste des fichiers compilés et l\'orthographe exacte du nom.' },
      { t: 'error', message: "undefined reference to `main'", meaning: 'Il n\'y a pas de fonction main.', cause: 'Tu compiles une fonction seule (normal pour un rendu des Day 03 à 06).', fix: 'Pour tester, ajoute un fichier de test avec un main (dossier tests/).' },
      { t: 'error', message: "error: 'i' undeclared (first use in this function)", meaning: 'La variable i n\'existe pas à cet endroit.', cause: 'Oubli de déclaration (int i = 0;) ou faute de frappe.', fix: 'Déclare la variable au début de la fonction.' },
      { t: 'error', message: "warning: control reaches end of non-void function", meaning: 'Un chemin de la fonction se termine sans return.', cause: 'Un if qui renvoie, mais pas de return pour l\'autre cas.', fix: 'Ajoute un return à la fin de la fonction.' },
      { t: 'error', message: 'Segmentation fault (core dumped)', meaning: 'Ce n\'est pas une erreur de compilation : le programme a planté en accédant à une mémoire interdite.', cause: 'Pointeur NULL, dépassement de tableau, \\0 oublié, modification d\'un littéral "…".', fix: 'Teste avec une entrée minuscule, ajoute des affichages pour trouver la dernière ligne exécutée.' },
    ],
    example: {
      code: 'void my_putchar(char c);\n\nint my_print_ab(void)\n{\n    my_putchar(\'a\');\n    my_putchar(\'b\')\n    return 0;\n}',
      explain: [
        { t: 'p', text: 'gcc répond : `error: expected \';\' before \'return\'` en pointant la ligne 7. La faute est à la fin de la ligne 6 : `my_putchar(\'b\')` n\'a pas de point-virgule.' },
        { t: 'p', text: 'Réflexe : lire la **première** erreur, aller à la ligne indiquée ET à celle d\'avant, corriger une seule chose, recompiler.' },
      ],
    },
    pitfall: [
      { t: 'p', text: 'Corriger les erreurs dans le désordre. Une seule faute (une accolade oubliée) peut produire 20 messages : corrige la première, recompile, et beaucoup disparaissent.' },
      { t: 'note', kind: 'info', text: 'Sur ce site, le compilateur est wcc (WebAssembly) : ses messages ont la forme fichier(ligne): … au lieu de fichier:ligne:colonne:. Le sens est le même. Entraîne-toi aussi avec gcc sur ta machine.' },
    ],
    guided: 'ex_sum_to_n', solo: 'ex_max3',
    check: ['q_compile_1', 'q_compile_2', 'q_compile_3', 'q_compile_6', 'q_compile_5'],
    videos: ['v_c_compile', 'v_gcc', 'v_gdb'],
  },
  {
    id: 'l_structure', skill: 'structure', title: 'Structure d\'un programme C', minutes: 12,
    sources: [{ day: 'd03', section: 'Preliminaries', page: 1 }, { day: 'd07', section: 'Task 04 - my_print_params', page: 5 }],
    why: [
      { t: 'p', text: 'Tout fichier C suit le même plan. Si tu le connais par cœur, tu écris en 30 secondes un squelette qui compile, et tu peux ensuite te concentrer sur le problème.' },
    ],
    how: [
      { t: 'code', lang: 'c', code: '#include <unistd.h>          /* 1. les bibliothèques utilisées */\n\nvoid my_putchar(char c);     /* 2. les prototypes (déclarations) */\n\nint my_isneg(int n)          /* 3. les fonctions : type de retour, nom, paramètres */\n{                            /*    accolade ouvrante */\n    if (n < 0)               /*    instructions, chacune finie par ; */\n        my_putchar(\'N\');\n    else\n        my_putchar(\'P\');\n    return 0;                /*    valeur renvoyée */\n}                            /*    accolade fermante */' },
      { t: 'list', items: [
        'Une **fonction** = un en-tête (`int my_isneg(int n)`) + un corps entre `{ }`.',
        'Un **programme** a une fonction `main` : c\'est par elle que tout commence. `int main(void)` ou `int main(int argc, char **argv)`.',
        'Un **prototype** (`void my_putchar(char c);`) annonce une fonction écrite ailleurs. Le compilateur lit de haut en bas : il doit connaître une fonction avant qu\'on l\'appelle.',
        'Les commentaires s\'écrivent `/* ... */`.',
      ] },
      { t: 'note', kind: 'pdf', text: 'Day 03 à 06 : tu rends des **fonctions**, sans main (la correction ajoute son main.c et son my_putchar.c). Day 07 (my_print_params) : tu rends un **programme**, avec main, qui renvoie 0.' },
    ],
    example: {
      code: '#include <unistd.h>\n\nvoid my_putchar(char c)\n{\n    write(1, &c, 1);\n}\n\nint main(void)\n{\n    my_putchar(\'4\');\n    my_putchar(\'2\');\n    my_putchar(\'\\n\');\n    return 0;\n}',
      explain: [
        { t: 'p', text: '`write(1, &c, 1)` écrit 1 octet, situé à l\'adresse de c, sur la sortie standard (1). C\'est ainsi qu\'est faite la my_putchar fournie par la piscine.' },
        { t: 'p', text: 'main appelle my_putchar trois fois puis renvoie 0 : « tout s\'est bien passé ».' },
      ],
    },
    pitfall: [
      { t: 'p', text: 'Appeler une fonction écrite plus bas dans le fichier sans prototype. Solution : écrire les prototypes en haut, ou ordonner les fonctions pour que chacune soit définie avant d\'être appelée.' },
      { t: 'p', text: 'Laisser un main dans un rendu de fonction : la correction ajoute le sien, il y en a deux, rien ne compile.' },
    ],
    guided: 'ex_isneg', solo: 'ex_print_digits',
    check: ['q_struct_1', 'q_struct_2', 'q_struct_3', 'q_struct_4'],
    videos: ['v_c_intro', 'v_c_compile'],
  },
  {
    id: 'l_vars', skill: 'vars', title: 'Variables, types et opérateurs', minutes: 15,
    sources: [{ day: 'd03', section: 'Task 07 - my_put_nbr', page: 5 }],
    complement: false,
    why: [{ t: 'p', text: 'Une variable est une boîte nommée qui garde une valeur : un compteur, un résultat, une position dans une chaîne. Presque chaque exercice en utilise.' }],
    how: [
      { t: 'code', lang: 'c', code: 'int count = 0;      /* entier, de -2147483648 à 2147483647 */\nchar c = \'a\';       /* un caractère = un petit nombre (97 pour a) */\nlong big = 0;       /* entier plus grand (64 bits sur Linux) */\n\ncount = count + 1;  /* = : ranger une valeur */\ncount++;            /* ajoute 1 */\ncount += 5;         /* ajoute 5 */' },
      { t: 'list', items: [
        '**=** range une valeur ; **==** compare (vrai/faux).',
        'Entre deux int, **/** est une division entière : 17 / 5 = 3. **%** donne le reste : 17 % 5 = 2.',
        'Ces deux opérateurs découpent un nombre : 427 % 10 = 7 (dernier chiffre), 427 / 10 = 42 (le reste).',
        'Une variable locale non initialisée contient n\'importe quoi : écris toujours `int i = 0;`.',
      ] },
      { t: 'memory', caption: 'Chaque variable occupe une case mémoire à une adresse', cells: [
        { id: 'v1', addr: '0x1000', name: 'count', value: '6', kind: 'var' },
        { id: 'v2', addr: '0x1004', name: 'c', value: "'a' (97)", kind: 'char' },
      ] },
    ],
    example: {
      code: 'int sum = 0;\nint n = 1234;\n\nwhile (n > 0) {\n    sum = sum + n % 10;\n    n = n / 10;\n}\n/* sum vaut 10 */',
      explain: [
        { t: 'trace', caption: 'Déroulement pas à pas', columns: ['tour', 'n % 10', 'sum', 'n après n / 10'], rows: [['1', '4', '4', '123'], ['2', '3', '7', '12'], ['3', '2', '9', '1'], ['4', '1', '10', '0']] },
        { t: 'p', text: 'Quand n vaut 0, la condition n > 0 est fausse : la boucle s\'arrête avec sum = 10.' },
      ],
    },
    pitfall: [
      { t: 'p', text: '**Débordement** : un int ne peut pas dépasser 2147483647. `2147483647 + 1` est un comportement indéfini (le résultat n\'est pas garanti). Le Day 05 demande de traiter les débordements comme des erreurs : il faut les **empêcher avant**, par exemple en calculant dans un long puis en comparant aux limites.' },
    ],
    guided: 'ex_sum_to_n', solo: 'ex_count_digits',
    check: ['q_vars_1', 'q_vars_2', 'q_vars_3', 'q_vars_4', 'q_vars_5'],
    videos: ['v_c_vars', 'v_c_ops'],
  },
  {
    id: 'l_chars', skill: 'chars', title: 'Caractères, ASCII et my_putchar', minutes: 15,
    sources: [{ day: 'd03', section: 'Task 01 - my_print_alpha', page: 3 }, { day: 'd03', section: 'Task 03 - my_print_digits', page: 3 }],
    why: [
      { t: 'p', text: 'Au Day 03, ta seule façon d\'afficher quelque chose est my_putchar, qui affiche **un** caractère. Tout (alphabet, chiffres, nombres) se construit à partir d\'elle.' },
    ],
    how: [
      { t: 'p', text: 'Un `char` est un petit nombre. La table **ASCII** associe un nombre à chaque caractère. Les lettres et les chiffres se suivent :' },
      { t: 'memory', caption: 'Quelques codes ASCII', cells: [
        { id: 'a0', name: "'0'", value: '48', kind: 'char' }, { id: 'a1', name: "'9'", value: '57', kind: 'char' },
        { id: 'a2', name: "'A'", value: '65', kind: 'char' }, { id: 'a3', name: "'Z'", value: '90', kind: 'char' },
        { id: 'a4', name: "'a'", value: '97', kind: 'char' }, { id: 'a5', name: "'z'", value: '122', kind: 'char' },
        { id: 'a6', name: "' '", value: '32', kind: 'char' }, { id: 'a7', name: "'\\n'", value: '10', kind: 'char' },
        { id: 'a8', name: "'\\0'", value: '0', kind: 'nul' },
      ] },
      { t: 'list', items: [
        'chiffre → caractère : `5 + \'0\'` donne `\'5\'`.',
        'caractère → chiffre : `\'7\' - \'0\'` donne `7`.',
        'minuscule → majuscule : `c - \'a\' + \'A\'`.',
        'Tester une lettre minuscule : `c >= \'a\' && c <= \'z\'`.',
        '`\'a\'` (apostrophes) = un caractère. `"a"` (guillemets) = une chaîne. my_putchar prend un caractère.',
      ] },
    ],
    example: {
      code: 'void my_putchar(char c);\n\nint my_print_digits(void)\n{\n    int i = 0;\n\n    while (i <= 9) {\n        my_putchar(i + \'0\');\n        i++;\n    }\n    my_putchar(\'\\n\');\n    return 0;\n}',
      explain: [
        { t: 'p', text: 'i est un nombre de 0 à 9. `i + \'0\'` le transforme en caractère (48 à 57). `my_putchar(i)` aurait affiché des caractères invisibles (codes 0 à 9).' },
      ],
    },
    pitfall: [
      { t: 'p', text: 'Confondre `\'0\'` (le chiffre zéro, code 48) et `\'\\0\'` (le caractère nul, code 0, fin de chaîne).' },
      { t: 'note', kind: 'pdf', text: 'Day 03 : « Arrays and strings are forbidden for every task ». Pas de "abc" : uniquement des \'a\' passés à my_putchar.' },
    ],
    guided: 'ex_print_alpha', solo: 'ex_print_revalpha',
    check: ['q_chars_1', 'q_chars_2', 'q_chars_3', 'q_chars_4', 'q_chars_5'],
    videos: ['v_c_vars'],
  },
  {
    id: 'l_cond', skill: 'cond', title: 'Conditions', minutes: 12,
    sources: [{ day: 'd03', section: 'Task 04 - my_isneg', page: 3 }],
    why: [{ t: 'p', text: 'Un programme doit réagir différemment selon les cas : nombre négatif ou non, argument présent ou absent, caractère lettre ou chiffre. C\'est le rôle de if.' }],
    how: [
      { t: 'code', lang: 'c', code: 'if (n < 0) {\n    /* si vrai */\n} else if (n == 0) {\n    /* sinon, si n vaut 0 */\n} else {\n    /* dans tous les autres cas */\n}' },
      { t: 'list', items: [
        'Comparaisons : `<  <=  >  >=  ==  !=`.',
        '**&&** (ET) : vrai si les deux sont vrais. **||** (OU) : vrai si au moins un est vrai. **!** (NON) inverse.',
        'En C, 0 est faux et tout le reste est vrai : `if (str[i])` = « si str[i] n\'est pas \\0 ».',
        'Évaluation paresseuse : dans `A && B`, B n\'est pas calculé si A est faux ; dans `A || B`, B n\'est pas calculé si A est vrai.',
      ] },
    ],
    example: {
      code: 'int my_sign(int n)\n{\n    if (n > 0)\n        return 1;\n    if (n < 0)\n        return -1;\n    return 0;\n}',
      explain: [{ t: 'p', text: 'Chaque return termine la fonction. Si on arrive à la dernière ligne, c\'est que n n\'est ni > 0 ni < 0 : n vaut 0.' }],
    },
    pitfall: [
      { t: 'p', text: '`if (n = 0)` au lieu de `if (n == 0)` : le premier range 0 dans n et le test est toujours faux. gcc -Wall le signale.' },
      { t: 'p', text: 'Oublier le cas 0 ou les bornes : « positif ou nul » (my_isneg) inclut 0.' },
    ],
    guided: 'ex_max3', solo: 'ex_isneg',
    check: ['q_cond_1', 'q_cond_2', 'q_cond_3', 'q_cond_4'],
    videos: ['v_c_cond'],
  },
  {
    id: 'l_loops', skill: 'loops', title: 'Boucles', minutes: 20,
    sources: [{ day: 'd03', section: 'Task 05 - my_print_comb', page: 4 }, { day: 'd05', section: 'Task 01 - my_compute_factorial_it', page: 2 }],
    why: [{ t: 'p', text: 'Afficher 26 lettres, parcourir une chaîne, tester tous les diviseurs : dès qu\'on répète, on boucle. La plupart des bugs d\'examen sont des erreurs de bornes de boucle.' }],
    how: [
      { t: 'code', lang: 'c', code: 'int i = 0;              /* 1. départ */\n\nwhile (i < 5) {         /* 2. condition, testée AVANT chaque tour */\n    my_putchar(\'*\');    /* 3. corps */\n    i++;                /* 4. avancer vers la fin */\n}\n\nfor (i = 0; i < 5; i++)  /* même chose en une ligne */\n    my_putchar(\'*\');' },
      { t: 'list', items: [
        '`while (i < n)` avec i qui part de 0 : exactement **n** tours (i = 0 … n-1).',
        '`do { … } while (cond);` : au moins un tour (utile pour afficher 0 dans my_put_nbr).',
        '**Boucles imbriquées** : la boucle intérieure recommence entièrement à chaque tour de l\'extérieure. Remets son compteur à 0 juste avant elle.',
      ] },
      { t: 'trace', caption: 'Tracer une boucle à la main : for (i = 1; i <= 3; i++) total += i;', columns: ['i', 'test i <= 3', 'total après'], rows: [['1', 'vrai', '1'], ['2', 'vrai', '3'], ['3', 'vrai', '6'], ['4', 'faux → fin', '6']] },
    ],
    example: {
      code: 'void my_putchar(char c);\n\nvoid triangle(int n)\n{\n    int y = 1;\n    int x;\n\n    while (y <= n) {\n        x = 0;\n        while (x < y) {\n            my_putchar(\'*\');\n            x++;\n        }\n        my_putchar(\'\\n\');\n        y++;\n    }\n}',
      explain: [
        { t: 'p', text: 'La ligne y contient y étoiles. `x = 0` est remis à zéro pour chaque ligne : sans ça, seule la première ligne serait correcte.' },
      ],
    },
    pitfall: [
      { t: 'p', text: '**Décalage de 1** (off-by-one) : `<` ou `<=` ? Pour vérifier, teste à la main la plus petite valeur (n = 0, n = 1).' },
      { t: 'p', text: '**Boucle infinie** : le compteur n\'avance pas, ou avance dans la mauvaise direction. Ici, un programme est arrêté après 2 secondes.' },
    ],
    guided: 'ex_print_line', solo: 'ex_print_square',
    check: ['q_loops_1', 'q_loops_2', 'q_loops_3', 'q_loops_4', 'q_loops_5', 'q_loops_6'],
    videos: ['v_c_loops'],
  },
  {
    id: 'l_functions', skill: 'functions', title: 'Fonctions et valeur de retour', minutes: 15,
    sources: [{ day: 'd03', section: 'Task 04 - my_isneg', page: 3 }, { day: 'd04', section: 'Task 03 - my_strlen', page: 2 }],
    why: [{ t: 'p', text: 'Chaque tâche des PDF est une fonction au prototype imposé. Bien comprendre paramètres et retour, c\'est comprendre ce que le correcteur attend.' }],
    how: [
      { t: 'code', lang: 'c', code: 'int my_max(int a, int b)   /* renvoie un int, reçoit deux int */\n{\n    if (a > b)\n        return a;          /* return termine la fonction */\n    return b;\n}\n\n/* appel : */\nint m = my_max(3, 8);       /* m vaut 8 */' },
      { t: 'list', items: [
        'Le **prototype** donne : type de retour, nom, types des paramètres. Respecte-le exactement (même nom, même ordre, char const *…).',
        'Les paramètres sont des **copies** : modifier `a` dans la fonction ne change pas la variable de l\'appelant. Pour la modifier, il faut son adresse (Day 04).',
        '**Renvoyer** (return) ≠ **afficher**. my_strlen renvoie un nombre ; my_putstr affiche.',
        '`void` : la fonction ne renvoie rien (`void my_swap(...)`) ou ne prend rien (`int my_print_alpha(void)`).',
      ] },
      { t: 'trace', caption: 'Appel et retour de my_max(3, 8)', columns: ['étape', 'a', 'b', 'action'], rows: [['appel', '3', '8', 'copies des arguments'], ['test a > b', '3', '8', 'faux'], ['return b', '3', '8', 'renvoie 8 à l\'appelant'], ['retour', '', '', 'm = 8, a et b disparaissent']] },
    ],
    example: {
      code: 'static int is_digit(char c)\n{\n    return c >= \'0\' && c <= \'9\';\n}\n\nint my_count_digits_in(char const *s)\n{\n    int count = 0;\n\n    while (*s) {\n        if (is_digit(*s))\n            count++;\n        s++;\n    }\n    return count;\n}',
      explain: [{ t: 'p', text: 'Découper en petites fonctions rend chaque morceau simple et testable. `static` : la fonction n\'est visible que dans ce fichier (bonne pratique pour les fonctions utilitaires).' }],
    },
    pitfall: [
      { t: 'p', text: 'Oublier un return sur un chemin (« control reaches end of non-void function ») : la valeur renvoyée est alors indéterminée.' },
      { t: 'p', text: 'Afficher le résultat au lieu de le renvoyer : les tests appellent la fonction et comparent sa valeur.' },
    ],
    guided: 'ex_max3', solo: 'ex_sum_to_n',
    check: ['q_func_1', 'q_func_2', 'q_func_3', 'q_func_4'],
    videos: ['v_c_funcs'],
  },
  {
    id: 'l_putnbr', skill: 'putnbr', title: 'Afficher un nombre (my_put_nbr)', minutes: 25,
    sources: [{ day: 'd03', section: 'Task 07 - my_put_nbr', page: 5 }, { day: 'd03', section: 'Task 08 - Testing', page: 5 }],
    why: [
      { t: 'p', text: 'my_putchar n\'affiche qu\'un caractère. Pour afficher 427, il faut l\'afficher chiffre par chiffre. my_put_nbr revient dans presque tous les sujets suivants (résultats de calcul, compteurs, do-op).' },
    ],
    how: [
      { t: 'list', items: [
        'Dernier chiffre : `n % 10`. Le reste du nombre : `n / 10`.',
        'Problème : ce procédé donne les chiffres **de droite à gauche** (7, 2, 4), alors qu\'il faut les afficher de gauche à droite.',
        'Solution simple : la **récursion**. Pour afficher 427, on affiche d\'abord 42 (appel récursif), puis 7.',
        'Négatif : afficher \'-\', puis la valeur absolue. Attention à -2147483648.',
      ] },
      { t: 'trace', caption: 'put(427) : chaque appel attend que le précédent ait fini', columns: ['appel', 'n >= 10 ?', 'action', 'affiché'], rows: [['put(427)', 'oui', 'appelle put(42)', ''], ['put(42)', 'oui', 'appelle put(4)', ''], ['put(4)', 'non', 'affiche 4 % 10', '4'], ['retour dans put(42)', '', 'affiche 42 % 10', '42'], ['retour dans put(427)', '', 'affiche 427 % 10', '427']] },
    ],
    example: {
      code: 'void my_putchar(char c);\n\nstatic void put_positive(long n)\n{\n    if (n >= 10)\n        put_positive(n / 10);\n    my_putchar(n % 10 + \'0\');\n}\n\nint my_put_nbr(int nb)\n{\n    long n = nb;\n\n    if (n < 0) {\n        my_putchar(\'-\');\n        n = -n;\n    }\n    put_positive(n);\n    return 0;\n}',
      explain: [
        { t: 'p', text: 'On copie nb dans un **long** : sur les machines Linux 64 bits de la piscine, un long va bien au-delà de 2147483648, donc `-n` ne déborde jamais, même pour INT_MIN.' },
        { t: 'p', text: '0 fonctionne aussi : 0 >= 10 est faux, on affiche directement 0 % 10 = 0.' },
      ],
    },
    pitfall: [
      { t: 'p', text: '`nb = -nb` avec nb = -2147483648 : le résultat (2147483648) ne tient pas dans un int. C\'est un comportement indéfini, pas « ça affiche n\'importe quoi » de façon fiable.' },
      { t: 'p', text: 'Une boucle `while (nb > 0)` n\'affiche rien pour 0.' },
      { t: 'note', kind: 'pdf', text: 'Day 03, Task 08 : écrire un main de test qui couvre « all of the function\'s possible situations (both regular or irregular) » : 0, négatif, INT_MIN, INT_MAX, un chiffre, plusieurs chiffres.' },
    ],
    guided: 'ex_count_digits', solo: 'ex_put_nbr',
    check: ['q_putnbr_1', 'q_putnbr_2', 'q_putnbr_3', 'q_putnbr_4'],
    videos: ['v_c_recursion'],
  },
  {
    id: 'l_method', skill: 'method', title: 'Méthode pour un sujet d\'une heure', minutes: 15, complement: true,
    sources: [{ day: 'd03', section: 'Preliminaries', page: 1 }],
    why: [
      { t: 'p', text: 'À l\'examen, tu es seul pendant une heure. Ce qui fait la différence n\'est pas seulement de connaître le C, c\'est d\'avancer **par petits morceaux qui compilent**, et de vérifier les cas limites.' },
      { t: 'note', kind: 'extra', text: 'Cette méthode est un complément pédagogique : les PDF ne décrivent pas le déroulement du stumper.' },
    ],
    how: [
      { t: 'list', items: [
        '**0-5 min — Lire.** Lis tout le sujet. Note : nom du binaire / du fichier, prototype exact, format de sortie (espaces, \\n), comportement en cas d\'erreur (code 84 ? message sur la sortie d\'erreur ?).',
        '**5-10 min — Squelette.** Écris le main, les includes, une fonction vide par étape. Compile. Ça doit compiler avant d\'aller plus loin.',
        '**Ensuite — Une étape à la fois.** Code l\'étape la plus simple, compile, teste avec 2-3 entrées dont un cas limite. Puis l\'étape suivante.',
        '**Cas limites systématiques :** chaîne vide, 0, négatif, INT_MIN / INT_MAX, un seul élément, pas d\'argument, trop d\'arguments.',
        '**Comparer la sortie :** `./prog arg | cat -e` montre les \\n ($) et les espaces en fin de ligne.',
        '**Dernières 5 min :** pas de nouvelle fonctionnalité. Vérifie que tout compile, enlève les affichages de debug, rends.',
      ] },
      { t: 'code', lang: 'sh', code: '$ gcc -Wall -Wextra main.c -o prog\n$ ./prog "hello world" | cat -e\n$ ./prog ; echo $?          # code de sortie (84 attendu en cas d\'erreur)\n$ ./prog "" | cat -e', caption: 'Boucle de travail en terminal' },
    ],
    example: {
      code: '#include <unistd.h>\n\nstatic int step_count(char const *s)\n{\n    (void)s;\n    return 0;   /* TODO étape 2 */\n}\n\nint main(int argc, char **argv)\n{\n    if (argc != 2) {\n        write(2, "Usage: ./prog TEXT\\n", 19);\n        return 84;\n    }\n    step_count(argv[1]);\n    return 0;\n}',
      explain: [{ t: 'p', text: 'Un squelette qui compile et gère déjà les erreurs d\'arguments. `(void)s;` évite l\'avertissement « paramètre inutilisé » le temps d\'écrire la fonction.' }],
    },
    pitfall: [
      { t: 'p', text: 'Écrire 80 lignes d\'un coup puis compiler : tu te retrouves avec 15 erreurs mélangées. Compile toutes les 5 à 10 lignes.' },
      { t: 'p', text: 'Rester bloqué 30 minutes sur une étape : passe à la suivante si elle est indépendante, et reviens après.' },
    ],
    guided: 'ex_count_char', solo: 'ex_last_arg_len',
    check: ['q_method_1', 'q_method_2', 'q_method_3'],
  },
];
