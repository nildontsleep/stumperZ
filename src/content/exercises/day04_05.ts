import type { CodeExercise } from '../types';

const PUTCHAR_DECL = 'void my_putchar(char c);\n';

export const DAY04_05: CodeExercise[] = [
  {
    id: 'ex_swap',
    title: 'my_swap',
    skills: ['pointers'],
    level: 1,
    kind: 'function',
    source: { day: 'd04', section: 'Task 01 - my_swap', page: 2 },
    relation: 'reproduces',
    minutes: 8,
    statement: [{ t: 'p', text: 'Écris une fonction qui échange le contenu de deux entiers dont les **adresses** sont passées en paramètres.' }],
    file: 'my_swap.c',
    prototype: 'void my_swap(int *a, int *b);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'void my_swap(int *a, int *b)\n{\n}\n',
    tests: [
      { name: 'x=1, y=2', code: 'int x = 1;\nint y = 2;\nmy_swap(&x, &y);\ntst_int(x);\ntst_int(y);' },
      { name: 'négatifs', code: 'int x = -42;\nint y = 7;\nmy_swap(&x, &y);\ntst_int(x);\ntst_int(y);' },
      { name: 'valeurs égales', code: 'int x = 5;\nint y = 5;\nmy_swap(&x, &y);\ntst_int(x);\ntst_int(y);', kind: 'limit' },
      { name: 'cases d\'un tableau', code: 'int t[3] = {10, 20, 30};\nmy_swap(&t[0], &t[2]);\ntst_int(t[0]);\ntst_int(t[1]);\ntst_int(t[2]);', kind: 'limit' },
    ],
    hints: [
      'La fonction ne reçoit pas les nombres, mais l\'endroit où ils sont rangés. Elle doit modifier ce qui est rangé à ces endroits.',
      '*a désigne l\'entier situé à l\'adresse a. Pour échanger deux valeurs, il faut une troisième variable temporaire (comme pour échanger le contenu de deux verres).',
      '1) int tmp = *a ; 2) *a = *b ; 3) *b = tmp.',
      'void my_swap(int *a, int *b)\n{\n    int tmp = /* ? */;\n\n    *a = /* ? */;\n    *b = tmp;\n}',
    ],
    solution: String.raw`void my_swap(int *a, int *b)
{
    int tmp = *a;   /* sauvegarde la valeur pointée par a */

    *a = *b;        /* écrit à l'adresse a la valeur pointée par b */
    *b = tmp;
}
`,
    solutionNotes: [
      { t: 'p', text: 'Si on écrivait `void my_swap(int a, int b)`, la fonction recevrait des copies : l\'échange se ferait sur les copies, et les variables de l\'appelant ne bougeraient pas.' },
      { t: 'p', text: 'Écrire `a = b;` échangerait les adresses locales, pas les valeurs : rien ne change chez l\'appelant.' },
    ],
    pitfalls: ['Écrire a = b au lieu de *a = *b.', 'Oublier la variable temporaire : *a = *b; *b = *a; donne deux fois la même valeur.'],
    prereqs: ['pointers'],
  },
  {
    id: 'ex_putstr',
    title: 'my_putstr',
    skills: ['strings'],
    level: 1,
    kind: 'function',
    source: { day: 'd04', section: 'Task 02 - my_putstr', page: 2 },
    relation: 'reproduces',
    minutes: 8,
    statement: [
      { t: 'p', text: 'Écris une fonction qui affiche, un par un, les caractères d\'une chaîne. Le pointeur reçu contient l\'adresse du premier caractère.' },
      { t: 'note', kind: 'info', text: 'Tests : retour attendu 0 (convention de la piscine ; le PDF ne précise pas).' },
    ],
    file: 'my_putstr.c',
    prototype: 'int my_putstr(char const *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: PUTCHAR_DECL + '\nint my_putstr(char const *str)\n{\n    return 0;\n}\n',
    tests: [
      { name: '"Hello"', code: 'my_putstr("Hello");\ntst_nl();' },
      { name: 'avec espaces et \\n', code: 'my_putstr("a b\\nc");\ntst_nl();' },
      { name: 'chaîne vide', code: 'my_putstr("");\ntst_puts("|\\n");', kind: 'empty' },
      { name: 'un seul caractère', code: 'my_putstr("x");\ntst_nl();', kind: 'limit' },
      { name: 'retour', code: 'tst_int(my_putstr(""));' },
    ],
    hints: [
      'Afficher chaque caractère, du premier jusqu\'au caractère de fin \'\\0\' (non compris).',
      'str[i] est le caractère numéro i. La chaîne s\'arrête quand str[i] vaut \'\\0\'.',
      '1) i = 0 ; 2) tant que str[i] != \'\\0\' : my_putchar(str[i]) ; i++ ; 3) return 0.',
      'int i = 0;\n\nwhile (str[i] != \'\\0\') {\n    /* afficher str[i] */\n    i++;\n}\nreturn 0;',
    ],
    solution: String.raw`void my_putchar(char c);

int my_putstr(char const *str)
{
    int i = 0;

    while (str[i] != '\0') {    /* '\0' marque la fin de la chaîne */
        my_putchar(str[i]);
        i++;
    }
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Variante avec pointeur : `while (*str) { my_putchar(*str); str++; }`. `str[i]` et `*(str + i)` sont exactement la même chose.' }],
    pitfalls: ['Comparer à \'0\' (le chiffre) au lieu de \'\\0\'.', 'Oublier i++ : boucle infinie.'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_strlen',
    title: 'my_strlen',
    skills: ['strings'],
    level: 1,
    kind: 'function',
    source: { day: 'd04', section: 'Task 03 - my_strlen', page: 2 },
    relation: 'reproduces',
    minutes: 6,
    statement: [{ t: 'p', text: 'Écris une fonction qui compte et renvoie le nombre de caractères de la chaîne reçue (sans compter le `\\0`).' }],
    file: 'my_strlen.c',
    prototype: 'int my_strlen(char const *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_strlen(char const *str)\n{\n    return 0;\n}\n',
    tests: [
      { name: '"Hello"', code: 'tst_int(my_strlen("Hello"));' },
      { name: '"Epitech 2042"', code: 'tst_int(my_strlen("Epitech 2042"));' },
      { name: 'chaîne vide', code: 'tst_int(my_strlen(""));', kind: 'empty' },
      { name: 'un caractère', code: 'tst_int(my_strlen("a"));', kind: 'limit' },
      { name: '\\0 au milieu', code: 'tst_int(my_strlen("ab\\0cd"));', kind: 'limit' },
    ],
    hints: [
      'Compter les caractères jusqu\'au \'\\0\'.',
      'Un compteur i qui avance tant que str[i] n\'est pas \'\\0\'. À la fin, i est exactement la longueur.',
      '1) i = 0 ; 2) tant que str[i] != \'\\0\' : i++ ; 3) return i.',
      'int i = 0;\n\nwhile (str[i] != \'\\0\')\n    i++;\nreturn i;',
    ],
    solution: String.raw`int my_strlen(char const *str)
{
    int i = 0;

    while (str[i] != '\0')
        i++;
    return i;   /* l'indice du '\0' est égal au nombre de caractères */
}
`,
    solutionNotes: [{ t: 'p', text: 'Pour "Hello", les indices vont de 0 (H) à 4 (o), et str[5] vaut \'\\0\'. La boucle s\'arrête avec i = 5.' }],
    pitfalls: ['Renvoyer i + 1 (le \\0 ne compte pas).', 'Commencer à 1.'],
    prereqs: ['strings'],
  },
  {
    id: 'ex_count_char',
    title: 'Compter un caractère',
    skills: ['strings'],
    level: 1,
    kind: 'function',
    relation: 'inspired',
    minutes: 8,
    statement: [
      { t: 'p', text: 'Écris une fonction qui renvoie le nombre de fois où le caractère `c` apparaît dans `str`.' },
      { t: 'code', code: 'my_count_char("banana", \'a\')  -> 3\nmy_count_char("banana", \'z\')  -> 0', lang: 'text' },
    ],
    file: 'my_count_char.c',
    prototype: 'int my_count_char(char const *str, char c);',
    allowed: [],
    starter: 'int my_count_char(char const *str, char c)\n{\n    return 0;\n}\n',
    tests: [
      { name: 'banana / a', code: 'tst_int(my_count_char("banana", \'a\'));' },
      { name: 'banana / n', code: 'tst_int(my_count_char("banana", \'n\'));' },
      { name: 'absent', code: 'tst_int(my_count_char("banana", \'z\'));', kind: 'limit' },
      { name: 'chaîne vide', code: 'tst_int(my_count_char("", \'a\'));', kind: 'empty' },
      { name: 'majuscule ≠ minuscule', code: 'tst_int(my_count_char("Aaa", \'A\'));', kind: 'limit' },
      { name: 'espaces', code: 'tst_int(my_count_char(" a b c ", \' \'));' },
    ],
    hints: [
      'Parcourir la chaîne et compter les cases égales à c.',
      'Deux variables : i pour l\'indice, count pour le résultat.',
      '1) i = 0, count = 0 ; 2) tant que str[i] : si str[i] == c alors count++ ; i++ ; 3) return count.',
      'int i = 0;\nint count = 0;\n\nwhile (str[i] != \'\\0\') {\n    if (/* ? */)\n        count++;\n    i++;\n}\nreturn count;',
    ],
    solution: String.raw`int my_count_char(char const *str, char c)
{
    int i = 0;
    int count = 0;

    while (str[i] != '\0') {
        if (str[i] == c)    /* == compare ; = affecterait */
            count++;
        i++;
    }
    return count;
}
`,
    solutionNotes: [],
    pitfalls: ['Mettre i++ dans le if : boucle infinie dès qu\'un caractère ne correspond pas.'],
    prereqs: ['strings', 'cond'],
  },
  {
    id: 'ex_evil_str',
    title: 'my_evil_str',
    skills: ['strings', 'pointers'],
    level: 2,
    kind: 'function',
    source: { day: 'd04', section: 'Task 04 - my_evil_str', page: 3 },
    relation: 'reproduces',
    minutes: 15,
    statement: [
      { t: 'p', text: 'Inverse la chaîne **sur place** en échangeant le premier caractère avec le dernier, le deuxième avec l\'avant-dernier, etc. Renvoie un pointeur sur le premier caractère.' },
      { t: 'code', code: 'a => a\nab => ba\nabc => cba\nabcdef => fedcba', lang: 'text' },
      { t: 'note', kind: 'pdf', text: 'Le PDF prévient : modifier un littéral comme "abc" donne une Segmentation fault, car il est en lecture seule. Pour tester, utilise un tableau (char s[] = "abc";) ou une copie (strdup).' },
    ],
    file: 'my_evil_str.c',
    prototype: 'char *my_evil_str(char *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'char *my_evil_str(char *str)\n{\n    return str;\n}\n',
    tests: [
      { name: 'abcdef', code: 'char s[] = "abcdef";\ntst_str(my_evil_str(s));' },
      { name: 'abcde (impair)', code: 'char s[] = "abcde";\ntst_str(my_evil_str(s));' },
      { name: 'ab', code: 'char s[] = "ab";\ntst_str(my_evil_str(s));', kind: 'limit' },
      { name: 'a', code: 'char s[] = "a";\ntst_str(my_evil_str(s));', kind: 'limit' },
      { name: 'chaîne vide', code: 'char s[] = "";\ntst_str(my_evil_str(s));', kind: 'empty' },
      { name: 'renvoie str', code: 'char s[] = "xyz";\ntst_int(my_evil_str(s) == s);' },
    ],
    hints: [
      'On échange des paires : (début, fin), puis on rapproche les deux indices jusqu\'à ce qu\'ils se croisent.',
      'Il faut d\'abord la longueur (comme my_strlen). Le dernier caractère est à l\'indice len - 1, pas len (qui est le \\0).',
      '1) len = longueur ; 2) i = 0, j = len - 1 ; 3) tant que i < j : échanger str[i] et str[j], i++, j-- ; 4) return str.',
      'int i = 0;\nint j = 0;\nchar tmp;\n\nwhile (str[j] != \'\\0\')\n    j++;\nj--;          /* dernier caractère */\nwhile (i < j) {\n    /* échange str[i] et str[j] */\n    i++;\n    j--;\n}\nreturn str;',
    ],
    solution: String.raw`char *my_evil_str(char *str)
{
    int i = 0;
    int j = 0;
    char tmp;

    while (str[j] != '\0')
        j++;
    j--;                    /* j = indice du dernier vrai caractère (-1 si vide) */
    while (i < j) {         /* on s'arrête quand les indices se croisent */
        tmp = str[i];
        str[i] = str[j];
        str[j] = tmp;
        i++;
        j--;
    }
    return str;
}
`,
    solutionNotes: [
      { t: 'p', text: 'Si on continuait jusqu\'à i < len, chaque paire serait échangée deux fois : la chaîne reviendrait à l\'état initial.' },
      { t: 'p', text: 'Chaîne vide : j vaut -1, la condition 0 < -1 est fausse, on ne fait rien. Pas de cas spécial nécessaire.' },
    ],
    pitfalls: ['Échanger avec str[len] (le \\0) : la chaîne devient vide.', 'Boucler jusqu\'à len au lieu de la moitié : double échange.'],
    prereqs: ['strings', 'pointers'],
  },
  {
    id: 'ex_atoi_simple',
    title: 'Convertir des chiffres en nombre',
    skills: ['getnbr'],
    level: 1,
    kind: 'function',
    relation: 'inspired',
    minutes: 10,
    statement: [
      { t: 'p', text: 'Écris une fonction qui lit les chiffres au début de `str` et renvoie le nombre correspondant. Elle s\'arrête au premier caractère qui n\'est pas un chiffre. Pas de signe à gérer, et les nombres testés tiennent dans un int.' },
      { t: 'code', code: 'my_atoi_pos("42")     -> 42\nmy_atoi_pos("123abc") -> 123\nmy_atoi_pos("x9")     -> 0', lang: 'text' },
    ],
    file: 'my_atoi_pos.c',
    prototype: 'int my_atoi_pos(char const *str);',
    allowed: [],
    starter: 'int my_atoi_pos(char const *str)\n{\n    return 0;\n}\n',
    tests: [
      { name: '"42"', code: 'tst_int(my_atoi_pos("42"));' },
      { name: '"123abc"', code: 'tst_int(my_atoi_pos("123abc"));' },
      { name: '"7"', code: 'tst_int(my_atoi_pos("7"));', kind: 'limit' },
      { name: '"0042"', code: 'tst_int(my_atoi_pos("0042"));', kind: 'limit' },
      { name: '"x9"', code: 'tst_int(my_atoi_pos("x9"));', kind: 'limit' },
      { name: 'vide', code: 'tst_int(my_atoi_pos(""));', kind: 'empty' },
    ],
    hints: [
      'Lire les chiffres de gauche à droite en construisant le nombre petit à petit.',
      'À chaque chiffre, le nombre déjà lu est décalé d\'un rang : result = result * 10 + chiffre. Le chiffre vaut str[i] - \'0\'.',
      '1) result = 0, i = 0 ; 2) tant que str[i] est entre \'0\' et \'9\' : result = result * 10 + (str[i] - \'0\') ; i++ ; 3) return result.',
      'int result = 0;\nint i = 0;\n\nwhile (str[i] >= \'0\' && str[i] <= \'9\') {\n    result = /* ? */;\n    i++;\n}\nreturn result;',
    ],
    solution: String.raw`int my_atoi_pos(char const *str)
{
    int result = 0;
    int i = 0;

    while (str[i] >= '0' && str[i] <= '9') {
        result = result * 10 + (str[i] - '0');  /* "42" : 0 -> 4 -> 42 */
        i++;
    }
    return result;
}
`,
    solutionNotes: [{ t: 'trace', caption: 'Pour "123"', columns: ['i', 'str[i]', 'result'], rows: [['0', "'1'", '0 × 10 + 1 = 1'], ['1', "'2'", '1 × 10 + 2 = 12'], ['2', "'3'", '12 × 10 + 3 = 123'], ['3', "'\\0'", 'arrêt']] }],
    pitfalls: ['Oublier - \'0\' : on ajoute 49 au lieu de 1.', 'Ne pas s\'arrêter au premier non-chiffre.'],
    prereqs: ['strings', 'chars'],
  },
  {
    id: 'ex_getnbr',
    title: 'my_getnbr',
    skills: ['getnbr'],
    level: 3,
    kind: 'function',
    source: { day: 'd04', section: 'Task 05 - my_getnbr', page: 3 },
    relation: 'reproduces',
    minutes: 30,
    statement: [
      { t: 'p', text: 'Écris une fonction qui renvoie le nombre écrit au début d\'une chaîne.' },
      { t: 'code', code: '"+---+--++---+---+---+-42"     => -42\n"42a43"                        => 42\n"11000000000000000000000042"   => 0  (ne tient pas dans un int)\n"-1000000000000000000000042"   => 0', lang: 'text', caption: 'Exemples du PDF' },
      { t: 'note', kind: 'info', text: 'Les tests ajoutent quelques cas déduits de ces exemples : chaîne vide ou sans chiffre → 0, INT_MAX et INT_MIN doivent passer. Le PDF ne dit pas comment traiter les espaces au début : les tests n\'en contiennent pas.' },
    ],
    file: 'my_getnbr.c',
    prototype: 'int my_getnbr(char const *str);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_getnbr(char const *str)\n{\n    return 0;\n}\n',
    tests: [
      { name: '"42"', code: 'tst_int(my_getnbr("42"));' },
      { name: '"-42"', code: 'tst_int(my_getnbr("-42"));' },
      { name: 'signes multiples', code: 'tst_int(my_getnbr("+---+--++---+---+---+-42"));' },
      { name: '"--7"', code: 'tst_int(my_getnbr("--7"));' },
      { name: '"42a43"', code: 'tst_int(my_getnbr("42a43"));' },
      { name: 'chaîne vide', code: 'tst_int(my_getnbr(""));', kind: 'empty' },
      { name: '"abc"', code: 'tst_int(my_getnbr("abc"));', kind: 'limit' },
      { name: '"0"', code: 'tst_int(my_getnbr("0"));', kind: 'limit' },
      { name: 'INT_MAX', code: 'tst_int(my_getnbr("2147483647"));', kind: 'limit' },
      { name: 'INT_MIN', code: 'tst_int(my_getnbr("-2147483648"));', kind: 'limit' },
      { name: 'INT_MAX + 1', code: 'tst_int(my_getnbr("2147483648"));', kind: 'error' },
      { name: 'très grand', code: 'tst_int(my_getnbr("11000000000000000000000042"));', kind: 'error' },
      { name: 'très petit', code: 'tst_int(my_getnbr("-1000000000000000000000042"));', kind: 'error' },
    ],
    hints: [
      'Deux phases : d\'abord lire les signes (+ et -) et compter les -, puis lire les chiffres un par un jusqu\'au premier non-chiffre.',
      'Le signe final est négatif si le nombre de \'-\' est impair. Pour les chiffres : result = result * 10 + (c - \'0\'). Pour détecter un dépassement, calcule dans un long et compare à 2147483647 (ou 2147483648 si négatif) à chaque chiffre.',
      '1) i = 0, neg = 0 ; 2) tant que str[i] est \'+\' ou \'-\' : si \'-\' alors neg = !neg ; i++ ; 3) long r = 0 ; tant que str[i] est un chiffre : r = r * 10 + (str[i] - \'0\') ; si r dépasse la limite → return 0 ; i++ ; 4) return neg ? -r : r.',
      'int i = 0;\nint neg = 0;\nlong r = 0;\n\nwhile (str[i] == \'+\' || str[i] == \'-\') {\n    if (str[i] == \'-\')\n        neg = !neg;\n    i++;\n}\nwhile (str[i] >= \'0\' && str[i] <= \'9\') {\n    r = r * 10 + (str[i] - \'0\');\n    if (/* dépassement ? */)\n        return 0;\n    i++;\n}\nreturn /* ? */;',
    ],
    solution: String.raw`int my_getnbr(char const *str)
{
    int i = 0;
    int neg = 0;
    long r = 0;     /* long (64 bits sur Linux) : peut dépasser un int sans déborder */

    while (str[i] == '+' || str[i] == '-') {
        if (str[i] == '-')
            neg = !neg;         /* chaque '-' inverse le signe */
        i++;
    }
    while (str[i] >= '0' && str[i] <= '9') {
        r = r * 10 + (str[i] - '0');    /* '7' - '0' vaut 7 */
        if ((!neg && r > 2147483647) || (neg && r > 2147483648))
            return 0;                   /* ne tient pas dans un int */
        i++;
    }
    return neg ? -r : r;
}
`,
    solutionNotes: [
      { t: 'p', text: 'On teste le dépassement à **chaque** chiffre : avec "11000000000000000000000042", même un long finirait par déborder si on attendait la fin.' },
      { t: 'p', text: 'La limite est asymétrique : -2147483648 est un int valide, mais pas +2147483648.' },
      { t: 'note', kind: 'warn', text: 'Dans ce site, le compilateur tourne en WebAssembly où un long fait normalement 32 bits ; ton code est adapté automatiquement pour que long fasse 64 bits comme sur les machines de la piscine.' },
    ],
    pitfalls: ['Oublier que "--7" vaut 7.', 'Vérifier le dépassement seulement à la fin.', 'Calculer dans un int : le débordement est un comportement indéfini.', 'Ne pas s\'arrêter au premier caractère non chiffre.'],
    prereqs: ['strings', 'cond', 'loops'],
  },
  {
    id: 'ex_sort_int_array',
    title: 'my_sort_int_array',
    skills: ['arrays'],
    level: 2,
    kind: 'function',
    source: { day: 'd04', section: 'Task 06 - my_sort_int_array', page: 4 },
    relation: 'reproduces',
    minutes: 20,
    statement: [{ t: 'p', text: 'Trie un tableau d\'entiers par ordre croissant. Tu reçois un pointeur sur le premier élément et la taille.' }],
    file: 'my_sort_int_array.c',
    prototype: 'void my_sort_int_array(int *array, int size);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    support: String.raw`static void tst_tab(int *t, int n)
{
    int i = 0;

    while (i < n) {
        tst_int(t[i]);
        i++;
    }
}`,
    starter: 'void my_sort_int_array(int *array, int size)\n{\n}\n',
    tests: [
      { name: '{5, 2, 9, 1, 3}', code: 'int t[] = {5, 2, 9, 1, 3};\nmy_sort_int_array(t, 5);\ntst_tab(t, 5);' },
      { name: 'déjà trié', code: 'int t[] = {1, 2, 3, 4};\nmy_sort_int_array(t, 4);\ntst_tab(t, 4);', kind: 'limit' },
      { name: 'ordre inverse', code: 'int t[] = {9, 7, 5, 3, 1, 0};\nmy_sort_int_array(t, 6);\ntst_tab(t, 6);' },
      { name: 'doublons et négatifs', code: 'int t[] = {3, -1, 3, 0, -8, 3};\nmy_sort_int_array(t, 6);\ntst_tab(t, 6);', kind: 'limit' },
      { name: 'un élément', code: 'int t[] = {42};\nmy_sort_int_array(t, 1);\ntst_tab(t, 1);', kind: 'limit' },
      { name: 'taille 0', code: 'int t[] = {2, 1};\nmy_sort_int_array(t, 0);\ntst_tab(t, 2);', kind: 'empty' },
      { name: 'ne touche pas après size', code: 'int t[] = {3, 2, 1, -5};\nmy_sort_int_array(t, 3);\ntst_tab(t, 4);', kind: 'limit' },
    ],
    hints: [
      'Ranger les valeurs de la plus petite à la plus grande, en ne touchant qu\'aux cases 0 à size - 1.',
      'Tri à bulles : on parcourt le tableau, et chaque fois que deux voisins sont dans le mauvais ordre, on les échange. On recommence tant qu\'il y a eu un échange.',
      '1) sorted = 0 ; 2) tant que !sorted : sorted = 1 ; pour i de 0 à size - 2 : si array[i] > array[i + 1] → échanger, sorted = 0.',
      'int i;\nint tmp;\nint sorted = 0;\n\nwhile (!sorted) {\n    sorted = 1;\n    i = 0;\n    while (i < size - 1) {\n        if (array[i] > array[i + 1]) {\n            /* échanger */\n            sorted = 0;\n        }\n        i++;\n    }\n}',
    ],
    solution: String.raw`void my_sort_int_array(int *array, int size)
{
    int i;
    int tmp;
    int sorted = 0;

    while (!sorted) {
        sorted = 1;                         /* on suppose trié... */
        i = 0;
        while (i < size - 1) {              /* i + 1 doit rester < size */
            if (array[i] > array[i + 1]) {
                tmp = array[i];
                array[i] = array[i + 1];
                array[i + 1] = tmp;
                sorted = 0;                 /* ...sauf si on a dû échanger */
            }
            i++;
        }
    }
}
`,
    solutionNotes: [{ t: 'p', text: 'La condition `i < size - 1` évite de lire array[size], qui est en dehors du tableau (comportement indéfini).' }],
    pitfalls: ['Boucler jusqu\'à i < size et lire array[size].', 'Un seul passage ne suffit pas à trier.'],
    prereqs: ['arrays', 'loops'],
  },
  {
    id: 'ex_array_max',
    title: 'Plus grand élément d\'un tableau',
    skills: ['arrays'],
    level: 1,
    kind: 'function',
    relation: 'inspired',
    minutes: 8,
    statement: [{ t: 'p', text: 'Renvoie la plus grande valeur du tableau `tab` de taille `size`. Si `size` ≤ 0, renvoie 0.' }],
    file: 'my_array_max.c',
    prototype: 'int my_array_max(int const *tab, int size);',
    allowed: [],
    starter: 'int my_array_max(int const *tab, int size)\n{\n    return 0;\n}\n',
    tests: [
      { name: '{3, 9, 2}', code: 'int t[] = {3, 9, 2};\ntst_int(my_array_max(t, 3));' },
      { name: 'max à la fin', code: 'int t[] = {1, 2, 3, 4, 50};\ntst_int(my_array_max(t, 5));', kind: 'limit' },
      { name: 'tous négatifs', code: 'int t[] = {-5, -2, -9};\ntst_int(my_array_max(t, 3));', kind: 'limit' },
      { name: 'un élément', code: 'int t[] = {-7};\ntst_int(my_array_max(t, 1));', kind: 'limit' },
      { name: 'taille 0', code: 'int t[] = {8};\ntst_int(my_array_max(t, 0));', kind: 'empty' },
    ],
    hints: [
      'Parcourir toutes les cases en retenant la plus grande valeur vue.',
      'Initialise max avec tab[0] (pas 0 : tous les nombres peuvent être négatifs). Il faut donc d\'abord traiter size ≤ 0.',
      '1) si size <= 0 return 0 ; 2) max = tab[0] ; 3) pour i de 1 à size - 1 : si tab[i] > max alors max = tab[i] ; 4) return max.',
      'int max;\nint i = 1;\n\nif (size <= 0)\n    return 0;\nmax = tab[0];\nwhile (i < size) {\n    /* ? */\n    i++;\n}\nreturn max;',
    ],
    solution: String.raw`int my_array_max(int const *tab, int size)
{
    int max;
    int i = 1;

    if (size <= 0)
        return 0;           /* sinon tab[0] n'existe pas */
    max = tab[0];
    while (i < size) {
        if (tab[i] > max)
            max = tab[i];
        i++;
    }
    return max;
}
`,
    solutionNotes: [],
    pitfalls: ['max = 0 au départ : faux si tout est négatif.', 'Lire tab[0] quand size vaut 0.'],
    prereqs: ['arrays'],
  },
  // ---------------------------------------------------------------- Day 05
  {
    id: 'ex_factorial_it',
    title: 'my_compute_factorial_it',
    skills: ['loops'],
    level: 2,
    kind: 'function',
    source: { day: 'd05', section: 'Task 01 - my_compute_factorial_it', page: 2 },
    relation: 'reproduces',
    minutes: 12,
    statement: [
      { t: 'p', text: 'Écris une fonction **itérative** (avec une boucle) qui renvoie la factorielle de `nb`. En cas d\'erreur, elle renvoie 0.' },
      { t: 'list', items: ['0! = 1', 'si n < 0, n! = 0', 'débordement (le résultat ne tient pas dans un int) = erreur → 0 (règle du Day 05)'] },
    ],
    file: 'my_compute_factorial_it.c',
    prototype: 'int my_compute_factorial_it(int nb);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_compute_factorial_it(int nb)\n{\n    return 0;\n}\n',
    tests: [
      { name: '5', code: 'tst_int(my_compute_factorial_it(5));' },
      { name: '1', code: 'tst_int(my_compute_factorial_it(1));' },
      { name: '0', code: 'tst_int(my_compute_factorial_it(0));', kind: 'limit' },
      { name: '-3', code: 'tst_int(my_compute_factorial_it(-3));', kind: 'error' },
      { name: '12 (dernier qui tient)', code: 'tst_int(my_compute_factorial_it(12));', kind: 'limit' },
      { name: '13 (déborde)', code: 'tst_int(my_compute_factorial_it(13));', kind: 'error' },
      { name: '40', code: 'tst_int(my_compute_factorial_it(40));', kind: 'error' },
    ],
    hints: [
      'n! = 1 × 2 × … × n. Trois cas particuliers : n < 0 → 0 ; 0 → 1 ; trop grand → 0.',
      '12! = 479001600 tient dans un int, 13! = 6227020800 non. Tu peux soit tester nb > 12, soit multiplier dans un long et comparer à 2147483647.',
      '1) si nb < 0 ou nb > 12 → return 0 ; 2) result = 1 ; 3) pour i de 2 à nb : result *= i ; 4) return result.',
      'int result = 1;\nint i = 2;\n\nif (nb < 0 || nb > 12)\n    return 0;\nwhile (i <= nb) {\n    /* ? */\n    i++;\n}\nreturn result;',
    ],
    solution: String.raw`int my_compute_factorial_it(int nb)
{
    int result = 1;
    int i = 2;

    if (nb < 0 || nb > 12)      /* 13! dépasse 2147483647 */
        return 0;
    while (i <= nb) {           /* nb = 0 ou 1 : on n'entre pas, résultat 1 */
        result *= i;
        i++;
    }
    return result;
}
`,
    solutionNotes: [{ t: 'p', text: 'Laisser un int déborder est un comportement indéfini en C : on ne peut pas « détecter après coup » que le résultat est devenu négatif. Il faut l\'empêcher avant.' }],
    pitfalls: ['Renvoyer 0 pour 0! (c\'est 1).', 'Ne pas gérer le débordement.'],
    prereqs: ['loops', 'cond'],
  },
  {
    id: 'ex_factorial_rec',
    title: 'my_compute_factorial_rec',
    skills: ['recursion'],
    level: 2,
    kind: 'function',
    source: { day: 'd05', section: 'Task 02 - my_compute_factorial_rec', page: 2 },
    relation: 'reproduces',
    minutes: 12,
    statement: [{ t: 'p', text: 'Même fonction, mais **récursive** : elle s\'appelle elle-même. Pas de boucle. Erreur (n < 0 ou débordement) → 0, et 0! = 1.' }],
    file: 'my_compute_factorial_rec.c',
    prototype: 'int my_compute_factorial_rec(int nb);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_compute_factorial_rec(int nb)\n{\n    return 0;\n}\n',
    tests: [
      { name: '5', code: 'tst_int(my_compute_factorial_rec(5));' },
      { name: '10', code: 'tst_int(my_compute_factorial_rec(10));' },
      { name: '0', code: 'tst_int(my_compute_factorial_rec(0));', kind: 'limit' },
      { name: '1', code: 'tst_int(my_compute_factorial_rec(1));', kind: 'limit' },
      { name: '-1', code: 'tst_int(my_compute_factorial_rec(-1));', kind: 'error' },
      { name: '13', code: 'tst_int(my_compute_factorial_rec(13));', kind: 'error' },
    ],
    hints: [
      'n! = n × (n - 1)!. La fonction peut donc s\'appeler pour (n - 1).',
      'Il faut un cas de base qui arrête les appels : 0! = 1. Et les erreurs (n < 0, n > 12) sont traitées avant.',
      '1) si nb < 0 ou nb > 12 → 0 ; 2) si nb == 0 → 1 ; 3) sinon → nb * my_compute_factorial_rec(nb - 1).',
      'if (nb < 0 || nb > 12)\n    return 0;\nif (nb == 0)\n    return 1;\nreturn nb * /* appel récursif */;',
    ],
    solution: String.raw`int my_compute_factorial_rec(int nb)
{
    if (nb < 0 || nb > 12)
        return 0;
    if (nb == 0)
        return 1;                                   /* cas de base */
    return nb * my_compute_factorial_rec(nb - 1);   /* le problème rétrécit */
}
`,
    solutionNotes: [{ t: 'trace', caption: 'Appels pour 3!', columns: ['appel', 'renvoie'], rows: [['f(3)', '3 * f(2) = 6'], ['f(2)', '2 * f(1) = 2'], ['f(1)', '1 * f(0) = 1'], ['f(0)', '1 (cas de base)']] }],
    pitfalls: ['Pas de cas de base : récursion infinie, plantage (stack overflow).', 'Appeler f(nb) au lieu de f(nb - 1).'],
    prereqs: ['recursion'],
  },
  {
    id: 'ex_power_it',
    title: 'my_compute_power_it',
    skills: ['loops'],
    level: 2,
    kind: 'function',
    source: { day: 'd05', section: 'Task 03 - my_compute_power_it', page: 2 },
    relation: 'reproduces',
    minutes: 12,
    statement: [
      { t: 'p', text: 'Renvoie `nb` à la puissance `p`, de façon itérative.' },
      { t: 'list', items: ['n^0 = 1', 'si p < 0, n^p = 0', 'débordement = erreur → 0'] },
    ],
    file: 'my_compute_power_it.c',
    prototype: 'int my_compute_power_it(int nb, int p);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_compute_power_it(int nb, int p)\n{\n    return 0;\n}\n',
    tests: [
      { name: '2^10', code: 'tst_int(my_compute_power_it(2, 10));' },
      { name: '3^4', code: 'tst_int(my_compute_power_it(3, 4));' },
      { name: '(-2)^3', code: 'tst_int(my_compute_power_it(-2, 3));' },
      { name: '5^0', code: 'tst_int(my_compute_power_it(5, 0));', kind: 'limit' },
      { name: '0^0', code: 'tst_int(my_compute_power_it(0, 0));', kind: 'limit' },
      { name: 'p < 0', code: 'tst_int(my_compute_power_it(2, -1));', kind: 'error' },
      { name: '2^31 (déborde)', code: 'tst_int(my_compute_power_it(2, 31));', kind: 'error' },
      { name: '(-2)^31 = INT_MIN', code: 'tst_int(my_compute_power_it(-2, 31));', kind: 'limit' },
    ],
    hints: [
      'nb^p = nb × nb × … (p fois). Cas particuliers : p < 0 → 0, p = 0 → 1.',
      'Calcule dans un long et vérifie après chaque multiplication que le résultat reste entre -2147483648 et 2147483647.',
      '1) si p < 0 → 0 ; 2) long r = 1 ; 3) répéter p fois : r *= nb ; si hors limites → 0 ; 4) return r.',
      'long r = 1;\nint i = 0;\n\nif (p < 0)\n    return 0;\nwhile (i < p) {\n    r = r * nb;\n    if (r > 2147483647 || r < -2147483648)\n        return 0;\n    i++;\n}\nreturn r;',
    ],
    solution: String.raw`int my_compute_power_it(int nb, int p)
{
    long r = 1;
    int i = 0;

    if (p < 0)
        return 0;
    while (i < p) {
        r = r * nb;
        if (r > 2147483647 || r < -2147483648)  /* sort des limites d'un int */
            return 0;
        i++;
    }
    return r;
}
`,
    solutionNotes: [{ t: 'p', text: 'Comme le résultat est vérifié à chaque tour, le long ne peut jamais déborder : il reste toujours dans les limites d\'un int multiplié par un int.' }],
    pitfalls: ['Oublier que n^0 = 1 même si n = 0.', 'Tester le débordement seulement à la fin.'],
    prereqs: ['loops', 'cond'],
  },
  {
    id: 'ex_power_rec',
    title: 'my_compute_power_rec',
    skills: ['recursion'],
    level: 2,
    kind: 'function',
    source: { day: 'd05', section: 'Task 04 - my_compute_power_rec', page: 3 },
    relation: 'reproduces',
    minutes: 12,
    statement: [{ t: 'p', text: 'Même chose en **récursif** : n^0 = 1, p < 0 → 0, débordement → 0.' }],
    file: 'my_compute_power_rec.c',
    prototype: 'int my_compute_power_rec(int nb, int p);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_compute_power_rec(int nb, int p)\n{\n    return 0;\n}\n',
    tests: [
      { name: '2^10', code: 'tst_int(my_compute_power_rec(2, 10));' },
      { name: '7^2', code: 'tst_int(my_compute_power_rec(7, 2));' },
      { name: '9^0', code: 'tst_int(my_compute_power_rec(9, 0));', kind: 'limit' },
      { name: 'p < 0', code: 'tst_int(my_compute_power_rec(3, -2));', kind: 'error' },
      { name: '10^10 (déborde)', code: 'tst_int(my_compute_power_rec(10, 10));', kind: 'error' },
    ],
    hints: [
      'nb^p = nb × nb^(p-1).',
      'Cas de base : p == 0 → 1. Pour le débordement, calcule le résultat de l\'appel récursif, puis vérifie la multiplication dans un long.',
      '1) p < 0 → 0 ; 2) p == 0 → 1 ; 3) sub = power(nb, p - 1) ; si sub == 0 et nb != 0 → c\'était une erreur → 0 ; 4) long r = (long)nb * sub ; hors limites → 0 ; sinon r.',
      'long r;\nint sub;\n\nif (p < 0)\n    return 0;\nif (p == 0)\n    return 1;\nsub = my_compute_power_rec(nb, p - 1);\nr = (long)nb * sub;\n/* vérifier r */\nreturn r;',
    ],
    solution: String.raw`int my_compute_power_rec(int nb, int p)
{
    long r;
    int sub;

    if (p < 0)
        return 0;
    if (p == 0)
        return 1;                       /* cas de base */
    sub = my_compute_power_rec(nb, p - 1);
    if (sub == 0)
        return 0;                       /* erreur plus bas, ou nb == 0 : dans les deux cas 0 */
    r = (long)nb * sub;
    if (r > 2147483647 || r < -2147483648)
        return 0;
    return r;
}
`,
    solutionNotes: [{ t: 'p', text: 'Si un appel plus profond a renvoyé 0 pour cause de débordement, il faut propager 0, sinon on multiplierait 0 et on renverrait quand même 0 : c\'est cohérent ici.' }],
    pitfalls: ['Oublier le cas de base p == 0.'],
    prereqs: ['recursion'],
  },
  {
    id: 'ex_square_root',
    title: 'my_compute_square_root',
    skills: ['loops'],
    level: 2,
    kind: 'function',
    source: { day: 'd05', section: 'Task 05 - my_compute_square_root', page: 3 },
    relation: 'reproduces',
    minutes: 10,
    statement: [{ t: 'p', text: 'Renvoie la racine carrée de `nb` si c\'est un nombre entier, sinon 0. Doit répondre en moins de 2 secondes (règle du Day 05).' }],
    file: 'my_compute_square_root.c',
    prototype: 'int my_compute_square_root(int nb);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_compute_square_root(int nb)\n{\n    return 0;\n}\n',
    tests: [
      { name: '49', code: 'tst_int(my_compute_square_root(49));' },
      { name: '50', code: 'tst_int(my_compute_square_root(50));' },
      { name: '1', code: 'tst_int(my_compute_square_root(1));', kind: 'limit' },
      { name: '0', code: 'tst_int(my_compute_square_root(0));', kind: 'limit' },
      { name: '-4', code: 'tst_int(my_compute_square_root(-4));', kind: 'error' },
      { name: '2147395600 (46340²)', code: 'tst_int(my_compute_square_root(2147395600));', kind: 'limit' },
      { name: '2147483647', code: 'tst_int(my_compute_square_root(2147483647));', kind: 'limit' },
    ],
    hints: [
      'Chercher un entier i tel que i × i == nb.',
      'Essaye i = 0, 1, 2… tant que i × i < nb. Attention : i × i peut déborder pour les grands nb ; calcule-le dans un long.',
      '1) si nb < 0 → 0 ; 2) long i = 0 ; tant que i * i < nb : i++ ; 3) si i * i == nb → i, sinon 0.',
      'long i = 0;\n\nif (nb < 0)\n    return 0;\nwhile (i * i < nb)\n    i++;\nif (i * i == nb)\n    return i;\nreturn 0;',
    ],
    solution: String.raw`int my_compute_square_root(int nb)
{
    long i = 0;     /* long : i * i ne déborde pas près de 46341² */

    if (nb < 0)
        return 0;
    while (i * i < nb)
        i++;
    if (i * i == nb)
        return i;
    return 0;
}
`,
    solutionNotes: [{ t: 'p', text: 'Au plus 46341 tours : bien en dessous des 2 secondes.' }],
    pitfalls: ['i * i en int déborde pour 2147483647 : boucle infinie ou résultat faux.'],
    prereqs: ['loops'],
  },
  {
    id: 'ex_is_prime',
    title: 'my_is_prime',
    skills: ['loops', 'cond'],
    level: 2,
    kind: 'function',
    source: { day: 'd05', section: 'Task 06 - my_is_prime', page: 3 },
    relation: 'reproduces',
    minutes: 12,
    statement: [{ t: 'p', text: 'Renvoie 1 si `nb` est premier, 0 sinon. 0 et 1 ne sont pas premiers (négatifs non plus). Réponse en moins de 2 secondes.' }],
    file: 'my_is_prime.c',
    prototype: 'int my_is_prime(int nb);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_is_prime(int nb)\n{\n    return 0;\n}\n',
    tests: [
      { name: '7', code: 'tst_int(my_is_prime(7));' },
      { name: '9', code: 'tst_int(my_is_prime(9));' },
      { name: '2', code: 'tst_int(my_is_prime(2));', kind: 'limit' },
      { name: '1', code: 'tst_int(my_is_prime(1));', kind: 'limit' },
      { name: '0', code: 'tst_int(my_is_prime(0));', kind: 'limit' },
      { name: '-7', code: 'tst_int(my_is_prime(-7));', kind: 'limit' },
      { name: '2147483647 (premier)', code: 'tst_int(my_is_prime(2147483647));', kind: 'limit' },
      { name: '2147483646', code: 'tst_int(my_is_prime(2147483646));' },
    ],
    hints: [
      'Un nombre est premier s\'il est ≥ 2 et n\'a aucun diviseur entre 2 et lui-même - 1.',
      'Inutile d\'aller jusqu\'à nb : si nb a un diviseur, il en a un ≤ √nb. On teste donc d tant que d × d ≤ nb (avec d en long).',
      '1) nb < 2 → 0 ; 2) d = 2 ; tant que d * d <= nb : si nb % d == 0 → 0 ; d++ ; 3) return 1.',
      'long d = 2;\n\nif (nb < 2)\n    return 0;\nwhile (d * d <= nb) {\n    if (nb % d == 0)\n        return 0;\n    d++;\n}\nreturn 1;',
    ],
    solution: String.raw`int my_is_prime(int nb)
{
    long d = 2;

    if (nb < 2)
        return 0;               /* 0, 1 et les négatifs */
    while (d * d <= nb) {       /* inutile de dépasser la racine de nb */
        if (nb % d == 0)
            return 0;           /* un diviseur trouvé */
        d++;
    }
    return 1;
}
`,
    solutionNotes: [{ t: 'p', text: 'Tester tous les diviseurs jusqu\'à nb pour 2147483647 ferait 2 milliards de tours : beaucoup trop lent.' }],
    pitfalls: ['Tester jusqu\'à nb : trop lent.', 'Oublier 0, 1 et les négatifs.'],
    prereqs: ['loops', 'cond'],
  },
  {
    id: 'ex_find_prime_sup',
    title: 'my_find_prime_sup',
    skills: ['loops'],
    level: 2,
    kind: 'function',
    source: { day: 'd05', section: 'Task 07 - my_find_prime_sup', page: 4 },
    relation: 'reproduces',
    minutes: 10,
    statement: [{ t: 'p', text: 'Renvoie le plus petit nombre premier supérieur **ou égal** à `nb`. Écris ta propre fonction de test de primalité dans le fichier (en `static`).' }],
    file: 'my_find_prime_sup.c',
    prototype: 'int my_find_prime_sup(int nb);',
    allowed: ['my_putchar'],
    providesPutchar: true,
    starter: 'int my_find_prime_sup(int nb)\n{\n    return 0;\n}\n',
    tests: [
      { name: '8', code: 'tst_int(my_find_prime_sup(8));' },
      { name: '13 (déjà premier)', code: 'tst_int(my_find_prime_sup(13));', kind: 'limit' },
      { name: '0', code: 'tst_int(my_find_prime_sup(0));', kind: 'limit' },
      { name: '-20', code: 'tst_int(my_find_prime_sup(-20));', kind: 'limit' },
      { name: '1000', code: 'tst_int(my_find_prime_sup(1000));' },
    ],
    hints: [
      'Partir de nb et avancer jusqu\'à trouver un premier.',
      'Réutilise la logique de my_is_prime dans une fonction static. Pour nb < 2, la réponse est 2.',
      '1) si nb < 2 → 2 ; 2) tant que !is_prime(nb) : nb++ ; 3) return nb.',
      'static int is_prime(int nb)\n{\n    /* ... */\n}\n\nint my_find_prime_sup(int nb)\n{\n    if (nb < 2)\n        return 2;\n    while (!is_prime(nb))\n        nb++;\n    return nb;\n}',
    ],
    solution: String.raw`static int is_prime(int nb)
{
    long d = 2;

    if (nb < 2)
        return 0;
    while (d * d <= nb) {
        if (nb % d == 0)
            return 0;
        d++;
    }
    return 1;
}

int my_find_prime_sup(int nb)
{
    if (nb < 2)
        return 2;           /* le premier nombre premier */
    while (!is_prime(nb))   /* "supérieur ou égal" : on teste nb lui-même d'abord */
        nb++;
    return nb;
}
`,
    solutionNotes: [{ t: 'p', text: 'La fonction est `static` : elle n\'est visible que dans ce fichier, ce qui évite un conflit si une autre fonction my_is_prime existe ailleurs.' }],
    pitfalls: ['Commencer à nb + 1 : 13 donnerait 17.'],
    prereqs: ['loops', 'functions'],
  },
  {
    id: 'ex_sum_digits_rec',
    title: 'Somme des chiffres (récursif)',
    skills: ['recursion'],
    level: 2,
    kind: 'function',
    relation: 'inspired',
    minutes: 10,
    statement: [
      { t: 'p', text: 'Écris une fonction **récursive, sans boucle**, qui renvoie la somme des chiffres d\'un entier positif ou nul. Pour un nombre négatif, renvoie la somme des chiffres de sa valeur absolue.' },
      { t: 'code', code: 'my_sum_digits(1234)  -> 10\nmy_sum_digits(0)     -> 0\nmy_sum_digits(-45)   -> 9', lang: 'text' },
    ],
    file: 'my_sum_digits.c',
    prototype: 'int my_sum_digits(int nb);',
    allowed: [],
    starter: 'int my_sum_digits(int nb)\n{\n    return 0;\n}\n',
    tests: [
      { name: '1234', code: 'tst_int(my_sum_digits(1234));' },
      { name: '9', code: 'tst_int(my_sum_digits(9));', kind: 'limit' },
      { name: '0', code: 'tst_int(my_sum_digits(0));', kind: 'limit' },
      { name: '-45', code: 'tst_int(my_sum_digits(-45));' },
      { name: '-2147483648', code: 'tst_int(my_sum_digits(-2147483647 - 1));', kind: 'limit' },
    ],
    hints: [
      'somme(1234) = 4 + somme(123).',
      'Le dernier chiffre est nb % 10, le reste est nb / 10. Cas de base : nb == 0 → 0. Pour un négatif, nb % 10 est négatif en C (-45 % 10 vaut -5) : prends l\'opposé du chiffre, pas du nombre (pour éviter le débordement de INT_MIN).',
      '1) si nb == 0 → 0 ; 2) d = nb % 10, si d < 0 → d = -d ; 3) return d + my_sum_digits(nb / 10).',
      'int d;\n\nif (nb == 0)\n    return 0;\nd = nb % 10;\nif (d < 0)\n    d = -d;\nreturn d + my_sum_digits(nb / 10);',
    ],
    solution: String.raw`int my_sum_digits(int nb)
{
    int d;

    if (nb == 0)
        return 0;               /* cas de base */
    d = nb % 10;                /* en C, -45 % 10 vaut -5 */
    if (d < 0)
        d = -d;                 /* on inverse le chiffre, jamais INT_MIN lui-même */
    return d + my_sum_digits(nb / 10);
}
`,
    solutionNotes: [],
    pitfalls: ['Écrire nb = -nb pour INT_MIN : débordement.', 'Oublier le cas de base.'],
    prereqs: ['recursion'],
  },
];
