// How results turn into mastery and readiness. Pure functions, unit-tested.
// The rules are explained to the student on the Statistics page (METHOD_TEXT).
import type { SkillId } from '../content/types';
import { SKILLS, skill as skillOf } from '../content/skills';
import { EXERCISES } from '../content/exercises';
import { EXAMS } from '../content/exams';
import type { Attempt, ExamAttempt, State } from './state';

const DAY = 86400000;
/** Evidence older than this loses half its weight. */
const HALF_LIFE_DAYS = 21;
/** Prior: as if the student had already failed K weight-units. One success never gives 100 %. */
const PRIOR = 3;

export type SkillStatus = 'acquis' | 'en cours' | 'fragile' | 'non évalué';

export interface SkillScore {
  skill: SkillId;
  mastery: number;
  evidence: number;
  provisional: boolean;
  status: SkillStatus;
  autonomousCode: number;
  lastTs?: number;
  fails: number;
}

/** Weight of one attempt as evidence (before time decay). */
export function attemptWeight(a: Attempt, solutionSeenBefore: boolean): number {
  if (a.kind === 'quiz') {
    if (a.context === 'diagnostic') return 1;
    return a.firstTry ? 1 : 0.3;
  }
  if (a.kind === 'exam') return a.autonomous ? 5 : 2;
  // code
  const lvl = a.level === 3 ? 1.2 : a.level === 1 ? 0.8 : 1;
  if (!a.verified) return 0.5 * lvl;
  if (a.solutionViewed) return 0.3;
  if (!a.autonomous) return Math.max(0.6, 1.5 - 0.25 * a.hintsUsed) * lvl;
  if (solutionSeenBefore) return 1.2 * lvl;
  return (a.firstTry ? 4 : 3) * lvl;
}

/** Score value of an attempt (0..1). Guided successes are capped: they teach, they don't prove. */
export function attemptValue(a: Attempt): number {
  if (a.kind === 'code' && a.solutionViewed) return Math.min(a.score, 0.5);
  return a.score;
}

export function skillScores(attempts: Attempt[], now = Date.now()): Record<SkillId, SkillScore> {
  const out = {} as Record<SkillId, SkillScore>;
  for (const s of SKILLS) {
    out[s.id] = { skill: s.id, mastery: 0, evidence: 0, provisional: true, status: 'non évalué', autonomousCode: 0, fails: 0 };
  }
  const sum: Record<string, number> = {};
  const solutionSeen = new Set<string>();
  const sorted = [...attempts].sort((a, b) => a.ts - b.ts);
  const autoItems: Record<string, Set<string>> = {};
  for (const a of sorted) {
    const decay = Math.pow(0.5, Math.max(0, now - a.ts) / DAY / HALF_LIFE_DAYS);
    const w = attemptWeight(a, solutionSeen.has(a.itemId)) * decay;
    const v = attemptValue(a);
    for (const s of a.skills) {
      const sc = out[s];
      if (!sc) continue;
      sc.evidence += w;
      sum[s] = (sum[s] ?? 0) + w * v;
      sc.lastTs = Math.max(sc.lastTs ?? 0, a.ts);
      if (!a.correct) sc.fails++;
      if ((a.kind === 'code' || a.kind === 'exam') && a.verified && a.autonomous && a.correct && !solutionSeen.has(a.itemId)) {
        (autoItems[s] ??= new Set()).add(a.itemId);
      }
    }
    if (a.solutionViewed) solutionSeen.add(a.itemId);
  }
  for (const s of SKILLS) {
    const sc = out[s.id];
    sc.autonomousCode = autoItems[s.id]?.size ?? 0;
    sc.mastery = sc.evidence > 0 ? (sum[s.id] ?? 0) / (sc.evidence + PRIOR) : 0;
    sc.provisional = sc.evidence < 4;
    const hasCode = EXERCISES.some((e) => e.skills.includes(s.id));
    if (sc.evidence === 0) sc.status = 'non évalué';
    else if (sc.mastery >= 0.7 && (!hasCode || sc.autonomousCode >= 1)) sc.status = 'acquis';
    else if (sc.mastery >= 0.4) sc.status = 'en cours';
    else sc.status = 'fragile';
  }
  return out;
}

