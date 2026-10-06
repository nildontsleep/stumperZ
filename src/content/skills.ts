import type { Skill, SkillId } from './types';

// Dependency graph. Order of the array = recommended learning order.
export const SKILLS: Skill[] = [
  { id: 'compile', title: 'Compiler et lire les erreurs', short: 'gcc, warnings, erreurs fréquentes', prereqs: [], days: ['d03', 'd07', 'd08'], stumper: 3 },
  { id: 'structure', title: 'Structure d\'un programme C', short: 'main, fonctions, prototypes, accolades', prereqs: [], days: ['d03'], stumper: 3 },
  { id: 'vars', title: 'Variables, types et opérateurs', short: 'int, char, = vs ==, / et %', prereqs: ['structure'], days: ['d03'], stumper: 3 },
  { id: 'chars', title: 'Caractères, ASCII et my_putchar', short: '\'a\' est un nombre, \'0\' + 5', prereqs: ['vars'], days: ['d03', 'd06'], stumper: 3 },
  { id: 'cond', title: 'Conditions', short: 'if / else if / else, && ||', prereqs: ['vars'], days: ['d03'], stumper: 3 },
  { id: 'loops', title: 'Boucles', short: 'while, for, boucles imbriquées', prereqs: ['cond'], days: ['d03', 'd05'], stumper: 3 },
  { id: 'functions', title: 'Fonctions et valeur de retour', short: 'paramètres, return, appel', prereqs: ['vars'], days: ['d03'], stumper: 3 },
  { id: 'putnbr', title: 'Afficher un nombre (my_put_nbr)', short: 'chiffre par chiffre, négatifs, INT_MIN', prereqs: ['loops', 'chars', 'functions'], days: ['d03'], stumper: 3 },
  { id: 'pointers', title: 'Pointeurs et adresses', short: '&x, *p, passer une adresse', prereqs: ['functions'], days: ['d04'], stumper: 3 },
  { id: 'strings', title: 'Chaînes et caractère nul', short: 'char *, \'\\0\', parcours', prereqs: ['loops', 'chars', 'pointers'], days: ['d04'], stumper: 3 },
  { id: 'arrays', title: 'Tableaux', short: 'int tab[5], indices, tri', prereqs: ['loops', 'pointers'], days: ['d04', 'd05'], stumper: 2 },
  { id: 'getnbr', title: 'Lire un nombre dans une chaîne', short: 'my_getnbr : signes, chiffres, débordement', prereqs: ['strings', 'cond'], days: ['d04', 'd10'], stumper: 3 },
  { id: 'strfuncs', title: 'Fonctions de chaînes', short: 'strcmp, strcpy, revstr, capitalize…', prereqs: ['strings'], days: ['d06', 'd07'], stumper: 3 },
  { id: 'argv', title: 'Arguments du programme', short: 'argc, argv, argv[0]', prereqs: ['strings', 'arrays'], days: ['d07', 'd08', 'd10'], stumper: 3 },
  { id: 'errors84', title: 'Erreurs, stderr et code 84', short: 'write(2, …), return 84', prereqs: ['argv'], days: ['d10', 'd11', 'd12'], stumper: 3 },
  { id: 'method', title: 'Méthode d\'examen', short: 'lire, découper, tester, cas limites', prereqs: ['functions'], days: [], stumper: 3 },
  { id: 'recursion', title: 'Récursivité', short: 'cas de base, appel récursif', prereqs: ['functions', 'cond'], days: ['d05'], stumper: 2 },
  { id: 'malloc', title: 'Allocation dynamique', short: 'malloc, free, taille + 1', prereqs: ['strings', 'pointers'], days: ['d08'], stumper: 2 },
  { id: 'wordarray', title: 'Tableaux de mots (char **)', short: 'str_to_word_array, NULL final', prereqs: ['malloc', 'arrays'], days: ['d08', 'd10'], stumper: 2 },
  { id: 'bases', title: 'Bases numériques', short: 'binaire, hexa, putnbr_base', prereqs: ['putnbr', 'strings'], days: ['d06', 'd08'], stumper: 2 },
  { id: 'tests', title: 'Tester son code', short: 'main de test, Criterion, cas limites', prereqs: ['functions'], days: ['d03', 'd06', 'd12'], stumper: 1 },
  { id: 'libmy', title: 'Bibliothèque et headers', short: 'libmy.a, ar, -L -l, my.h', prereqs: ['compile', 'functions'], days: ['d07', 'd09'], stumper: 1 },
  { id: 'structs', title: 'Structures, macros, bits', short: 'struct, typedef, ->, #define, <<', prereqs: ['pointers'], days: ['d09'], stumper: 1 },
  { id: 'makefile', title: 'Makefile', short: 'règles all clean fclean re, relink', prereqs: ['compile', 'libmy'], days: ['d10', 'd12'], stumper: 1 },
  { id: 'funcptr', title: 'Pointeurs sur fonction', short: 'int (*f)(int, int)', prereqs: ['pointers', 'functions'], days: ['d10', 'd11'], stumper: 1 },
  { id: 'lists', title: 'Listes chaînées', short: 'nœud, next, NULL, **begin', prereqs: ['structs', 'malloc'], days: ['d11'], stumper: 1 },
  { id: 'fd', title: 'Fichiers : open, read, close', short: 'descripteurs, buffer, errno', prereqs: ['errors84', 'strings'], days: ['d12'], stumper: 2 },
  { id: 'shell', title: 'Shell Unix', short: 'ls, chmod, ln, find, pipes, scripts', prereqs: [], days: ['d01', 'd02'], stumper: 0 },
  { id: 'git', title: 'Git et rendu', short: 'clone, add, commit, push', prereqs: [], days: ['d01'], stumper: 0 },
];

export const skill = (id: SkillId) => SKILLS.find((s) => s.id === id)!;

/** All prerequisites, transitively, in learning order. */
export function prereqClosure(id: SkillId): SkillId[] {
  const seen = new Set<SkillId>();
  const visit = (s: SkillId) => {
    for (const p of skill(s).prereqs) {
      if (!seen.has(p)) {
        seen.add(p);
        visit(p);
      }
    }
  };
  visit(id);
  return SKILLS.map((s) => s.id).filter((s) => seen.has(s));
}
