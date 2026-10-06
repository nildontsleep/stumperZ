import type { Lesson } from '../types';

export const LESSONS_TOOLS: Lesson[] = [
  {
    id: 'l_tests', skill: 'tests', title: 'Tester son code', minutes: 20,
    sources: [{ day: 'd03', section: 'Task 08 - Testing', page: 5 }, { day: 'd06', section: 'Introduction - Unit Tests', page: 2 }, { day: 'd06', section: 'Task 04 - Unit tests - part I', page: 3 }],
    why: [
      { t: 'p', text: 'À l\'examen, personne ne te dit si ton code est juste : c\'est à toi de le tester. Le Day 03 dit : « There is no excellence without testing. »' },
    ],
    how: [
      { t: 'p', text: '**Niveau 1 — un main de test** (Day 03, Task 08) : un fichier séparé qui appelle ta fonction sur tous les cas.' },
      { t: 'code', lang: 'c', code: '/* tests/tests_my_put_nbr.c */\nint my_put_nbr(int nb);\nvoid my_putchar(char c);\n\nint main(void)\n{\n    my_put_nbr(0);           my_putchar(\'\\n\');\n    my_put_nbr(42);          my_putchar(\'\\n\');\n    my_put_nbr(-42);         my_putchar(\'\\n\');\n    my_put_nbr(2147483647);  my_putchar(\'\\n\');\n    my_put_nbr(-2147483648); my_putchar(\'\\n\');\n    return 0;\n}' },
      { t: 'p', text: '**Niveau 2 — Criterion** (Day 06) : des tests automatiques qui disent eux-mêmes réussi / échoué.' },
      { t: 'code', lang: 'c', code: '#include <criterion/criterion.h>\n\nTest(my_strncpy, copy_five_characters_in_empty_array)\n{\n    char dest[6] = {0};\n\n    my_strncpy(dest, "HelloWorld", 5);\n    cr_assert_str_eq(dest, "Hello");\n}', caption: 'Exemple tiré du PDF Day 06 (p. 3)' },
      { t: 'list', items: [
        'Choisir les cas : un normal, les **bornes** (0, 1, taille max, INT_MIN/INT_MAX), le **vide** ("", aucun argument), les **erreurs**.',
        'La **couverture** (Day 06) mesure la part du code exécutée par les tests : lignes et branches (chaque côté de chaque if).',
        'Day 12 : une règle `tests_run` dans le Makefile compile et lance les tests.',
      ] },
    ],
    example: {
      code: '$ gcc -o unit_tests my_strncpy.c tests/test_my_strncpy.c --coverage -lcriterion\n$ ./unit_tests',
      explain: [
        { t: 'p', text: 'Commande type pour compiler des tests Criterion avec la couverture (la commande exacte est dans le chapitre « Unit tests for C/C++ » de l\'E-Learning, non fourni ici).' },
        { t: 'note', kind: 'warn', text: 'Criterion n\'est pas disponible dans ce site : les exercices ici utilisent un main de test caché. Entraîne-toi à Criterion sur ta machine.' },
      ],
    },
    pitfall: [{ t: 'p', text: 'Tester seulement le cas de l\'exemple du sujet : c\'est le cas que tout le monde réussit. Les points se perdent sur les cas limites.' }],
    guided: 'ex_strncpy', solo: 'ex_strstr',
    check: ['q_tests_1', 'q_tests_2', 'q_putnbr_3', 'q_method_3'],
  },
  {
    id: 'l_libmy', skill: 'libmy', title: 'Bibliothèque libmy et headers', minutes: 20,
    sources: [{ day: 'd07', section: 'Task 01 - libmy.a', page: 3 }, { day: 'd09', section: 'Task 02 - my.h', page: 3 }],
    why: [{ t: 'p', text: 'À partir du Day 07, tes fonctions des jours précédents sont rangées dans une bibliothèque, libmy.a, réutilisée dans tous les projets. Le Day 09 ajoute un header my.h pour ne plus recopier les prototypes.' }],
    how: [
      { t: 'code', lang: 'sh', code: '# lib/my/build.sh (Day 07)\ngcc -c *.c                 # chaque .c devient un .o\nar rc libmy.a *.o          # on regroupe les .o dans une archive\n\n# utilisation (commande du PDF)\nclang *.c -c -I../include/\nclang *.o autograder/main_taskXX.o -L../lib/my/ -o taskXX -lmy' },
      { t: 'list', items: [
        '**ar rc libmy.a *.o** crée l\'archive (bibliothèque statique).',
        '**-L dossier** : où chercher la bibliothèque ; **-lmy** : utiliser libmy.a.',
        '**-I dossier** : où chercher les .h (`#include "my.h"`).',
        'my.h contient les **prototypes**, pas le code. Protège-le contre la double inclusion avec `#ifndef MY_H / #define MY_H / #endif`.',
        'Ne pousse pas libmy.a compilée : seulement les sources et le script (PDF Day 07).',
      ] },
    ],
    example: {
      code: '#ifndef MY_H\n    #define MY_H\n\nvoid my_putchar(char c);\nint my_put_nbr(int nb);\nint my_strlen(char const *str);\n/* ... */\n\n#endif',
      explain: [{ t: 'p', text: 'Chaque .c qui utilise ces fonctions écrit `#include "my.h"` au lieu de recopier les prototypes.' }],
    },
    pitfall: [{ t: 'p', text: '« undefined reference » à l\'édition des liens : la fonction n\'est pas dans libmy.a (fichier oublié dans build.sh / le Makefile) ou -lmy est placé avant les .o qui l\'utilisent.' }],
    guided: 'ex_strcat', solo: 'ex_strncat',
    check: ['q_lib_1', 'q_lib_2', 'q_compile_2', 'q_compile_4'],
    videos: ['v_staticlib', 'v_c_modular', 'v_gcc'],
  },
  {
    id: 'l_structs', skill: 'structs', title: 'Structures, macros et bits', minutes: 20,
    sources: [{ day: 'd09', section: 'Task 01 - my_macro_abs.h', page: 3 }, { day: 'd09', section: 'Task 03 - my_params_to_array', page: 4 }, { day: 'd09', section: 'Task 05 - get_color', page: 5 }],
    why: [{ t: 'p', text: 'Une structure regroupe plusieurs informations sur une même chose (un paramètre : sa longueur, son texte, sa copie…). C\'est la base des listes chaînées du Day 11.' }],
    how: [
      { t: 'code', lang: 'c', code: 'struct info_param {\n    int length;\n    char *str;\n    char *copy;\n    char **word_array;\n};\n\nstruct info_param p;\np.length = 5;              /* . sur une structure */\n\nstruct info_param *ptr = &p;\nptr->length = 6;           /* -> sur un pointeur de structure */\n\ntypedef struct linked_list {   /* typedef : un nom plus court */\n    void *data;\n    struct linked_list *next;\n} linked_list_t;' },
      { t: 'list', items: [
        '**#define ABS(value) ((value) < 0 ? -(value) : (value))** : une macro est un remplacement de texte ; mets des parenthèses partout.',
        '**Décalages** : `x << 8` décale de 8 bits (× 256). `(r << 16) | (g << 8) | b` assemble une couleur.',
        '**union** (Day 09, swap_endian_color) : plusieurs champs qui partagent la même mémoire.',
      ] },
    ],
    example: {
      code: 'int get_color(unsigned char red, unsigned char green, unsigned char blue)\n{\n    return (red << 16) | (green << 8) | blue;\n}',
      explain: [{ t: 'p', text: 'Rouge 0xFF, vert 0x80, bleu 0x01 → 0x00FF8001 : chaque composante occupe son octet.' }],
    },
    pitfall: [{ t: 'p', text: '`*ptr.length` au lieu de `ptr->length` : le point est prioritaire sur l\'étoile.' }],
    guided: 'ex_get_color',
    check: ['q_structs_1', 'q_structs_2', 'q_structs_3'],
    videos: ['v_c_structs', 'v_c_preproc'],
  },
  {
    id: 'l_makefile', skill: 'makefile', title: 'Makefile', minutes: 20,
    sources: [{ day: 'd10', section: 'Task 01 - Makefile', page: 2 }, { day: 'd10', section: 'Task 02 - do-op', page: 2 }],
    why: [{ t: 'p', text: 'Taper des commandes de compilation à la main devient vite long et source d\'erreurs. make lit un fichier Makefile et ne recompile que ce qui a changé. Dès le Day 10, les projets doivent fournir un Makefile.' }],
    how: [
      { t: 'code', lang: 'make', code: 'SRC\t=\tmain.c \\\n\t\tdo_op.c\n\nOBJ\t=\t$(SRC:.c=.o)\n\nNAME\t=\tdo-op\n\nall:\t$(NAME)\n\n$(NAME):\t$(OBJ)\n\tgcc -o $(NAME) $(OBJ)\n\nclean:\n\trm -f $(OBJ)\n\nfclean:\tclean\n\trm -f $(NAME)\n\nre:\tfclean all\n\n.PHONY:\tall clean fclean re' },
      { t: 'list', items: [
        'Une règle : `cible: dépendances` puis la commande sur la ligne suivante, **indentée par une tabulation** (pas des espaces).',
        '`$(NAME): $(OBJ)` : le binaire n\'est refait que si un .o a changé → **pas de relink**.',
        'Règles exigées par les PDF : all, clean, fclean, re (+ tests_run au Day 12).',
      ] },
    ],
    example: {
      code: '$ make        # compile\n$ make        # rien à faire : « make: Nothing to be done for \'all\' »\n$ make re     # tout supprimer et recompiler',
      explain: [{ t: 'p', text: 'Le second make ne doit rien recompiler : c\'est la vérification « ne relinke pas ».' }],
    },
    pitfall: [
      { t: 'p', text: 'Des espaces au lieu d\'une tabulation devant une commande : « missing separator ».' },
      { t: 'note', kind: 'warn', text: 'make ne peut pas s\'exécuter dans ce site. Exercice local : écris le Makefile ci-dessus pour ton do-op, puis vérifie que `make` deux fois de suite ne recompile rien.' },
    ],
    check: ['q_make_1', 'q_make_2'],
    videos: ['v_make'],
  },
  {
    id: 'l_funcptr', skill: 'funcptr', title: 'Pointeurs sur fonction', minutes: 20,
    sources: [{ day: 'd10', section: 'Task 04 - my_advanced_sort_word_array', page: 4 }, { day: 'd10', section: 'Task 02 - do-op', page: 2 }, { day: 'd11', section: 'Task 04 - my_apply_on_nodes', page: 3 }],
    why: [{ t: 'p', text: 'On peut passer une fonction en paramètre à une autre fonction : le tri reçoit la fonction de comparaison, la liste reçoit la fonction à appliquer. Une seule fonction de tri sert alors pour tous les ordres.' }],
    how: [
      { t: 'code', lang: 'c', code: 'int (*cmp)(char const *, char const *);   /* cmp : pointeur sur fonction */\n\ncmp = my_strcmp;           /* le nom d\'une fonction = son adresse */\nif (cmp("a", "b") < 0)     /* appel comme une fonction normale */\n    ...\n\nint (*ops[5])(int, int) = {my_add, my_sub, my_mul, my_div, my_mod};' },
      { t: 'list', items: [
        'Les parenthèses autour de `*cmp` sont indispensables : `int *cmp(…)` serait une fonction qui renvoie un int *.',
        'Day 10 : un tableau de pointeurs sur fonction associe chaque opérateur à sa fonction (« advised but not mandatory »).',
      ] },
    ],
    example: {
      code: 'int my_apply_on_nodes(linked_list_t *begin, int (*f)(void *))\n{\n    while (begin != NULL) {\n        (*f)(begin->data);\n        begin = begin->next;\n    }\n    return 0;\n}',
      explain: [{ t: 'p', text: 'Le PDF Day 11 précise l\'appel : `(*f)(list_ptr->data);` — équivalent à `f(list_ptr->data);`.' }],
    },
    pitfall: [{ t: 'p', text: 'Passer `my_strcmp()` (un appel) au lieu de `my_strcmp` (l\'adresse de la fonction).' }],
    guided: 'ex_advanced_sort', solo: 'ex_do_op',
    check: ['q_fp_1', 'q_fp_2'],
  },
  {
    id: 'l_lists', skill: 'lists', title: 'Listes chaînées', minutes: 30,
    sources: [{ day: 'd11', section: 'Structure', page: 2 }, { day: 'd11', section: 'Task 01 - my_params_to_list', page: 2 }, { day: 'd11', section: 'Task 03 - my_rev_list', page: 3 }],
    why: [{ t: 'p', text: 'Une liste chaînée stocke des éléments sans taille fixe : chaque nœud connaît le suivant. Ajouter en tête ne coûte rien, contrairement à un tableau qu\'il faudrait réallouer.' }],
    how: [
      { t: 'code', lang: 'c', code: 'typedef struct linked_list {\n    void *data;                 /* adresse de la donnée (n\'importe quel type) */\n    struct linked_list *next;   /* nœud suivant, NULL pour le dernier */\n} linked_list_t;', caption: 'Structure imposée par le Day 11 (dans include/mylist.h)' },
      { t: 'memory', caption: 'Liste [a, b] : head → nœud 1 → nœud 2 → NULL', cells: [
        { id: 'h', name: 'head', value: '0x500', kind: 'ptr' },
        { id: 'n1', addr: '0x500', name: 'data / next', value: '"a" / 0x520', kind: 'heap' },
        { id: 'n2', addr: '0x520', name: 'data / next', value: '"b" / NULL', kind: 'heap' },
      ], arrows: [{ from: 'h', to: 'n1' }, { from: 'n1', to: 'n2' }] },
      { t: 'list', items: [
        '**Parcours** : `for (cur = begin; cur != NULL; cur = cur->next)`.',
        '**Ajout en tête** : nouveau->next = head ; head = nouveau.',
        'Pour modifier la tête depuis une fonction, on reçoit `linked_list_t **begin` et on écrit `*begin = …`.',
        'data est un `void *` : il faut le convertir avant usage, ex. `(char *)node->data`.',
      ] },
    ],
    example: {
      code: 'int my_list_size(linked_list_t const *begin)\n{\n    int n = 0;\n\n    while (begin != NULL) {\n        n++;\n        begin = begin->next;\n    }\n    return n;\n}',
      explain: [{ t: 'p', text: 'begin est une copie locale du pointeur : on peut l\'avancer sans perdre la liste de l\'appelant.' }],
    },
    pitfall: [
      { t: 'p', text: 'Accéder à cur->next quand cur vaut NULL. Le Day 11 avertit : « Watch out for NULL pointers! »' },
      { t: 'p', text: 'Libérer un nœud (free) puis lire son next : sauvegarde next avant.' },
    ],
    guided: 'ex_list_size', solo: 'ex_params_to_list',
    check: ['q_list_1', 'q_list_2', 'q_ptr_5', 'q_ptr_4'],
    videos: ['v_c_lists'],
  },
  {
    id: 'l_fd', skill: 'fd', title: 'Fichiers : open, read, write, close', minutes: 25,
    sources: [{ day: 'd12', section: 'Task 01 - Cat', page: 2 }, { day: 'd12', section: 'Task 03 - grep', page: 4 }],
    why: [{ t: 'p', text: 'Lire un fichier, c\'est la base de cat et grep (Day 12) et de beaucoup de projets. Le système donne un numéro (descripteur) à chaque fichier ouvert.' }],
    how: [
      { t: 'code', lang: 'c', code: '#include <fcntl.h>\n#include <unistd.h>\n\nint fd = open("notes.txt", O_RDONLY);   /* -1 si échec */\nchar buf[30000];\nint n = read(fd, buf, sizeof(buf));     /* nb d\'octets lus, 0 = fin, -1 = erreur */\nwrite(1, buf, n);                       /* écrire exactement n octets */\nclose(fd);' },
      { t: 'list', items: [
        'Descripteurs déjà ouverts : 0 (entrée), 1 (sortie), 2 (erreurs). open renvoie le suivant libre (souvent 3).',
        'read ne lit pas forcément tout : boucler tant que read renvoie > 0.',
        'Le buffer lu n\'est **pas** une chaîne (pas de \\0, et le fichier peut contenir des \\0) : utilise toujours n.',
        'Si open échoue, `errno` indique pourquoi : ENOENT (fichier absent), EACCES (permission refusée). perror est interdit au Day 12 : écris le message toi-même.',
      ] },
    ],
    example: {
      code: 'static void display(int fd)\n{\n    char buf[30000];\n    int n = read(fd, buf, sizeof(buf));\n\n    while (n > 0) {\n        write(1, buf, n);\n        n = read(fd, buf, sizeof(buf));\n    }\n}',
      explain: [{ t: 'p', text: 'Un fichier de 70 000 octets est lu en 3 morceaux (30 000, 30 000, 10 000) puis read renvoie 0.' }],
    },
    pitfall: [
      { t: 'p', text: '`write(1, buf, sizeof(buf))` : écrit aussi les octets non remplis.' },
      { t: 'note', kind: 'pdf', text: 'Day 12 (cat) : tableau de taille fixe d\'environ 30 ko, read de taille 1 interdit, malloc et perror interdits.' },
    ],
    guided: 'ex_cat', solo: 'ex_grep',
    check: ['q_fd_1', 'q_fd_2', 'q_fd_3', 'q_err_1'],
    videos: ['v_c_files'],
  },
  {
    id: 'l_shell', skill: 'shell', title: 'Shell Unix et scripts', minutes: 20,
    sources: [{ day: 'd01', section: 'Task 01 - Create a delivery directory', page: 2 }, { day: 'd01', section: 'Task 05 - mr_clean', page: 6 }, { day: 'd02', section: 'Task 01 - how_many_are_we.sh', page: 2 }],
    why: [{ t: 'p', text: 'Tout se fait dans le terminal : créer des fichiers, compiler, tester, rendre. Les Day 01 et 02 en posent les bases. Pour un stumper en C, l\'essentiel est de savoir naviguer, compiler et tester rapidement.' }],
    how: [
      { t: 'code', lang: 'sh', code: 'ls -la            # lister (avec fichiers cachés et droits)\ncd dossier        # changer de dossier\nmkdir -p a/b      # créer des dossiers\ntouch f           # créer un fichier vide\nchmod 755 f       # droits rwx pour toi, r-x pour les autres\nln -s cible lien  # lien symbolique\ncat -e f          # afficher avec $ en fin de ligne\nfind . -name "*.sh"   # chercher des fichiers\ncmd1 | cmd2       # pipe : sortie de cmd1 → entrée de cmd2\ncmd > f           # rediriger la sortie dans un fichier\necho $?           # code de sortie de la dernière commande' },
      { t: 'list', items: [
        'Un script bash commence par le **shebang** `#!/bin/bash` et doit avoir le droit d\'exécution (chmod +x).',
        'Paramètres d\'un script : $1, $2… ; $# leur nombre.',
        'Outils du Day 02 : grep, cut, tr, sort, rev, wc, sed.',
      ] },
    ],
    example: {
      code: '#!/bin/bash\ngit add .\ngit commit -m "$1"\ngit push',
      explain: [{ t: 'p', text: 'Base d\'un push_that.sh (Day 01, Task 06). Le PDF demande aussi de gérer les « simple obstacles » : à toi de voir lesquels (message vide…).' }],
    },
    pitfall: [{ t: 'p', text: 'Oublier le droit d\'exécution : « Permission denied » en lançant ./script.sh.' }],
    check: ['q_shell_1', 'q_shell_2', 'q_shell_3', 'q_shell_4'],
    videos: ['v_shell', 'v_perms', 'v_redirect', 'v_bash'],
  },
  {
    id: 'l_git', skill: 'git', title: 'Git et rendu', minutes: 10,
    sources: [{ day: 'd01', section: 'Task 04 - Access your repositories - git and github.com', page: 3 }, { day: 'd01', section: 'Do a delivery - Clone a repository and push your work', page: 4 }],
    why: [{ t: 'p', text: 'Tous les rendus passent par GitHub. Un travail non poussé n\'existe pas pour la correction.' }],
    how: [
      { t: 'code', lang: 'sh', code: 'git clone git@github.com:EpitechMyPromo-2042/depot.git   # une seule fois\ngit add my_strlen.c\ngit commit -m "my_strlen"\ngit push\ngit status          # voir ce qui est modifié / ajouté' },
      { t: 'list', items: [
        'add : choisir les fichiers ; commit : enregistrer une version locale ; push : envoyer sur GitHub.',
        'Configuration (une fois) : git config --global user.name / user.email.',
        '.gitignore : exclure les binaires, .o, fichiers temporaires (les PDF insistent : « pay attention to gitignore »).',
      ] },
    ],
    example: {
      code: '$ git status\nOn branch main\nYour branch is ahead of \'origin/main\' by 1 commit.',
      explain: [{ t: 'p', text: '« ahead by 1 commit » : tu as commité mais pas poussé. git push.' }],
    },
    pitfall: [{ t: 'p', text: 'Pousser le binaire a.out ou des .o : le dépôt doit ne contenir que les sources.' }],
    check: ['q_git_1', 'q_git_2'],
    videos: ['v_git'],
  },
];
