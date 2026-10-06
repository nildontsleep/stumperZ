// Runs an exercise's tests in the browser compiler and compares with the expected outputs
// (generated from the reference solution by tools/validate-content.ts).
import type { CodeExercise, ExamSubject, TestCase } from '../content/types';
import expectedJson from '../content/generated/expected.json';
import { cRunner, type RunOutcome } from '../runtime/client';
import { checkCode, type StaticIssue } from './staticcheck';
import { compareOutput } from './compare';
import { exerciseSources, testRequest } from './harness';

const EXPECTED = expectedJson as unknown as Record<string, { stdout: string; stderr: string; exitCode: number }[]>;

export interface TestResult {
  test: TestCase;
  pass: boolean;
  status: RunOutcome['status'];
  expected: { stdout: string; exitCode: number };
  got: { stdout: string; stderr: string; exitCode: number };
  reasons: string[];
  message?: string;
}

export interface RunReport {
  compiled: boolean;
  compileOutput: string;
  /** Errors/warnings that belong to the hidden test harness (prototype mismatch, etc.). */
  harnessProblem: boolean;
  staticIssues: StaticIssue[];
  results: TestResult[];
  passed: number;
  total: number;
  engineUnavailable?: string;
}

/** Keeps only compiler lines about the student's files. */
export function studentDiagnostics(output: string): { mine: string; harness: boolean } {
  const lines = output.split('\n');
  const keep: string[] = [];
  let harness = false;
  let skipping = false;
  for (const l of lines) {
    const m = l.match(/^([\w./-]+)\((\d+)\)/);
    if (m) {
      skipping = m[1].startsWith('zz_');
      if (skipping && /error/i.test(l)) harness = true;
    }
    if (!skipping) keep.push(l);
  }
  return { mine: keep.join('\n').trim(), harness };
}

export function trapMessage(msg?: string) {
  if (!msg) return 'Le programme a planté.';
  if (/out of bounds/i.test(msg)) return 'Plantage : accès mémoire hors limites (équivalent d\'une Segmentation fault sur Linux).';
  if (/unreachable/i.test(msg)) return 'Plantage : instruction impossible atteinte (souvent un abort ou une pile d\'appels corrompue).';
  if (/stack|call stack/i.test(msg)) return 'Plantage : trop d\'appels imbriqués (récursion infinie ?).';
  if (/divide by zero|integer divide/i.test(msg)) return 'Plantage : division entière par zéro.';
  if (/integer overflow/i.test(msg)) return 'Plantage : débordement dans une division (INT_MIN / -1 ?).';
  return 'Plantage : ' + msg;
}

export async function runExercise(ex: CodeExercise, code: string, onProgress?: (done: number, total: number) => void): Promise<RunReport> {
  const staticIssues = checkCode(code, { allowed: ex.allowed, noArrays: ex.noArrays, providesPutchar: ex.providesPutchar, kind: ex.kind });
  const sources = exerciseSources(ex, code);
  const c = await cRunner.compile(sources);
  const diag = studentDiagnostics(c.output);
  const base: RunReport = { compiled: c.ok, compileOutput: diag.mine || (c.ok ? '' : c.output), harnessProblem: diag.harness, staticIssues, results: [], passed: 0, total: ex.tests.length };
  if (cRunner.state === 'unavailable') return { ...base, engineUnavailable: cRunner.unavailableReason };
  if (!c.ok) return base;
  return runTests(base, sources, ex.tests, EXPECTED[ex.id], (t, i) => testRequest(ex, t, i), onProgress);
}

export async function runExamTests(exam: ExamSubject, code: string) {
  const staticIssues = checkCode(code, { allowed: exam.allowed, kind: 'program' });
  const sources = { [exam.file]: code };
  const c = await cRunner.compile(sources);
  const diag = studentDiagnostics(c.output);
  const all = exam.steps.flatMap((s) => s.tests);
  const base: RunReport = { compiled: c.ok, compileOutput: diag.mine || (c.ok ? '' : c.output), harnessProblem: false, staticIssues, results: [], passed: 0, total: all.length };
  if (cRunner.state === 'unavailable') return { ...base, engineUnavailable: cRunner.unavailableReason };
  if (!c.ok) return base;
  return runTests(base, sources, all, EXPECTED[exam.id], (t) => ({ args: t.args ?? [], stdin: t.stdin, files: t.files, denied: t.denied }));
}

async function runTests(
  base: RunReport,
  sources: Record<string, string>,
  tests: TestCase[],
  expected: { stdout: string; stderr: string; exitCode: number }[] | undefined,
  req: (t: TestCase, i: number) => any,
  onProgress?: (done: number, total: number) => void,
): Promise<RunReport> {
  const results: TestResult[] = [];
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const exp = expected?.[i] ?? { stdout: '', stderr: '', exitCode: 0 };
    const r = await cRunner.run(sources, req(t, i), 2000);
    const got = { stdout: r.stdout, stderr: r.stderr, exitCode: r.exitCode };
    let reasons: string[] = [];
    let pass = false;
    if (r.status === 'ok') {
      const v = compareOutput(t, exp, got);
      pass = v.pass;
      reasons = v.reasons;
      if (r.outputTruncated) reasons.push('Sortie beaucoup trop longue : coupée à 64 Ko.');
    } else if (r.status === 'timeout') {
      reasons = [r.message ?? 'Temps dépassé'];
    } else if (r.status === 'trap') {
      reasons = [trapMessage(r.message)];
    } else {
      reasons = [r.message ?? 'Erreur'];
    }
    results.push({ test: t, pass, status: r.status, expected: { stdout: exp.stdout, exitCode: exp.exitCode }, got, reasons });
    onProgress?.(i + 1, tests.length);
  }
  return { ...base, results, passed: results.filter((r) => r.pass).length };
}

/** Free run of a student program with custom arguments (exam "terminal"). */
export async function freeRun(sources: Record<string, string>, args: string[], stdin: string, files?: Record<string, string>) {
  const c = await cRunner.compile(sources);
  const diag = studentDiagnostics(c.output);
  if (!c.ok) return { compiled: false, compileOutput: diag.mine || c.output } as const;
  const r = await cRunner.run(sources, { args, stdin, files }, 3000);
  return { compiled: true, compileOutput: diag.mine, run: r } as const;
}
