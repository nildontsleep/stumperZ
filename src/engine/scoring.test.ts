import { describe, expect, it } from 'vitest';
import { attemptWeight, readiness, skillScores, coverage } from './scoring';
import { buildPlan, prioritySkills, reviewQueue } from './planner';
import { emptyState, parseBackup, makeBackup, type Attempt } from './state';
import { checkCode } from './staticcheck';
import { promoteLong } from '../runtime/cc';

const NOW = Date.UTC(2026, 9, 6, 20);

function att(p: Partial<Attempt>): Attempt {
  return {
    id: Math.random().toString(36), ts: NOW, kind: 'quiz', itemId: 'q', skills: ['loops'], score: 1, correct: true,
    autonomous: true, hintsUsed: 0, solutionViewed: false, verified: false, firstTry: true, level: 1, context: 'practice', ...p,
  };
}

describe('scoring', () => {
  it('one easy success does not make a skill acquired', () => {
    const s = skillScores([att({})], NOW).loops;
    expect(s.mastery).toBeCloseTo(0.25);
    expect(s.status).toBe('fragile');
    expect(s.provisional).toBe(true);
  });

  it('a skill without evidence is "non évalué", not acquired', () => {
    expect(skillScores([], NOW).pointers.status).toBe('non évalué');
  });

  it('repeating the same quiz weighs little', () => {
    expect(attemptWeight(att({ firstTry: false }), false)).toBeCloseTo(0.3);
  });

  it('autonomous verified code weighs much more than guided code', () => {
    const solo = attemptWeight(att({ kind: 'code', verified: true, level: 2 }), false);
    const guided = attemptWeight(att({ kind: 'code', verified: true, autonomous: false, hintsUsed: 2, level: 2 }), false);
    const sol = attemptWeight(att({ kind: 'code', verified: true, autonomous: false, solutionViewed: true, level: 2 }), false);
    expect(solo).toBe(4);
    expect(guided).toBeLessThan(1.5);
    expect(sol).toBeLessThan(0.5);
  });

  it('acquired needs mastery and an autonomous code success', () => {
    const quizOnly = Array.from({ length: 12 }, (_, i) => att({ itemId: 'q' + i }));
    expect(skillScores(quizOnly, NOW).loops.status).not.toBe('acquis');
    const withCode = [...quizOnly, att({ kind: 'code', itemId: 'ex_print_line', verified: true, level: 1 })];
    expect(skillScores(withCode, NOW).loops.status).toBe('acquis');
  });

  it('old evidence decays', () => {
    const recent = skillScores([att({ kind: 'code', verified: true, level: 2 })], NOW).loops.evidence;
    const old = skillScores([att({ kind: 'code', verified: true, level: 2, ts: NOW - 42 * 86400000 })], NOW).loops.evidence;
    expect(old).toBeCloseTo(recent / 4, 5);
  });

  it('readiness is capped without autonomous code and without simulation', () => {
    const st = emptyState();
    st.attempts = Array.from({ length: 40 }, (_, i) => att({ itemId: 'q' + i, skills: ['compile', 'structure', 'vars', 'chars', 'cond', 'loops', 'functions', 'putnbr', 'pointers', 'strings', 'arrays', 'getnbr', 'strfuncs', 'argv', 'errors84', 'method', 'recursion', 'malloc', 'wordarray', 'bases', 'fd'] }));
    const r = readiness(st, skillScores(st.attempts, NOW));
    expect(r.value).toBeLessThanOrEqual(0.3);
    expect(r.caps.length).toBeGreaterThan(0);
    expect(r.provisional).toBe(true);
  });

  it('readiness is 0 for a new student and coverage 0', () => {
    const st = emptyState();
    expect(readiness(st).value).toBe(0);
    expect(coverage(skillScores([], NOW))).toBe(0);
  });
});

describe('planner', () => {
  it('starts with the diagnostic when it was never taken', () => {
    const plan = buildPlan(emptyState(), 60, NOW);
    expect(plan.items[0].type).toBe('diagnostic');
  });

  it('fits the time budget and only adds a simulation with enough time', () => {
    for (const budget of [30, 60, 120, 240]) {
      const st = emptyState();
      st.diagnostic = { completedAt: NOW, answers: [] };
      const plan = buildPlan(st, budget, NOW);
      expect(plan.total).toBeLessThanOrEqual(budget);
      expect(plan.items.some((i) => i.type === 'exam')).toBe(budget >= 90);
    }
  });

  it('puts a failed prerequisite before what depends on it', () => {
    const st = emptyState();
    st.diagnostic = { completedAt: NOW, answers: [{ item: 'q_str_2', skill: 'strings', outcome: 'wrong' }, { item: 'q_cond_1', skill: 'cond', outcome: 'wrong' }] };
    const order = prioritySkills(st, skillScores([], NOW));
    expect(order.indexOf('cond')).toBeLessThan(order.indexOf('loops'));
    expect(order.indexOf('loops')).toBeLessThan(order.indexOf('strings'));
    expect(order.indexOf('strings')).toBeLessThan(order.indexOf('argv'));
  });

  it('review queue proposes an easier exercise after a failure', () => {
    const st = emptyState();
    st.attempts = [att({ kind: 'code', itemId: 'ex_getnbr', skills: ['getnbr'], correct: false, score: 0.3, verified: true, level: 3 })];
    const q = reviewQueue(st, NOW);
    const e = q.find((x) => x.skill === 'getnbr')!;
    expect(e).toBeTruthy();
    const ex = e.steps.filter((s) => s.type === 'exercise').map((s) => s.id);
    expect(ex[0]).toBe('ex_atoi_simple');
    expect(ex).toContain('ex_getnbr');
  });
});

describe('backup', () => {
  it('round-trips and rejects garbage', () => {
    const st = emptyState();
    st.attempts.push(att({}));
    const b = parseBackup(JSON.stringify(makeBackup(st, { ex_strlen: 'int x;' })));
    expect(b.ok).toBe(true);
    if (b.ok) {
      expect(b.backup.state.attempts.length).toBe(1);
      expect(b.backup.drafts.ex_strlen).toBe('int x;');
    }
    expect(parseBackup('{').ok).toBe(false);
    expect(parseBackup('{"format":"other"}').ok).toBe(false);
    expect(parseBackup(JSON.stringify({ ...makeBackup(st, {}), version: 99 })).ok).toBe(false);
  });
});

describe('static checks', () => {
  it('flags forbidden functions but not the ones defined by the student', () => {
    const issues = checkCode('#include <stdio.h>\nint f(void) { printf("x"); return my_strlen("a"); }', { allowed: ['my_putchar'] });
    expect(issues.map((i) => i.message).join()).toContain('printf');
    const own = checkCode('static int strlen2(char *s) { return 0; }\nint write(int a) { return a; }\nint g(void) { return write(1); }', { allowed: [] });
    expect(own.length).toBe(0);
  });
  it('ignores names inside strings and comments, and detects arrays for Day 03', () => {
    expect(checkCode('/* printf( */ int f(void) { return 0; }', { allowed: [] }).length).toBe(0);
    expect(checkCode('int f(void) { char t[3]; return 0; }', { allowed: [], noArrays: true }).length).toBe(1);
  });
});

describe('promoteLong', () => {
  it('rewrites long outside comments and strings only', () => {
    expect(promoteLong('long a; unsigned long b; long long c; /* long */ char *s = "long";')).toBe(
      'long long a; unsigned long long b; long long c; /* long */ char *s = "long";',
    );
    expect(promoteLong('long int x = (long)y;')).toBe('long long int x = (long long)y;');
  });
});