export function examRatio(e: ExamAttempt): number {
  if (!e.steps) return 0;
  const total = e.steps.reduce((s, x) => s + x.points, 0);
  const got = e.steps.reduce((s, x) => s + x.earned, 0);
  return total ? got / total : 0;
}

export interface Readiness {
  value: number;
  provisional: boolean;
  parts: { skills: number; autonomy: number; exam: number | null };
  caps: string[];
}

const IMPORTANCE: Record<number, number> = { 3: 3, 2: 1.5, 1: 0, 0: 0 };

export function readiness(state: State, scores = skillScores(state.attempts)): Readiness {
  let num = 0;
  let den = 0;
  for (const s of SKILLS) {
    const w = IMPORTANCE[s.stumper];
    if (!w) continue;
    num += w * scores[s.id].mastery;
    den += w;
  }
  const skillsPart = den ? num / den : 0;

  // Autonomy: distinct exercises solved alone, compiled and tested.
  const solutionSeen = new Set(state.attempts.filter((a) => a.solutionViewed).map((a) => a.itemId));
  const solved = new Map<string, number>();
  for (const a of state.attempts) {
    if (a.kind === 'code' && a.verified && a.autonomous && a.correct && !solutionSeen.has(a.itemId)) {
      solved.set(a.itemId, a.level === 3 ? 1.5 : a.level === 1 ? 0.6 : 1);
    }
  }
  const autonomy = Math.min(1, [...solved.values()].reduce((s, x) => s + x, 0) / 8);

  const finished = state.exams
    .filter((e) => (e.status === 'finished' || e.status === 'timeout') && !e.aided && e.verified)
    .sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0))
    .slice(0, 2);
  const examPart = finished.length ? finished.reduce((s, e) => s + examRatio(e), 0) / finished.length : null;

  let value = examPart !== null ? 0.45 * skillsPart + 0.2 * autonomy + 0.35 * examPart : 0.65 * skillsPart + 0.35 * autonomy;
  const caps: string[] = [];
  if (examPart === null && value > 0.6) {
    value = 0.6;
    caps.push('Plafonné à 60 % tant qu\'aucune simulation d\'une heure n\'a été terminée sans aide.');
  }
  if (solved.size === 0 && value > 0.3) {
    value = 0.3;
    caps.push('Plafonné à 30 % : aucun exercice de code n\'a encore été réussi seul et vérifié par compilation.');
  }
  const totalEvidence = SKILLS.filter((s) => s.stumper >= 2).reduce((s, x) => s + scores[x.id].evidence, 0);
  return {
    value,
    provisional: totalEvidence < 25 || examPart === null,
    parts: { skills: skillsPart, autonomy, exam: examPart },
    caps,
  };
}

/** Share of exam-relevant skills that have been evaluated at all (weighted). */
export function coverage(scores: Record<SkillId, SkillScore>): number {
  let num = 0;
  let den = 0;
  for (const s of SKILLS) {
    const w = IMPORTANCE[s.stumper];
    if (!w) continue;
    den += w;
    if (scores[s.id].evidence >= 2) num += w;
    else if (scores[s.id].evidence > 0) num += w * 0.5;
  }
  return den ? num / den : 0;
}

export function contentProgress(state: State, lessonCount: number) {
  const exerciseIds = new Set(state.attempts.filter((a) => a.kind === 'code').map((a) => a.itemId));
  const solvedIds = new Set(state.attempts.filter((a) => a.kind === 'code' && a.correct).map((a) => a.itemId));
  return {
    lessons: Object.keys(state.lessonsDone).length / lessonCount,
    exercisesTried: exerciseIds.size / EXERCISES.length,
    exercisesSolved: solvedIds.size / EXERCISES.length,
    examsDone: state.exams.filter((e) => e.status !== 'running').length,
    examsAvailable: EXAMS.length,
  };
}

