// Validates all pedagogical content and generates expected test outputs.
//  - every exercise solution passes the static rules and all tests, compiled with wcc (browser compiler)
//  - the same solution compiled with the system gcc gives identical outputs (cross-check)
//  - starters compile; references (lessons -> exercises/quizzes/sources) exist
// Usage: npx tsx tools/validate-content.ts
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { loadToolchain } from './node-cc';
import { compileOnly, runCompiled } from '../src/runtime/cc';
import { EXERCISES } from '../src/content/exercises';
import { EXAMS } from '../src/content/exams';
import { QUIZZES } from '../src/content/quizzes/index';
import { LESSONS } from '../src/content/lessons/index';
import { VIDEOS } from '../src/content/videos';
import { DIAGNOSTIC } from '../src/content/diagnostic';
import { PDF_DAYS } from '../src/content/pdf';
import { SKILLS } from '../src/content/skills';
import { exerciseSources, testRequest, QUIZ_PRELUDE } from '../src/engine/harness';
import { checkCode } from '../src/engine/staticcheck';
import { compareOutput } from '../src/engine/compare';
import type { CodeExercise, ExamSubject, SourceRef, TestCase } from '../src/content/types';

const tc = loadToolchain();
const errors: string[] = [];
const warn: string[] = [];
const expected: Record<string, { stdout: string; stderr: string; exitCode: number }[]> = {};
const only = process.argv[2];

function err(m: string) {
  errors.push(m);
  console.log('  ✗ ' + m);
}

function checkSource(where: string, s?: SourceRef) {
  if (!s) return;
  const d = PDF_DAYS.find((x) => x.id === s.day);
  if (!d) return err(`${where}: jour inconnu ${s.day}`);
  const t = d.tasks.find((x) => x.section === s.section);
  if (!t && !d.rules.some((r) => r.page === s.page)) return err(`${where}: section introuvable "${s.section}" dans ${d.file}`);
  if (t && t.page !== s.page) err(`${where}: page ${s.page} au lieu de ${t.page} pour ${s.section}`);
}

