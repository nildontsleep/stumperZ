import type { CodeExercise } from '../types';

export const MYLIST_H = String.raw`#ifndef MYLIST_H
#define MYLIST_H

typedef struct linked_list {
    void *data;
    struct linked_list *next;
} linked_list_t;

#endif
`;

const LIST_SUPPORT = String.raw`#include "mylist.h"

static linked_list_t *tst_push(linked_list_t *head, char *s)
{
    linked_list_t *n = malloc(sizeof(linked_list_t));

    n->data = s;
    n->next = head;
    return n;
}

/* builds a list in the given order from a NULL-terminated array */
static linked_list_t *tst_list(char **words)
{
    int n = 0;
    linked_list_t *head = 0;

    while (words[n])
        n++;
    while (n > 0) {
        n--;
        head = tst_push(head, words[n]);
    }
    return head;
}

static void tst_show(linked_list_t const *l)
{
    tst_puts("[");
    while (l) {
        tst_puts((char *)l->data);
        if (l->next)
            tst_puts(", ");
        l = l->next;
    }
    tst_puts("]\n");
}

static int tst_strcmp(void *a, void const *b)
{
    char const *s1 = a;
    char const *s2 = b;

    while (*s1 && *s1 == *s2) {
        s1++;
        s2++;
    }
    return (unsigned char)*s1 - (unsigned char)*s2;
}`;

