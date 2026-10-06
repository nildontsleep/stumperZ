// Builds the "Priorité : stumper demain" path for a time budget, and the review queue.
import type { SkillId } from '../content/types';
import { SKILLS, prereqClosure, skill } from '../content/skills';
import { LESSONS, lessonForSkill } from '../content/lessons';
import { EXERCISES, exercise } from '../content/exercises';
import { EXAMS } from '../content/exams';
import { QUIZZES } from '../content/quizzes';
import type { State } from './state';
import { todayKey } from './state';
import { skillScores, type SkillScore } from './scoring';

export type PlanItem =
  | { key: string; type: 'diagnostic'; minutes: number; reason: string }
  | { key: string; type: 'lesson'; id: string; skill: SkillId; minutes: number; reason: string }
  | { key: string; type: 'exercise'; id: string; mode: 'guided' | 'solo'; skill: SkillId; minutes: number; reason: string }
  | { key: string; type: 'quiz'; ids: string[]; skill: SkillId; minutes: number; reason: string }
  | { key: string; type: 'exam'; id: string; minutes: number; reason: string };

export const STUMPER_ORDER: SkillId[] = SKILLS.filter((s) => s.stumper >= 2).map((s) => s.id);

function solvedAlone(state: State, id: string) {
  const seen = state.attempts.some((a) => a.itemId === id && a.solutionViewed);
  return !seen && state.attempts.some((a) => a.itemId === id && a.kind === 'code' && a.correct && a.autonomous && a.verified);
}
function solvedAtAll(state: State, id: string) {
  return state.attempts.some((a) => a.itemId === id && a.kind === 'code' && a.correct);
}

/**
 * Skills to work on, most urgent first. Fragile skills (failed in the diagnostic or in practice)
 * come first, each preceded by its own weak prerequisites; then the other weak skills,
 * in dependency order.
 */
export function prioritySkills(state: State, scores: Record<SkillId, SkillScore>): SkillId[] {
  const failedDiag = new Set(state.diagnostic?.answers.filter((a) => a.outcome !== 'ok').map((a) => a.skill) ?? []);
  const weak = (id: SkillId) => {
    const s = scores[id];
    if (s.status === 'acquis') return false;
    if (s.status === 'en cours' && s.autonomousCode >= 2 && s.mastery >= 0.65) return false;
    return true;
  };
  const fragile = (id: SkillId) => weak(id) && (failedDiag.has(id) || scores[id].status === 'fragile');
  const result: SkillId[] = [];
  for (const s of STUMPER_ORDER) {
    if (!fragile(s)) continue;
    for (const p of [...prereqClosure(s), s]) {
      if (STUMPER_ORDER.includes(p) && weak(p) && !result.includes(p)) result.push(p);
    }
  }
  for (const s of STUMPER_ORDER) if (weak(s) && !result.includes(s)) result.push(s);
  return result;
}

function prereqDeep(a: SkillId, b: SkillId, seen = new Set<SkillId>()): boolean {
  for (const p of skill(a).prereqs) {
    if (p === b) return true;
    if (!seen.has(p)) {
      seen.add(p);
      if (prereqDeep(p, b, seen)) return true;
    }
  }
  return false;
}