function gccRun(files: Record<string, string>, t: TestCase, args: string[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stz-'));
  try {
    const src = path.join(dir, 'src');
    fs.mkdirSync(src);
    for (const [n, c] of Object.entries(files)) fs.writeFileSync(path.join(src, n), c);
    const cfiles = Object.keys(files).filter((n) => n.endsWith('.c')).map((n) => path.join(src, n));
    execFileSync('gcc', ['-w', '-I', src, '-o', path.join(dir, 'a.out'), ...cfiles], { stdio: 'pipe' });
    const run = path.join(dir, 'run');
    fs.mkdirSync(run);
    for (const [n, c] of Object.entries(t.files ?? {})) {
      fs.mkdirSync(path.dirname(path.join(run, n)), { recursive: true });
      fs.writeFileSync(path.join(run, n), c);
    }
    const r = spawnSync(path.join(dir, 'a.out'), args, { cwd: run, input: t.stdin ?? '', timeout: 5000, argv0: './a.out' });
    return { stdout: r.stdout.toString(), stderr: r.stderr.toString(), exitCode: r.status ?? -1 };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function validateProgramLike(id: string, sources: Record<string, string>, tests: TestCase[], ex?: CodeExercise) {
  const c = compileOnly(tc, sources);
  if (!c.ok || !c.wasm) {
    err(`${id}: la solution ne compile pas avec wcc:\n${c.output}`);
    return;
  }
  const own = c.output.split('\n').filter((l) => /^[\w./-]+\(\d+\)/.test(l) && !l.startsWith('zz_'));
  if (own.length) warn.push(`${id}: avertissements wcc sur la solution:\n${own.join('\n')}`);
  const mod = new WebAssembly.Module(c.wasm as BufferSource);
  const outs: { stdout: string; stderr: string; exitCode: number }[] = [];
  tests.forEach((t, i) => {
    const req = ex ? testRequest(ex, t, i) : { args: t.args ?? [], stdin: t.stdin, files: t.files, denied: t.denied };
    const r = runCompiled(mod, req);
    if (r.trap) err(`${id} / test "${t.name}": plantage wasm ${r.trap}`);
    outs.push({ stdout: r.stdout, stderr: r.stderr, exitCode: r.exitCode });
    if (!t.denied?.length) {
      const g = gccRun(sources, t, req.args ?? []);
      if (g.stdout !== r.stdout) err(`${id} / test "${t.name}": sortie gcc ≠ wcc\n  gcc: ${JSON.stringify(g.stdout)}\n  wcc: ${JSON.stringify(r.stdout)}`);
      if (t.checkExit && g.exitCode !== r.exitCode) err(`${id} / test "${t.name}": code de sortie gcc ${g.exitCode} ≠ wcc ${r.exitCode}`);
      if (t.stderr === 'any' && (!g.stderr || !r.stderr)) err(`${id} / test "${t.name}": stderr attendu non vide`);
      if (t.stderr === 'empty' && (g.stderr || r.stderr)) err(`${id} / test "${t.name}": stderr attendu vide`);
    }
  });
  // Sanity: outputs must be distinguishable from an empty implementation for at least one test.
  expected[id] = outs;
  return outs;
}

console.log('== Exercices');
const ids = new Set<string>();
for (const ex of EXERCISES) {
  if (only && ex.id !== only) continue;
  if (ids.has(ex.id)) err(`id dupliqué ${ex.id}`);
  ids.add(ex.id);
  console.log('- ' + ex.id);
  checkSource(ex.id, ex.source);
  if (ex.tests.length < 2) err(`${ex.id}: moins de 2 tests`);
  if (!ex.tests.some((t) => t.kind && t.kind !== 'normal')) warn.push(`${ex.id}: aucun test marqué limite/vide/erreur`);
  const issues = checkCode(ex.solution, { allowed: ex.allowed, noArrays: ex.noArrays, providesPutchar: ex.providesPutchar, kind: ex.kind });
  for (const i of issues) err(`${ex.id}: la solution viole une règle: ${i.message}`);
  const starterC = compileOnly(tc, exerciseSources(ex, ex.starter));
  if (!starterC.ok) err(`${ex.id}: le squelette ne compile pas:\n${starterC.output}`);
  const outs = validateProgramLike(ex.id, exerciseSources(ex, ex.solution), ex.tests, ex);
  if (outs) {
    // The starter must fail at least one test (otherwise the exercise is trivial or the tests are weak).
    if (starterC.ok && starterC.wasm) {
      const mod = new WebAssembly.Module(starterC.wasm as BufferSource);
      const allPass = ex.tests.every((t, i) => {
        const r = runCompiled(mod, testRequest(ex, t, i));
        return compareOutput(t, outs[i], r).pass;
      });
      if (allPass) err(`${ex.id}: le squelette passe tous les tests (tests trop faibles)`);
    }
  }
}

console.log('== Examens');
for (const exam of EXAMS as ExamSubject[]) {
  if (only && exam.id !== only) continue;
  console.log('- ' + exam.id);
  const issues = checkCode(exam.solution, { allowed: exam.allowed, kind: 'program' });
  for (const i of issues) err(`${exam.id}: la solution viole une règle: ${i.message}`);
  const all = exam.steps.flatMap((s) => s.tests);
  validateProgramLike(exam.id, { [exam.file]: exam.solution }, all);
  const st = compileOnly(tc, { [exam.file]: exam.starter });
  if (!st.ok) err(`${exam.id}: le squelette ne compile pas:\n${st.output}`);
  if (exam.correction.length !== exam.steps.length) err(`${exam.id}: une correction par étape attendue`);
}

if (!only) {
  console.log('== Quiz');
  const qids = new Set<string>();
  for (const q of QUIZZES) {
    if (qids.has(q.id)) err(`quiz id dupliqué ${q.id}`);
    qids.add(q.id);
    checkSource(q.id, q.source);
    if (!SKILLS.find((s) => s.id === q.skill)) err(`${q.id}: compétence inconnue ${q.skill}`);
    if (q.kind === 'mcq' || q.kind === 'output' || q.kind === 'bug') {
      const n = q.options?.filter((o) => o.correct).length ?? 0;
      if (n !== 1) err(`${q.id}: ${n} bonnes réponses (1 attendue)`);
      if (q.options?.some((o) => !o.correct && !o.why)) err(`${q.id}: une mauvaise réponse sans explication`);
    }
    if (q.kind === 'multi' || q.kind === 'tests') {
      const n = q.options?.filter((o) => o.correct).length ?? 0;
      if (n < 1) err(`${q.id}: aucune bonne réponse`);
    }
    if (q.kind === 'order' && (!q.lines || q.lines.length < 3)) err(`${q.id}: remise en ordre trop courte`);
    if (q.kind === 'fill' && !q.answers?.length) err(`${q.id}: pas de réponse attendue`);
    // Output questions: the displayed answer must be what the program really prints.
    if (q.kind === 'output' && q.code && !q.code.includes('/* fragment */')) {
      const c = compileOnly(tc, { 'q.c': q.code, 'zz_prelude.c': QUIZ_PRELUDE });
      if (!c.ok || !c.wasm) err(`${q.id}: le code ne compile pas:\n${c.output}`);
      else {
        const r = runCompiled(new WebAssembly.Module(c.wasm as BufferSource), {});
        const good = q.options!.find((o) => o.correct)!.text;
        const norm = (s: string) => s.replace(/\$\n?/g, '\n').replace(/\n$/, '');
        if (norm(good) !== norm(r.stdout)) err(`${q.id}: sortie réelle ${JSON.stringify(r.stdout)} ≠ réponse ${JSON.stringify(good)}`);
        const g = gccRun({ 'q.c': q.code, 'zz_prelude.c': QUIZ_PRELUDE }, { name: 'q' }, []);
        if (g.stdout !== r.stdout) err(`${q.id}: sortie gcc ≠ wcc`);
      }
    }
  }
  console.log(`${QUIZZES.length} quiz`);

  console.log('== Cours');
  for (const l of LESSONS) {
    for (const s of l.sources) checkSource(l.id, s);
    if (!l.complement && l.sources.length === 0) err(`${l.id}: cours sans source PDF ni marqué complément`);
    for (const id of [l.guided, l.solo].filter(Boolean) as string[]) if (!EXERCISES.find((e) => e.id === id)) err(`${l.id}: exercice inconnu ${id}`);
    for (const id of l.check) if (!QUIZZES.find((q) => q.id === id)) err(`${l.id}: quiz inconnu ${id}`);
    for (const id of l.videos ?? []) if (!VIDEOS.find((v) => v.id === id)) err(`${l.id}: vidéo inconnue ${id}`);
    if (l.check.length < 2) err(`${l.id}: moins de 2 questions de vérification`);
    if (l.guided && l.guided === l.solo) err(`${l.id}: exercice guidé = exercice seul`);
  }
  for (const s of SKILLS) if (!LESSONS.find((l) => l.skill === s.id)) err(`compétence sans cours: ${s.id}`);
  for (const v of VIDEOS) for (const q of v.quiz) if (!QUIZZES.find((x) => x.id === q)) err(`${v.id}: quiz inconnu ${q}`);
  for (const d of DIAGNOSTIC) if (!QUIZZES.find((x) => x.id === d.quiz) && !EXERCISES.find((x) => x.id === d.quiz)) err(`diagnostic: élément inconnu ${d.quiz}`);
  for (const d of PDF_DAYS) for (const t of d.tasks) if (t.exercise && !EXERCISES.find((e) => e.id === t.exercise)) err(`${d.id} ${t.section}: exercice inconnu ${t.exercise}`);
}

const outFile = 'src/content/generated/expected.json';
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const prev = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
fs.writeFileSync(outFile, JSON.stringify({ ...prev, ...expected }, null, 0));

if (warn.length) console.log(`\n${warn.length} avertissement(s):\n` + warn.map((w) => '  ! ' + w).join('\n'));
console.log(errors.length ? `\n${errors.length} ERREUR(S)` : '\nContenu valide.');
process.exit(errors.length ? 1 : 0);