export const DAY09_12: CodeExercise[] = [
  {
    id: 'ex_get_color',
    title: 'get_color',
    skills: ['structs'],
    level: 2,
    kind: 'function',
    source: { day: 'd09', section: 'Task 05 - get_color', page: 5 },
    relation: 'reproduces',
    minutes: 12,
    statement: [
      { t: 'p', text: 'Renvoie la couleur sous forme d\'int à partir de ses trois composantes, **uniquement avec des décalages de bits**. Ordre des octets (du plus fort au plus faible) : 0, rouge, vert, bleu.' },
      { t: 'code', code: 'get_color(0xFF, 0x80, 0x01) == 0x00FF8001', lang: 'c' },
      { t: 'note', kind: 'pdf', text: 'Le PDF ne précise pas l\'ordre des octets. Le Day 09 parle d\'ARGB pour la tâche suivante : on suppose donc 0xAARRGGBB avec A = 0 ici. Vérifie avec ton sujet.' },
    ],
    file: 'get_color.c',
    prototype: 'int get_color(unsigned char red, unsigned char green, unsigned char blue);',
    allowed: ['write', 'malloc', 'free'],
    starter: 'int get_color(unsigned char red, unsigned char green, unsigned char blue)\n{\n    return 0;\n}\n',
    tests: [
      { name: '(255, 128, 1)', code: 'tst_int(get_color(255, 128, 1));' },
      { name: 'rouge pur', code: 'tst_int(get_color(255, 0, 0));' },
      { name: 'bleu pur', code: 'tst_int(get_color(0, 0, 255));' },
      { name: 'noir', code: 'tst_int(get_color(0, 0, 0));', kind: 'limit' },
      { name: 'blanc', code: 'tst_int(get_color(255, 255, 255));', kind: 'limit' },
    ],
    hints: [
      'Chaque composante occupe un octet (8 bits). Le rouge doit être 16 bits plus à gauche que le bleu.',
      'x << 8 décale x de 8 bits vers la gauche (= × 256). | combine des bits sans retenue.',
      'return (red << 16) | (green << 8) | blue;',
      'return (red << 16) | (green << 8) | blue;',
    ],
    solution: String.raw`int get_color(unsigned char red, unsigned char green, unsigned char blue)
{
    /* 0x00RRGGBB : chaque composante prend sa place d'octet */
    return (red << 16) | (green << 8) | blue;
}
`,
    solutionNotes: [{ t: 'p', text: '255 << 16 = 0xFF0000 = 16711680. Les unsigned char sont d\'abord convertis en int avant le décalage.' }],
    pitfalls: ['Utiliser + avec des décalages faux.', 'Décaler de 16 pour le vert.'],
    prereqs: ['structs'],
  },
  {
    id: 'ex_sort_word_array',
    title: 'my_sort_word_array',
    skills: ['wordarray', 'strfuncs'],
    level: 2,
    kind: 'function',
    source: { day: 'd10', section: 'Task 03 - my_sort_word_array', page: 4 },
    relation: 'reproduces',
    minutes: 15,
    statement: [{ t: 'p', text: 'Trie un tableau de mots terminé par NULL dans l\'ordre ASCII, en **échangeant les pointeurs**. Renvoie toujours 0.' }],
    file: 'my_sort_word_array.c',
    prototype: 'int my_sort_word_array(char **tab);',
    allowed: ['write', 'malloc', 'free'],
    support: String.raw`static void tst_words(char **t)
{
    int i = 0;

    while (t[i] != 0) {
        tst_str(t[i]);
        i++;
    }
    tst_puts("NULL\n");
}`,
    starter: 'int my_sort_word_array(char **tab)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'mots mélangés', code: 'char *t[] = {"pear", "apple", "fig", "banana", 0};\nmy_sort_word_array(t);\ntst_words(t);' },
      { name: 'majuscules avant minuscules', code: 'char *t[] = {"b", "B", "a", "A", 0};\nmy_sort_word_array(t);\ntst_words(t);', kind: 'limit' },
      { name: 'préfixes', code: 'char *t[] = {"abc", "ab", "a", 0};\nmy_sort_word_array(t);\ntst_words(t);', kind: 'limit' },
      { name: 'tableau vide', code: 'char *t[] = {0};\ntst_int(my_sort_word_array(t));', kind: 'empty' },
      { name: 'les pointeurs sont échangés', code: 'char *w1 = "zz";\nchar *w2 = "aa";\nchar *t[] = {w1, w2, 0};\nmy_sort_word_array(t);\ntst_int(t[0] == w2 && t[1] == w1);' },
    ],
    hints: [
      'Même tri qu\'au Day 07 (my_sort_params), mais la taille n\'est pas donnée : le tableau finit par NULL.',
      'Compte d\'abord les mots (jusqu\'à NULL), puis tri à bulles avec un my_strcmp écrit dans le fichier.',
      '1) n = nombre de mots ; 2) tri à bulles : si strcmp(tab[i], tab[i + 1]) > 0, échanger tab[i] et tab[i + 1] ; 3) return 0.',
      'char *tmp;\n\ntmp = tab[i];\ntab[i] = tab[i + 1];\ntab[i + 1] = tmp;',
    ],
    solution: String.raw`static int cmp(char const *s1, char const *s2)
{
    while (*s1 != '\0' && *s1 == *s2) {
        s1++;
        s2++;
    }
    return (unsigned char)*s1 - (unsigned char)*s2;
}

int my_sort_word_array(char **tab)
{
    int n = 0;
    int i;
    int sorted = 0;
    char *tmp;

    while (tab[n] != 0)
        n++;
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
    return 0;
}
`,
    solutionNotes: [],
    pitfalls: ['Copier les caractères au lieu des pointeurs.'],
    prereqs: ['wordarray', 'strfuncs'],
  },
  {
    id: 'ex_advanced_sort',
    title: 'my_advanced_sort_word_array',
    skills: ['funcptr', 'wordarray'],
    level: 3,
    kind: 'function',
    source: { day: 'd10', section: 'Task 04 - my_advanced_sort_word_array', page: 4 },
    relation: 'reproduces',
    minutes: 15,
    statement: [
      { t: 'p', text: 'Même tri, mais l\'ordre est décidé par la fonction `cmp` passée en paramètre : on échange tab[i] et tab[i + 1] quand `cmp(tab[i], tab[i + 1]) > 0`. Renvoie 0.' },
      { t: 'note', kind: 'pdf', text: 'Avec my_strcmp comme cmp, le résultat est le même que my_sort_word_array.' },
    ],
    file: 'my_advanced_sort_word_array.c',
    prototype: 'int my_advanced_sort_word_array(char **tab, int(*cmp)(char const *, char const *));',
    allowed: ['write', 'malloc', 'free'],
    support: String.raw`static void tst_words(char **t)
{
    int i = 0;

    while (t[i] != 0) {
        tst_str(t[i]);
        i++;
    }
    tst_puts("NULL\n");
}

static int by_ascii(char const *a, char const *b)
{
    while (*a && *a == *b) {
        a++;
        b++;
    }
    return (unsigned char)*a - (unsigned char)*b;
}

static int by_length(char const *a, char const *b)
{
    int la = 0;
    int lb = 0;

    while (a[la])
        la++;
    while (b[lb])
        lb++;
    return la - lb;
}

static int reverse(char const *a, char const *b)
{
    return by_ascii(b, a);
}`,
    starter: 'int my_advanced_sort_word_array(char **tab, int (*cmp)(char const *, char const *))\n{\n    return 0;\n}\n',
    tests: [
      { name: 'ordre ASCII', code: 'char *t[] = {"pear", "apple", "fig", 0};\nmy_advanced_sort_word_array(t, by_ascii);\ntst_words(t);' },
      { name: 'par longueur', code: 'char *t[] = {"ccc", "a", "bb", "dddd", 0};\nmy_advanced_sort_word_array(t, by_length);\ntst_words(t);' },
      { name: 'ordre inverse', code: 'char *t[] = {"a", "c", "b", 0};\nmy_advanced_sort_word_array(t, reverse);\ntst_words(t);', kind: 'limit' },
      { name: 'vide', code: 'char *t[] = {0};\ntst_int(my_advanced_sort_word_array(t, by_ascii));', kind: 'empty' },
    ],
    hints: [
      'C\'est my_sort_word_array où l\'appel à ton my_strcmp est remplacé par un appel à cmp.',
      'cmp est une variable qui contient l\'adresse d\'une fonction. On l\'appelle comme une fonction : cmp(a, b).',
      'Recopie ton tri et remplace la comparaison par if (cmp(tab[i], tab[i + 1]) > 0).',
      'if (cmp(tab[i], tab[i + 1]) > 0) {\n    /* échange */\n}',
    ],
    solution: String.raw`int my_advanced_sort_word_array(char **tab, int (*cmp)(char const *, char const *))
{
    int n = 0;
    int i;
    int sorted = 0;
    char *tmp;

    while (tab[n] != 0)
        n++;
    while (!sorted) {
        sorted = 1;
        for (i = 0; i < n - 1; i++) {
            if (cmp(tab[i], tab[i + 1]) > 0) {   /* la fonction reçue décide de l'ordre */
                tmp = tab[i];
                tab[i] = tab[i + 1];
                tab[i + 1] = tmp;
                sorted = 0;
            }
        }
    }
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: '`int (*cmp)(char const *, char const *)` se lit : cmp est un pointeur vers une fonction qui prend deux char const * et renvoie un int.' }],
    pitfalls: ['Écrire *cmp(a, b) (priorité : appelle cmp puis déréférence le résultat).'],
    prereqs: ['funcptr', 'wordarray'],
  },
  {
    id: 'ex_do_op',
    title: 'do-op',
    skills: ['argv', 'getnbr', 'errors84'],
    level: 3,
    kind: 'program',
    source: { day: 'd10', section: 'Task 02 - do-op', page: 2 },
    relation: 'reproduces',
    minutes: 40,
    statement: [
      { t: 'p', text: 'Programme `./do-op valeur1 opérateur valeur2` qui affiche le résultat de l\'opération (+ - * / %), suivi de `\\n`.' },
      { t: 'list', items: [
        'Les valeurs sont lues comme my_getnbr : « 42friends » vaut 42, « -----20toto12 » vaut -20, « toto3 » vaut 0.',
        'L\'opérateur est le **premier caractère** du 2e argument : « +toto » est un +.',
        'Opérateur inconnu : afficher 0 et sortir en erreur (84).',
        'Mauvais nombre d\'arguments : ne rien afficher, sortir en erreur (84).',
        'Division / modulo par zéro : « Stop: division by zero » / « Stop: modulo by zero » sur la sortie d\'erreur, code 84.',
      ] },
      { t: 'code', code: '~$> ./do-op 1 + 1\n2\n~$> ./do-op 42friends - -----20toto12\n62\n~$> ./do-op 1 p 1\n0\n~$> ./do-op 25 / 0 > /dev/null\nStop: division by zero', lang: 'sh', caption: 'Exemples du PDF (p. 3)' },
      { t: 'note', kind: 'pdf', text: 'Le PDF demande aussi un Makefile (all, clean, fclean, re, sans relink) : non vérifiable ici, entraîne-toi en local. Le PDF ne précise pas si « 0 » d\'un opérateur inconnu va sur la sortie standard : les tests supposent la sortie standard (l\'exemple montre 0 sans redirection).' },
    ],
    file: 'main.c',
    allowed: ['write'],
    starter: '#include <unistd.h>\n\nint main(int argc, char **argv)\n{\n    return 0;\n}\n',
    tests: [
      { name: '1 + 1', args: ['1', '+', '1'], checkExit: true },
      { name: '42friends - -----20toto12', args: ['42friends', '-', '-----20toto12'], checkExit: true },
      { name: '6 * 7', args: ['6', '*', '7'], checkExit: true },
      { name: '-7 / 2', args: ['-7', '/', '2'], checkExit: true, kind: 'limit' },
      { name: '-7 % 3', args: ['-7', '%', '3'], checkExit: true, kind: 'limit' },
      { name: '1 +toto 1', args: ['1', '+toto', '1'], checkExit: true, kind: 'limit' },
      { name: 'toto3 + 4', args: ['toto3', '+', '4'], checkExit: true, kind: 'limit' },
      { name: 'opérateur inconnu', args: ['1', 'p', '1'], checkExit: true, kind: 'error' },
      { name: 'division par zéro', args: ['25', '/', '0'], checkExit: true, stderr: 'any', kind: 'error' },
      { name: 'modulo par zéro', args: ['25', '%', '0'], checkExit: true, stderr: 'any', kind: 'error' },
      { name: 'pas d\'argument', args: [], checkExit: true, kind: 'error' },
      { name: 'trop d\'arguments', args: ['1', '+', '1', '1'], checkExit: true, kind: 'error' },
    ],
    hints: [
      'Découpe : 1) vérifier argc ; 2) convertir les deux valeurs (ton my_getnbr) ; 3) choisir l\'opération selon argv[2][0] ; 4) gérer / et % par 0 ; 5) afficher (ton my_put_nbr).',
      'argc doit valoir 4 (le nom du programme + 3 arguments). Le résultat peut être négatif : my_put_nbr doit gérer le signe.',
      '1) if (argc != 4) return 84 ; 2) a = my_getnbr(argv[1]), b = my_getnbr(argv[3]), op = argv[2][0] ; 3) if (op == \'/\' && b == 0) → message sur fd 2, return 84 ; 4) selon op calculer et afficher ; opérateur inconnu → afficher "0\\n", return 84.',
      'int main(int argc, char **argv)\n{\n    int a;\n    int b;\n    char op;\n\n    if (argc != 4)\n        return 84;\n    a = my_getnbr(argv[1]);\n    b = my_getnbr(argv[3]);\n    op = argv[2][0];\n    /* ... */\n}',
    ],
    solution: String.raw`#include <unistd.h>

static void my_putchar(char c)
{
    write(1, &c, 1);
}

static void my_put_nbr(long n)
{
    if (n < 0) {
        my_putchar('-');
        n = -n;
    }
    if (n >= 10)
        my_put_nbr(n / 10);
    my_putchar(n % 10 + '0');
}

static int my_getnbr(char const *str)
{
    int i = 0;
    int neg = 0;
    long r = 0;

    while (str[i] == '+' || str[i] == '-') {
        if (str[i] == '-')
            neg = !neg;
        i++;
    }
    while (str[i] >= '0' && str[i] <= '9') {
        r = r * 10 + (str[i] - '0');
        if ((!neg && r > 2147483647) || (neg && r > 2147483648))
            return 0;
        i++;
    }
    return neg ? -r : r;
}

static void put_err(char const *msg)
{
    int n = 0;

    while (msg[n] != '\0')
        n++;
    write(2, msg, n);
}

int main(int argc, char **argv)
{
    long a;
    long b;
    char op;

    if (argc != 4)
        return 84;                      /* rien à afficher */
    a = my_getnbr(argv[1]);
    b = my_getnbr(argv[3]);
    op = argv[2][0];
    if (op == '/' && b == 0) {
        put_err("Stop: division by zero\n");
        return 84;
    }
    if (op == '%' && b == 0) {
        put_err("Stop: modulo by zero\n");
        return 84;
    }
    if (op == '+')
        my_put_nbr(a + b);
    else if (op == '-')
        my_put_nbr(a - b);
    else if (op == '*')
        my_put_nbr(a * b);
    else if (op == '/')
        my_put_nbr(a / b);
    else if (op == '%')
        my_put_nbr(a % b);
    else {
        write(1, "0\n", 2);             /* expression incorrecte */
        return 84;
    }
    my_putchar('\n');
    return 0;
}
`,
    solutionNotes: [
      { t: 'p', text: 'Les calculs sont faits en long pour éviter les débordements de int (par exemple 2147483647 + 1).' },
      { t: 'p', text: 'En C, la division entière tronque vers 0 : -7 / 2 = -3 et -7 % 3 = -1.' },
      { t: 'p', text: 'Le PDF conseille un tableau de pointeurs sur fonctions (voir le cours « Pointeurs sur fonction ») ; une suite de if est acceptée.' },
    ],
    pitfalls: ['Diviser avant de tester le zéro : plantage.', 'Écrire « Stop: … » sur la sortie standard.', 'Comparer argv[2] entier à "+" (« +toto » doit marcher).'],
    prereqs: ['argv', 'getnbr', 'errors84', 'putnbr'],
  },
  {
    id: 'ex_params_to_list',
    title: 'my_params_to_list',
    skills: ['lists', 'malloc'],
    level: 2,
    kind: 'function',
    source: { day: 'd11', section: 'Task 01 - my_params_to_list', page: 2 },
    relation: 'reproduces',
    minutes: 15,
    statement: [
      { t: 'p', text: 'Crée une liste chaînée à partir des arguments : chaque argument est ajouté **en tête** de liste. Renvoie l\'adresse du premier nœud.' },
      { t: 'p', text: 'Pour `./a.out test arg2 arg3`, le parcours donne : arg3, arg2, test, ./a.out.' },
      { t: 'note', kind: 'pdf', text: 'La structure linked_list_t est dans mylist.h (fourni, à inclure avec #include "mylist.h").' },
    ],
    file: 'my_params_to_list.c',
    prototype: 'linked_list_t *my_params_to_list(int ac, char * const *av);',
    allowed: ['write', 'malloc', 'free'],
    header: { name: 'mylist.h', code: MYLIST_H },
    support: LIST_SUPPORT,
    starter: '#include <stdlib.h>\n#include "mylist.h"\n\nlinked_list_t *my_params_to_list(int ac, char * const *av)\n{\n    return NULL;\n}\n',
    tests: [
      { name: 'exemple du PDF', code: 'char *av[] = {"./a.out", "test", "arg2", "arg3", 0};\ntst_show(my_params_to_list(4, av));' },
      { name: 'un seul argument', code: 'char *av[] = {"./a.out", 0};\ntst_show(my_params_to_list(1, av));', kind: 'limit' },
      { name: 'ac = 0', code: 'char *av[] = {0};\ntst_show(my_params_to_list(0, av));', kind: 'empty' },
      { name: 'data pointe sur l\'argument', code: 'char *av[] = {"x", "y", 0};\nlinked_list_t *l = my_params_to_list(2, av);\ntst_int(l->data == av[1]);' },
    ],
    hints: [
      'Ajouter en tête = le nouveau nœud pointe vers l\'ancienne tête, et devient la nouvelle tête.',
      'Pour chaque argument : node = malloc(sizeof(linked_list_t)) ; node->data = av[i] ; node->next = head ; head = node.',
      '1) head = NULL ; 2) pour i de 0 à ac - 1 : créer le nœud, le mettre en tête ; 3) return head.',
      'linked_list_t *head = NULL;\nlinked_list_t *node;\nint i = 0;\n\nwhile (i < ac) {\n    node = malloc(sizeof(linked_list_t));\n    if (node == NULL)\n        return NULL;\n    node->data = av[i];\n    node->next = head;\n    head = node;\n    i++;\n}\nreturn head;',
    ],
    solution: String.raw`#include <stdlib.h>
#include "mylist.h"

linked_list_t *my_params_to_list(int ac, char * const *av)
{
    linked_list_t *head = NULL;
    linked_list_t *node;
    int i = 0;

    while (i < ac) {
        node = malloc(sizeof(linked_list_t));
        if (node == NULL)
            return NULL;
        node->data = av[i];     /* on stocke l'adresse de l'argument */
        node->next = head;      /* le nouveau nœud pointe vers l'ancienne tête */
        head = node;            /* ... et devient la tête */
        i++;
    }
    return head;
}
`,
    solutionNotes: [{ t: 'p', text: 'Ajouter en tête est en temps constant : pas besoin de parcourir la liste. C\'est pour ça que l\'ordre est inversé.' }],
    pitfalls: ['sizeof(linked_list_t *) au lieu de sizeof(linked_list_t).', 'Oublier de mettre à jour head.'],
    prereqs: ['lists', 'malloc'],
  },
  {
    id: 'ex_list_size',
    title: 'my_list_size',
    skills: ['lists'],
    level: 1,
    kind: 'function',
    source: { day: 'd11', section: 'Task 02 - my_list_size', page: 2 },
    relation: 'reproduces',
    minutes: 6,
    statement: [{ t: 'p', text: 'Renvoie le nombre d\'éléments de la liste.' }],
    file: 'my_list_size.c',
    prototype: 'int my_list_size(linked_list_t const *begin);',
    allowed: ['write', 'malloc', 'free'],
    header: { name: 'mylist.h', code: MYLIST_H },
    support: LIST_SUPPORT,
    starter: '#include "mylist.h"\n\nint my_list_size(linked_list_t const *begin)\n{\n    return 0;\n}\n',
    tests: [
      { name: '3 éléments', code: 'char *w[] = {"a", "b", "c", 0};\ntst_int(my_list_size(tst_list(w)));' },
      { name: '1 élément', code: 'char *w[] = {"a", 0};\ntst_int(my_list_size(tst_list(w)));', kind: 'limit' },
      { name: 'liste vide (NULL)', code: 'tst_int(my_list_size(0));', kind: 'empty' },
    ],
    hints: [
      'Suivre les next jusqu\'à NULL en comptant.',
      'Un pointeur courant qui part de begin et avance avec cur = cur->next.',
      'count = 0 ; tant que begin != NULL : count++ ; begin = begin->next ; return count.',
      'int count = 0;\n\nwhile (begin != NULL) {\n    count++;\n    begin = begin->next;\n}\nreturn count;',
    ],
    solution: String.raw`#include <stddef.h>
#include "mylist.h"

int my_list_size(linked_list_t const *begin)
{
    int count = 0;

    while (begin != NULL) {     /* begin est une copie locale : on peut l'avancer */
        count++;
        begin = begin->next;
    }
    return count;
}
`,
    solutionNotes: [],
    pitfalls: ['Tester begin->next != NULL : le dernier n\'est pas compté, et NULL plante.'],
    prereqs: ['lists'],
  },
  {
    id: 'ex_rev_list',
    title: 'my_rev_list',
    skills: ['lists', 'pointers'],
    level: 3,
    kind: 'function',
    source: { day: 'd11', section: 'Task 03 - my_rev_list', page: 3 },
    relation: 'reproduces',
    minutes: 20,
    statement: [{ t: 'p', text: 'Inverse l\'ordre des éléments de la liste. On reçoit l\'**adresse** du pointeur de tête, pour pouvoir la modifier.' }],
    file: 'my_rev_list.c',
    prototype: 'void my_rev_list(linked_list_t **begin);',
    allowed: ['write', 'malloc', 'free'],
    header: { name: 'mylist.h', code: MYLIST_H },
    support: LIST_SUPPORT,
    starter: '#include "mylist.h"\n\nvoid my_rev_list(linked_list_t **begin)\n{\n}\n',
    tests: [
      { name: '[a, b, c, d]', code: 'char *w[] = {"a", "b", "c", "d", 0};\nlinked_list_t *l = tst_list(w);\nmy_rev_list(&l);\ntst_show(l);' },
      { name: '[a, b]', code: 'char *w[] = {"a", "b", 0};\nlinked_list_t *l = tst_list(w);\nmy_rev_list(&l);\ntst_show(l);', kind: 'limit' },
      { name: '[a]', code: 'char *w[] = {"a", 0};\nlinked_list_t *l = tst_list(w);\nmy_rev_list(&l);\ntst_show(l);', kind: 'limit' },
      { name: 'liste vide', code: 'linked_list_t *l = 0;\nmy_rev_list(&l);\ntst_show(l);', kind: 'empty' },
    ],
    hints: [
      'On retourne chaque flèche next : chaque nœud doit pointer vers son précédent au lieu de son suivant.',
      'Trois pointeurs : prev (déjà inversé, au début NULL), cur (le nœud traité), next (sauvegarde de cur->next avant de l\'écraser).',
      '1) prev = NULL, cur = *begin ; 2) tant que cur : next = cur->next ; cur->next = prev ; prev = cur ; cur = next ; 3) *begin = prev.',
      'linked_list_t *prev = NULL;\nlinked_list_t *cur = *begin;\nlinked_list_t *next;\n\nwhile (cur != NULL) {\n    next = cur->next;\n    cur->next = prev;\n    prev = cur;\n    cur = next;\n}\n*begin = prev;',
    ],
    solution: String.raw`#include <stddef.h>
#include "mylist.h"

void my_rev_list(linked_list_t **begin)
{
    linked_list_t *prev = NULL;
    linked_list_t *cur = *begin;
    linked_list_t *next;

    while (cur != NULL) {
        next = cur->next;   /* sauver la suite avant de casser le lien */
        cur->next = prev;   /* retourner la flèche */
        prev = cur;
        cur = next;
    }
    *begin = prev;          /* l'ancien dernier devient la tête */
}
`,
    solutionNotes: [{ t: 'p', text: 'Pourquoi `**begin` ? La tête change. Pour modifier le pointeur de l\'appelant, il faut son adresse — exactement comme my_swap avait besoin de l\'adresse des int.' }],
    pitfalls: ['Perdre la suite de la liste en écrasant cur->next sans l\'avoir sauvée.', 'Oublier *begin = prev.'],
    prereqs: ['lists', 'pointers'],
  },
  {
    id: 'ex_delete_nodes',
    title: 'my_delete_nodes',
    skills: ['lists', 'funcptr'],
    level: 3,
    kind: 'function',
    source: { day: 'd11', section: 'Task 07 - my_delete_nodes', page: 4 },
    relation: 'reproduces',
    minutes: 25,
    statement: [
      { t: 'p', text: 'Supprime de la liste tous les nœuds dont la donnée est égale à `data_ref` (égale = `cmp(data, data_ref) == 0`). Libère les nœuds supprimés. Renvoie 0.' },
      { t: 'note', kind: 'info', text: 'Le PDF ne précise pas la valeur de retour : les tests ne la vérifient pas. Les données ne doivent pas être libérées (elles n\'ont pas été allouées par la liste).' },
    ],
    file: 'my_delete_nodes.c',
    prototype: 'int my_delete_nodes(linked_list_t **begin, void const *data_ref, int (*cmp)(void *, void const *));',
    allowed: ['write', 'malloc', 'free'],
    header: { name: 'mylist.h', code: MYLIST_H },
    support: LIST_SUPPORT,
    starter: '#include <stdlib.h>\n#include "mylist.h"\n\nint my_delete_nodes(linked_list_t **begin, void const *data_ref,\n    int (*cmp)(void *, void const *))\n{\n    return 0;\n}\n',
    tests: [
      { name: 'au milieu', code: 'char *w[] = {"a", "x", "b", 0};\nlinked_list_t *l = tst_list(w);\nmy_delete_nodes(&l, "x", tst_strcmp);\ntst_show(l);' },
      { name: 'en tête', code: 'char *w[] = {"x", "a", "b", 0};\nlinked_list_t *l = tst_list(w);\nmy_delete_nodes(&l, "x", tst_strcmp);\ntst_show(l);', kind: 'limit' },
      { name: 'consécutifs et en fin', code: 'char *w[] = {"a", "x", "x", "b", "x", 0};\nlinked_list_t *l = tst_list(w);\nmy_delete_nodes(&l, "x", tst_strcmp);\ntst_show(l);', kind: 'limit' },
      { name: 'tout supprimer', code: 'char *w[] = {"x", "x", 0};\nlinked_list_t *l = tst_list(w);\nmy_delete_nodes(&l, "x", tst_strcmp);\ntst_show(l);', kind: 'limit' },
      { name: 'absent', code: 'char *w[] = {"a", "b", 0};\nlinked_list_t *l = tst_list(w);\nmy_delete_nodes(&l, "x", tst_strcmp);\ntst_show(l);' },
      { name: 'liste vide', code: 'linked_list_t *l = 0;\nmy_delete_nodes(&l, "x", tst_strcmp);\ntst_show(l);', kind: 'empty' },
    ],
    hints: [
      'Deux situations : supprimer la tête (il faut changer *begin) et supprimer un nœud au milieu (il faut changer le next du précédent).',
      'Traite d\'abord les têtes à supprimer avec une boucle sur *begin. Ensuite, parcours avec cur et regarde cur->next : si cur->next est à supprimer, cur->next = cur->next->next.',
      '1) tant que *begin et cmp((*begin)->data, data_ref) == 0 : tmp = *begin ; *begin = tmp->next ; free(tmp) ; 2) cur = *begin ; tant que cur et cur->next : si cmp(cur->next->data, data_ref) == 0 → retirer cur->next (sans avancer) ; sinon cur = cur->next.',
      'linked_list_t *tmp;\nlinked_list_t *cur;\n\nwhile (*begin != NULL && cmp((*begin)->data, data_ref) == 0) {\n    /* supprimer la tête */\n}\ncur = *begin;\nwhile (cur != NULL && cur->next != NULL) {\n    if (cmp(cur->next->data, data_ref) == 0) {\n        /* retirer cur->next */\n    } else\n        cur = cur->next;\n}',
    ],
    solution: String.raw`#include <stdlib.h>
#include "mylist.h"

int my_delete_nodes(linked_list_t **begin, void const *data_ref,
    int (*cmp)(void *, void const *))
{
    linked_list_t *tmp;
    linked_list_t *cur;

    while (*begin != NULL && cmp((*begin)->data, data_ref) == 0) {
        tmp = *begin;
        *begin = tmp->next;         /* la tête change */
        free(tmp);
    }
    cur = *begin;
    while (cur != NULL && cur->next != NULL) {
        if (cmp(cur->next->data, data_ref) == 0) {
            tmp = cur->next;
            cur->next = tmp->next;  /* on « saute » le nœud */
            free(tmp);              /* on n'avance pas : le nouveau suivant doit être testé */
        } else {
            cur = cur->next;
        }
    }
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: '(*begin)->data : les parenthèses sont obligatoires, car -> est prioritaire sur *.' }],
    pitfalls: ['Avancer cur après une suppression : rate deux nœuds consécutifs.', 'Utiliser un nœud après free.', '*begin->data au lieu de (*begin)->data.'],
    prereqs: ['lists', 'funcptr'],
  },
  {
    id: 'ex_cat',
    title: 'cat',
    skills: ['fd', 'errors84'],
    level: 3,
    kind: 'program',
    source: { day: 'd12', section: 'Task 01 - Cat', page: 2 },
    relation: 'reproduces',
    minutes: 40,
    statement: [
      { t: 'p', text: 'Reproduis `cat` sans options : affiche le contenu de chaque fichier passé en paramètre, dans l\'ordre. Sans paramètre, lit l\'entrée standard.' },
      { t: 'list', items: [
        'Tableau de taille fixe (environ 30 ko) ; malloc et perror interdits ; read de taille 1 interdit.',
        'Fichier introuvable : message sur la sortie d\'erreur, on continue avec les fichiers suivants, et le programme finit avec le code 84.',
        'Fonctions autorisées : open, read, write, close.',
      ] },
      { t: 'note', kind: 'info', text: 'Ici, les fichiers sont simulés en mémoire (notes.txt, empty.txt, big.txt…). Le Makefile et la limite de pile (limit stacksize) sont à tester en local.' },
    ],
    file: 'main.c',
    allowed: ['open', 'read', 'write', 'close'],
    starter: '#include <fcntl.h>\n#include <unistd.h>\n\nint main(int argc, char **argv)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'un fichier', args: ['notes.txt'], files: { 'notes.txt': 'ligne 1\nligne 2\n' }, checkExit: true, stderr: 'empty' },
      { name: 'deux fichiers', args: ['a.txt', 'b.txt'], files: { 'a.txt': 'AAA\n', 'b.txt': 'BBB' }, checkExit: true },
      { name: 'fichier vide', args: ['empty.txt'], files: { 'empty.txt': '' }, checkExit: true, kind: 'empty' },
      { name: 'gros fichier (> buffer)', args: ['big.txt'], files: { 'big.txt': ('0123456789abcdef'.repeat(4) + '\n').repeat(700) }, checkExit: true, kind: 'limit' },
      { name: 'entrée standard', args: [], stdin: 'depuis stdin\n', checkExit: true },
      { name: 'fichier absent puis présent', args: ['nope.txt', 'a.txt'], files: { 'a.txt': 'AAA\n' }, checkExit: true, stderr: 'any', kind: 'error' },
      { name: 'permission refusée', args: ['secret.txt'], files: { 'secret.txt': 'x' }, denied: ['secret.txt'], checkExit: true, stderr: 'any', kind: 'error' },
    ],
    hints: [
      'Pour chaque fichier : l\'ouvrir, lire un gros morceau, écrire ce morceau, recommencer jusqu\'à ce que read renvoie 0, fermer.',
      'read(fd, buf, SIZE) renvoie le nombre d\'octets lus (0 = fin, -1 = erreur). On écrit exactement ce nombre avec write(1, buf, n). Sans argument, fd = 0 (entrée standard).',
      '1) fonction display(int fd) : while ((n = read(fd, buf, sizeof(buf))) > 0) write(1, buf, n) ; 2) main : si argc == 1 → display(0) ; sinon pour chaque argv[i] : fd = open(argv[i], O_RDONLY) ; si fd == -1 → message d\'erreur, ret = 84 ; sinon display(fd), close(fd) ; 3) return ret.',
      'static int display(int fd)\n{\n    char buf[30000];\n    int n;\n\n    n = read(fd, buf, sizeof(buf));\n    while (n > 0) {\n        write(1, buf, n);\n        n = read(fd, buf, sizeof(buf));\n    }\n    return n;\n}',
    ],
    solution: String.raw`#include <fcntl.h>
#include <unistd.h>
#include <errno.h>

static void put_err(char const *s)
{
    int n = 0;

    while (s[n] != '\0')
        n++;
    write(2, s, n);
}

static int display(int fd)
{
    char buf[30000];        /* tableau de taille fixe, pas de malloc */
    int n = read(fd, buf, sizeof(buf));

    while (n > 0) {
        write(1, buf, n);   /* on écrit exactement ce qui a été lu */
        n = read(fd, buf, sizeof(buf));
    }
    return n;               /* 0 = fin du fichier, -1 = erreur */
}

static int cat_file(char const *path)
{
    int fd = open(path, O_RDONLY);

    if (fd == -1) {
        put_err("cat: ");
        put_err(path);
        put_err(errno == EACCES ? ": Permission denied\n" : ": No such file or directory\n");
        return 84;
    }
    display(fd);
    close(fd);
    return 0;
}

int main(int argc, char **argv)
{
    int ret = 0;
    int i = 1;

    if (argc == 1) {
        display(0);         /* sans argument : entrée standard */
        return 0;
    }
    while (i < argc) {
        if (cat_file(argv[i]) == 84)
            ret = 84;       /* on continue avec les fichiers suivants */
        i++;
    }
    return ret;
}
`,
    solutionNotes: [
      { t: 'p', text: 'Un fichier peut être plus gros que le buffer : la boucle read/write gère le contenu par morceaux.' },
      { t: 'p', text: 'errno est rempli par open en cas d\'échec. Le PDF autorise errno mais interdit perror : on écrit donc nous-mêmes le message.' },
    ],
    pitfalls: ['Écrire sizeof(buf) octets au lieu de n.', 'S\'arrêter au premier fichier en erreur.', 'Oublier close.', 'Lire 1 octet à la fois (interdit).'],
    prereqs: ['fd', 'errors84', 'argv'],
  },
  {
    id: 'ex_grep',
    title: 'grep',
    skills: ['fd', 'errors84', 'strfuncs'],
    level: 3,
    kind: 'program',
    source: { day: 'd12', section: 'Task 03 - grep', page: 4 },
    relation: 'reproduces',
    minutes: 55,
    statement: [
      { t: 'p', text: 'Reproduis `grep MOTIF fichiers…` : affiche les lignes qui **contiennent** le motif (correspondance simple, pas de regex). malloc/free sont autorisés pour cette tâche.' },
      { t: 'list', items: [
        'Avec plusieurs fichiers, comme le vrai grep, chaque ligne est préfixée par « nom_du_fichier: ».',
        'Fichier introuvable : « grep: FICHIER: No such file or directory » sur la sortie d\'erreur ; « Permission denied » si l\'accès est refusé. Code de sortie 84 en cas d\'erreur.',
        'Une dernière ligne sans \\n est affichée avec un \\n, comme le vrai grep.',
        'Sans fichier, lit l\'entrée standard.',
      ] },
      { t: 'note', kind: 'pdf', text: 'Le PDF ne montre pas le format avec plusieurs fichiers ni le code de retour quand rien ne correspond : les tests suivent le vrai grep pour le format, et ne vérifient pas le code de retour quand aucune ligne ne correspond.' },
    ],
    file: 'main.c',
    allowed: ['open', 'read', 'write', 'close', 'malloc', 'free'],
    starter: '#include <fcntl.h>\n#include <unistd.h>\n#include <stdlib.h>\n\nint main(int argc, char **argv)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'un fichier', args: ['http', 'services'], files: { services: 'ftp 21/tcp\nhttp 80/tcp\nhttps 443/tcp\nssh 22/tcp\n' }, checkExit: true, stderr: 'empty' },
      { name: 'aucune correspondance', args: ['zzz', 'services'], files: { services: 'a\nb\n' } },
      { name: 'dernière ligne sans \\n', args: ['b', 'f'], files: { f: 'a\nab\nb' }, checkExit: true, kind: 'limit' },
      { name: 'deux fichiers : préfixe', args: ['x', 'f1', 'f2'], files: { f1: 'x1\ny\n', f2: 'no\nx2\n' }, checkExit: true },
      { name: 'longues lignes (> buffer)', args: ['NEEDLE', 'big'], files: { big: ('a'.repeat(5000) + '\n').repeat(3) + 'b'.repeat(9000) + 'NEEDLE\n' + 'c\n' }, checkExit: true, kind: 'limit' },
      { name: 'fichier absent', args: ['a', 'doesnt_exist', 'f'], files: { f: 'abc\n' }, checkExit: true, stderr: 'any', kind: 'error' },
      { name: 'permission refusée', args: ['a', 'root'], files: { root: 'abc\n' }, denied: ['root'], checkExit: true, stderr: 'any', kind: 'error' },
      { name: 'entrée standard', args: ['lo'], stdin: 'hello\nworld\nlow\n', checkExit: true },
      { name: 'pas de motif', args: [], checkExit: true, stderr: 'any', kind: 'error' },
    ],
    hints: [
      'Deux problèmes séparés : 1) lire un fichier entier dans une chaîne ; 2) découper cette chaîne en lignes et afficher celles qui contiennent le motif.',
      'Pour lire tout le fichier sans connaître sa taille : lire par blocs et agrandir une chaîne allouée (nouvelle zone = ancienne + bloc, copier, free l\'ancienne). Pour une ligne : chercher le motif entre son début et son \\n (comme my_strstr, mais limité à la ligne).',
      '1) read_all(fd) → char * terminé par \\0 ; 2) pour chaque ligne [début, fin[ : si contains(ligne, motif) → afficher (préfixe si plusieurs fichiers), la ligne, \\n ; 3) erreurs d\'open → message « grep: nom: … » sur fd 2, ret = 84 ; 4) argc < 2 → erreur 84.',
      'static char *read_all(int fd);\nstatic int line_contains(char const *line, int len, char const *pat);\nstatic void grep_buffer(char const *buf, char const *pat, char const *prefix);\n\nint main(int argc, char **argv)\n{\n    /* ... */\n}',
    ],
    solution: String.raw`#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <errno.h>

static int len_of(char const *s)
{
    int n = 0;

    while (s[n] != '\0')
        n++;
    return n;
}

static void put_fd(int fd, char const *s)
{
    write(fd, s, len_of(s));
}

/* Reads the whole file into a newly allocated, '\0'-terminated string. */
static char *read_all(int fd)
{
    char buf[4096];
    char *all = malloc(1);
    char *bigger;
    int size = 0;
    int n = read(fd, buf, sizeof(buf));
    int i;

    if (all == NULL)
        return NULL;
    while (n > 0) {
        bigger = malloc(size + n + 1);
        if (bigger == NULL)
            return NULL;
        for (i = 0; i < size; i++)
            bigger[i] = all[i];
        for (i = 0; i < n; i++)
            bigger[size + i] = buf[i];
        free(all);
        all = bigger;
        size += n;
        n = read(fd, buf, sizeof(buf));
    }
    all[size] = '\0';
    return all;
}

/* Does line[0..len[ contain pat? */
static int line_contains(char const *line, int len, char const *pat)
{
    int plen = len_of(pat);
    int i;
    int j;

    for (i = 0; i + plen <= len; i++) {
        j = 0;
        while (j < plen && line[i + j] == pat[j])
            j++;
        if (j == plen)
            return 1;
    }
    return 0;
}

static void grep_buffer(char const *buf, char const *pat, char const *prefix)
{
    int start = 0;
    int end;

    while (buf[start] != '\0') {
        end = start;
        while (buf[end] != '\0' && buf[end] != '\n')
            end++;
        if (line_contains(buf + start, end - start, pat)) {
            if (prefix != NULL) {
                put_fd(1, prefix);
                write(1, ":", 1);
            }
            write(1, buf + start, end - start);
            write(1, "\n", 1);
        }
        start = buf[end] == '\n' ? end + 1 : end;
    }
}

static int grep_file(char const *path, char const *pat, int many)
{
    int fd = open(path, O_RDONLY);
    char *content;

    if (fd == -1) {
        put_fd(2, "grep: ");
        put_fd(2, path);
        put_fd(2, errno == EACCES ? ": Permission denied\n" : ": No such file or directory\n");
        return 84;
    }
    content = read_all(fd);
    close(fd);
    if (content == NULL)
        return 84;
    grep_buffer(content, pat, many ? path : NULL);
    free(content);
    return 0;
}

int main(int argc, char **argv)
{
    int ret = 0;
    int i = 2;
    char *content;

    if (argc < 2) {
        put_fd(2, "Usage: grep PATTERN [FILE]...\n");
        return 84;
    }
    if (argc == 2) {
        content = read_all(0);
        if (content == NULL)
            return 84;
        grep_buffer(content, argv[1], NULL);
        free(content);
        return 0;
    }
    while (i < argc) {
        if (grep_file(argv[i], argv[1], argc > 3) == 84)
            ret = 84;
        i++;
    }
    return ret;
}
`,
    solutionNotes: [
      { t: 'p', text: 'Le fichier est lu en entier avant d\'être découpé : une ligne peut ainsi être plus longue que le buffer de read.' },
      { t: 'p', text: 'Chaque fonction fait une seule chose : c\'est ce qui rend le programme testable (le PDF demande des tests unitaires pour chaque fonction).' },
    ],
    pitfalls: ['Découper les lignes à l\'intérieur du buffer de read : une ligne coupée en deux est ratée.', 'Afficher un \\n en trop ou en moins.', 'Oublier le préfixe avec plusieurs fichiers.'],
    prereqs: ['fd', 'strfuncs', 'malloc', 'errors84'],
  },
];