function itemsForSkill(state: State, s: SkillId, sc: SkillScore, compact: boolean): PlanItem[] {
  const out: PlanItem[] = [];
  const l = lessonForSkill(s);
  if (!l) return out;
  const lessonDone = !!state.lessonsDone[l.id];
  if (!lessonDone && sc.status !== 'en cours') {
    out.push({ key: `lesson:${l.id}`, type: 'lesson', id: l.id, skill: s, minutes: compact ? Math.ceil(l.minutes * 0.6) : l.minutes, reason: sc.status === 'fragile' ? 'Notion fragile d\'après tes réponses : on reprend l\'explication.' : 'Notion pas encore vue ici.' });
  }
  if (l.guided && !solvedAtAll(state, l.guided) && !compact) {
    const ex = exercise(l.guided)!;
    out.push({ key: `ex:${l.guided}:guided`, type: 'exercise', id: l.guided, mode: 'guided', skill: s, minutes: ex.minutes, reason: 'Exercice accompagné : aides disponibles.' });
  }
  if (l.solo && !solvedAlone(state, l.solo)) {
    const ex = exercise(l.solo)!;
    out.push({ key: `ex:${l.solo}:solo`, type: 'exercise', id: l.solo, mode: 'solo', skill: s, minutes: ex.minutes, reason: 'À faire seul : c\'est ce qui compte pour la préparation.' });
  } else if (l.solo) {
    // already solved alone: pick another solo exercise of this skill not yet solved
    const other = EXERCISES.filter((e) => e.skills[0] === s && e.id !== l.solo && e.id !== l.guided && !solvedAlone(state, e.id)).sort((a, b) => a.level - b.level)[0];
    if (other) out.push({ key: `ex:${other.id}:solo`, type: 'exercise', id: other.id, mode: 'solo', skill: s, minutes: other.minutes, reason: 'Un exercice différent, pour prouver que la notion tient.' });
  }
  const unanswered = l.check.filter((id) => !state.attempts.some((a) => a.itemId === id && a.correct));
  if (unanswered.length && (!compact || sc.status === 'fragile')) {
    out.push({ key: `quiz:${s}`, type: 'quiz', ids: unanswered.slice(0, 4), skill: s, minutes: Math.max(2, unanswered.slice(0, 4).length), reason: 'Vérification rapide des acquis.' });
  }
  return out;
}

export function buildPlan(state: State, budget: number, now = Date.now()): { items: PlanItem[]; total: number; note: string } {
  const scores = skillScores(state.attempts, now);
  const items: PlanItem[] = [];
  let total = 0;
  const add = (it: PlanItem) => {
    items.push(it);
    total += it.minutes;
  };
  if (!state.diagnostic) {
    add({ key: 'diagnostic', type: 'diagnostic', minutes: 15, reason: 'Pour savoir par où commencer (10 à 15 min, « je ne sais pas » est autorisé).' });
  }
  const compact = budget <= 45;
  const wantExam = budget >= 90;
  const examReserve = wantExam ? 65 : 0;
  const skills = prioritySkills(state, scores);
  for (const s of skills) {
    for (const it of itemsForSkill(state, s, scores[s], compact)) {
      if (total + it.minutes > budget - examReserve) continue;
      add(it);
    }
    if (total >= budget - examReserve) break;
  }
  if (wantExam) {
    const done = new Set(state.exams.map((e) => e.examId));
    const next = EXAMS.find((e) => !done.has(e.id)) ?? EXAMS[0];
    add({ key: `exam:${next.id}`, type: 'exam', id: next.id, minutes: 60, reason: 'Simulation dans les conditions de l\'examen : 1 h, sans aide.' });
  }
  let note = '';
  if (compact) note = 'Peu de temps : on vise les bases qui bloquent le plus, sans relire tous les cours.';
  else if (!wantExam) note = 'Pas assez de temps pour une simulation complète d\'une heure : priorité aux notions.';
  else note = 'Les notions d\'abord, puis une simulation d\'une heure pour finir.';
  if (items.length === 0) note = 'Toutes les notions prioritaires sont travaillées. Enchaîne les simulations d\'examen.';
  return { items, total, note };
}

export function planItemDone(state: State, it: PlanItem): boolean {
  const today = state.planDone[todayKey()] ?? [];
  if (today.includes(it.key)) return true;
  switch (it.type) {
    case 'diagnostic':
      return !!state.diagnostic;
    case 'lesson':
      return !!state.lessonsDone[it.id];
    case 'exercise':
      return it.mode === 'solo' ? solvedAlone(state, it.id) : solvedAtAll(state, it.id);
    case 'quiz':
      return it.ids.every((id) => state.attempts.some((a) => a.itemId === id && a.correct));
    case 'exam':
      return state.exams.some((e) => e.examId === it.id && e.status !== 'running');
  }
}

// ------------------------------------------------------------------ review queue

export interface ReviewEntry {
  skill: SkillId;
  priority: number;
  reasons: string[];
  /** Easier exercise first, then the original target. */
  steps: { type: 'quiz' | 'exercise'; id: string; label: string }[];
}