/** Recurring mistakes: misconception tags and failure kinds, most frequent first. */
export function recurringErrors(attempts: Attempt[]) {
  const counts = new Map<string, { label: string; count: number; skills: Set<SkillId>; last: number }>();
  const add = (key: string, label: string, a: Attempt) => {
    const e = counts.get(key) ?? { label, count: 0, skills: new Set<SkillId>(), last: 0 };
    e.count++;
    a.skills.forEach((s) => e.skills.add(s));
    e.last = Math.max(e.last, a.ts);
    counts.set(key, e);
  };
  for (const a of attempts) {
    if (a.correct) continue;
    if (a.gap) add('gap:' + a.gap, GAP_LABELS[a.gap] ?? a.gap, a);
    if (a.details?.compileError) add('compile', 'Le code ne compile pas', a);
    if (a.details?.timeout) add('timeout', 'Boucle infinie / programme trop lent', a);
    if (a.details?.crash) add('crash', 'Plantage à l\'exécution (accès mémoire)', a);
    for (const k of a.details?.failedKinds ?? []) {
      if (k === 'limit') add('kind:limit', 'Cas limites non gérés (0, INT_MIN, un seul élément…)', a);
      if (k === 'empty') add('kind:empty', 'Entrée vide non gérée', a);
      if (k === 'error') add('kind:error', 'Gestion d\'erreur absente ou incorrecte', a);
    }
    for (const msg of a.details?.staticIssues ?? []) add('static:' + msg.split(':')[0], msg.split('.')[0], a);
  }
  return [...counts.entries()]
    .map(([key, v]) => ({ key, ...v, skills: [...v.skills] }))
    .sort((a, b) => b.count - a.count || b.last - a.last);
}