export function reviewQueue(state: State, now = Date.now()): ReviewEntry[] {
  const scores = skillScores(state.attempts, now);
  const entries: ReviewEntry[] = [];
  const dependents = (s: SkillId) => SKILLS.filter((x) => x.stumper >= 2 && prereqDeep(x.id, s)).length;
  for (const sk of SKILLS) {
    const sc = scores[sk.id];
    const fails = state.attempts.filter((a) => a.skills.includes(sk.id) && !a.correct);
    const examFails = state.exams.flatMap((e) =>
      (e.steps ?? []).map((st, i) => ({ st, step: EXAMS.find((x) => x.id === e.examId)?.steps[i] })).filter((x) => x.step?.skills.includes(sk.id) && x.st.passed < x.st.total),
    );
    if (!fails.length && !examFails.length && !(sc.status === 'en cours' && sc.lastTs && now - sc.lastTs > 3 * 86400000)) continue;
    const reasons: string[] = [];
    let priority = 0;
    const recentFails = fails.filter((a) => now - a.ts < 7 * 86400000).length;
    if (recentFails) {
      reasons.push(`${recentFails} erreur${recentFails > 1 ? 's' : ''} récente${recentFails > 1 ? 's' : ''}`);
      priority += Math.min(recentFails, 5) * 2;
    }
    const dep = dependents(sk.id);
    if (dep >= 3 && sc.status !== 'acquis') {
      reasons.push(`prérequis de ${dep} autres notions`);
      priority += dep;
    }
    if (examFails.length) {
      reasons.push('bloquant en simulation d\'examen');
      priority += 4;
    }
    if (sc.lastTs && now - sc.lastTs > 3 * 86400000 && sc.status !== 'acquis') {
      reasons.push('pas retravaillé depuis plusieurs jours');
      priority += 1;
    }
    if (sc.status === 'acquis' && !examFails.length) priority = priority / 3;
    priority += sk.stumper;
    // steps: a quiz on the gap, an easier exercise, then a harder one
    const steps: ReviewEntry['steps'] = [];
    const wrongQuiz = fails.filter((a) => a.kind === 'quiz').map((a) => a.itemId);
    const quizIds = QUIZZES.filter((q) => q.skill === sk.id && !wrongQuiz.includes(q.id)).slice(0, 1).map((q) => q.id);
    for (const id of [...new Set(wrongQuiz)].slice(0, 2)) steps.push({ type: 'quiz', id, label: 'Question ratée à refaire' });
    for (const id of quizIds) steps.push({ type: 'quiz', id, label: 'Question voisine' });
    const exs = EXERCISES.filter((e) => e.skills.includes(sk.id)).sort((a, b) => a.level - b.level);
    const failedEx = fails.filter((a) => a.kind === 'code').map((a) => a.itemId);
    const target = exs.find((e) => failedEx.includes(e.id));
    const easier = exs.find((e) => !solvedAlone(state, e.id) && (!target || e.level < target.level));
    if (easier) steps.push({ type: 'exercise', id: easier.id, label: `Plus accessible : ${easier.title}` });
    if (target && target.id !== easier?.id) steps.push({ type: 'exercise', id: target.id, label: `Retour à l\'objectif : ${target.title}` });
    if (!steps.length) continue;
    entries.push({ skill: sk.id, priority, reasons, steps });
  }
  return entries.sort((a, b) => b.priority - a.priority);
}

/** A ~10 minute session on weak points: 4 quick questions and one short exercise. */
export function tenMinuteSession(state: State, now = Date.now()) {
  const scores = skillScores(state.attempts, now);
  const weakSkills = STUMPER_ORDER.filter((s) => scores[s].status !== 'acquis').sort((a, b) => scores[a].mastery - scores[b].mastery);
  const pool = weakSkills.length ? weakSkills : STUMPER_ORDER;
  const correctRecently = new Set(state.attempts.filter((a) => a.correct && now - a.ts < 2 * 86400000).map((a) => a.itemId));
  const quizzes: string[] = [];
  for (const s of pool) {
    const q = QUIZZES.find((x) => x.skill === s && !correctRecently.has(x.id) && !quizzes.includes(x.id));
    if (q) quizzes.push(q.id);
    if (quizzes.length >= 4) break;
  }
  const ex = EXERCISES.filter((e) => pool.includes(e.skills[0]) && e.minutes <= 10 && !solvedAlone(state, e.id)).sort((a, b) => a.level - b.level)[0];
  return { quizzes, exercise: ex?.id };
}

export const lessonCount = LESSONS.length;