export const GAP_LABELS: Record<string, string> = {
  'link-vs-compile': 'Confondre erreur de compilation et d\'édition des liens',
  'missing-prototype': 'Prototype manquant (fonction non déclarée)',
  'read-error-location': 'Mauvaise lecture du message d\'erreur',
  'compile-steps': 'Étapes de compilation (-c, .o, édition des liens)',
  segfault: 'Origine d\'une Segmentation fault',
  'debug-method': 'Méthode de correction d\'erreurs',
  'main-return': 'Valeur de retour de main',
  'no-main-delivery': 'main dans un rendu de fonction',
  'file-structure': 'Structure d\'un fichier C',
  'int-division': 'Division entière et modulo',
  'assign-vs-compare': 'Confusion = et ==',
  increment: 'i++ / ++i',
  uninitialized: 'Variable non initialisée',
  'int-limits': 'Limites d\'un int',
  'digit-to-char': 'Chiffre ↔ caractère (+ \'0\')',
  'char-vs-string': 'Caractère \'a\' vs chaîne "a"',
  'char-arith': 'Calculs sur les char',
  'case-convert': 'Conversion majuscule / minuscule',
  'range-test': 'Tester un intervalle (&&)',
  'zero-case': 'Oubli du cas 0',
  'logic-ops': 'Opérateurs logiques && || !',
  'short-circuit': 'Évaluation paresseuse',
  'off-by-one': 'Décalage de 1 dans les bornes de boucle',
  'infinite-loop': 'Boucle infinie',
  'nested-loops': 'Boucles imbriquées (remise à zéro)',
  'trace-loop': 'Dérouler une boucle à la main',
  'for-while': 'Équivalence for / while',
  'pass-by-value': 'Passage par valeur (copie)',
  'return-vs-print': 'Renvoyer ≠ afficher',
  'static-func': 'Fonctions static',
  'missing-return': 'return manquant',
  'digit-split': 'Découper un nombre (% 10, / 10)',
  'int-min': 'INT_MIN (débordement de -nb)',
  'edge-cases': 'Choix des cas limites',
  'putnbr-recursion': 'my_put_nbr récursif',
  deref: 'Déréférencement (*p)',
  'pass-address': 'Passer une adresse',
  null: 'Pointeur NULL',
  'double-pointer': 'Pointeur de pointeur',
  'nul-byte': 'Caractère nul \\0',
  'index-zero': 'Indices à partir de 0',
  'nul-vs-zero': '\'\\0\' vs \'0\'',
  'literal-readonly': 'Littéral en lecture seule',
  'ptr-arith': 'Arithmétique de pointeurs',
  'array-bounds': 'Bornes d\'un tableau',
  'array-decay': 'Tableau passé à une fonction',
  accumulate: 'Accumulateur',
  'sign-parity': 'Signes multiples',
  'char-to-digit': 'Caractère → chiffre (- \'0\')',
  'strcmp-sign': 'Valeur de retour de strcmp',
  'strncpy-nul': 'Règle du \\0 de strncpy',
  'capitalize-rule': 'Règle de capitalize',
  strcat: 'Concaténation',
  'argc-count': 'Valeur de argc',
  'shell-quotes': 'Guillemets du shell',
  'argv-2d': 'argv[i][j]',
  'argv-loop': 'Boucle sur argv',
  stderr: 'Sortie d\'erreur (fd 2)',
  'exit-84': 'Code de sortie 84',
  'check-before': 'Vérifier avant l\'opération',
  'exam-method': 'Méthode d\'examen',
  'base-case': 'Cas de base de la récursion',
  'trace-recursion': 'Dérouler une récursion',
  'malloc-plus-one': 'malloc : +1 pour le \\0',
  'malloc-null': 'Retour NULL de malloc',
  dangling: 'Renvoyer l\'adresse d\'une variable locale',
  free: 'Rôle de free',
  'sizeof-ptr': 'sizeof(char *) vs sizeof(char)',
  separators: 'Séparateurs de mots',
  binary: 'Binaire',
  'base-symbol': 'Symboles d\'une base',
  hex: 'Hexadécimal',
  criterion: 'Assertions Criterion',
  coverage: 'Couverture de tests',
  'link-flags': 'Options -L et -l',
  header: 'Rôle d\'un header',
  arrow: 'Opérateur ->',
  'macro-parens': 'Parenthèses dans les macros',
  bitshift: 'Décalages de bits',
  'make-rules': 'Règles du Makefile',
  relink: 'Relink',
  'funcptr-syntax': 'Syntaxe des pointeurs sur fonction',
  'funcptr-call': 'Appel via pointeur sur fonction',
  'list-end': 'Fin de liste (NULL)',
  'push-front': 'Ajout en tête de liste',
  'open-fail': 'Échec de open',
  'read-count': 'Nombre d\'octets lus',
  'read-eof': 'Fin de fichier (read = 0)',
  chmod: 'Droits chmod',
  'cat-e': 'cat -e',
  'bash-params': 'Paramètres bash',
  pipe: 'Pipe |',
  'git-flow': 'add / commit / push',
  'git-push': 'push',
};

export const METHOD_TEXT = {
  mastery: [
    'Chaque résultat apporte une « preuve » avec un poids : quiz 1 (0,3 s\'il a déjà été vu), exercice de code compilé et réussi seul 4 (3 en cas de nouvel essai), avec indices 1,5 ou moins, après avoir vu la solution 0,3 (et le score compte au plus pour 50 %), étape de simulation d\'examen 5.',
    'Maîtrise = somme(poids × score) / (somme des poids + 3). Le « + 3 » empêche une seule réussite de faire bondir le pourcentage.',
    'Les preuves anciennes comptent moins : leur poids est divisé par 2 toutes les 3 semaines.',
    'Une notion est « acquise » si sa maîtrise atteint 70 % ET qu\'au moins un exercice de code de cette notion a été réussi seul (si la notion en a). « Provisoire » s\'affiche tant que le total des poids est inférieur à 4.',
  ],
  readiness: [
    'Préparation = 45 % maîtrise des notions utiles en examen (pondérées par importance) + 20 % autonomie (exercices différents réussis seuls et vérifiés, objectif 8) + 35 % moyenne des 2 dernières simulations d\'une heure terminées sans aide.',
    'Sans simulation : 65 % notions + 35 % autonomie, plafonné à 60 %.',
    'Sans aucun exercice de code réussi seul : plafonné à 30 %.',
    'Ce n\'est PAS une probabilité de réussir l\'examen : le sujet réel est inconnu. C\'est une mesure de ce que tu as démontré ici.',
  ],
};

export { skillOf };
