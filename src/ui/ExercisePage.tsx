import { useEffect, useRef, useState } from 'react';
import { exercise as getExercise, EXERCISES } from '../content/exercises';
import { skill } from '../content/skills';
import { lessonForSkill } from '../content/lessons';
import { getDrafts, saveDraft, clearDraft, recordAttempt, updateAttempt, useStore } from '../app/store';
import { navigate, back } from '../app/router';
import { runExercise, freeRun, trapMessage, type RunReport } from '../engine/run';
import { Editor } from './Editor';
import { RunResults, parseArgs } from './RunResults';
import { Blocks, CodeView, Rich, SourceChip, fmtMinutes } from './text';
import { catE } from '../engine/compare';
import { cRunner } from '../runtime/client';

const HINT_TITLES = ['Reformulation', 'Piste de réflexion', 'Étapes de résolution', 'Squelette partiel'];
const RELATION = { reproduces: 'Tâche du PDF', inspired: 'Inspiré du PDF', complement: 'Complément (hors PDF)' } as const;

export function ExercisePage({ id, mode: initialMode, from }: { id: string; mode?: 'guided' | 'solo'; from?: string }) {
  const ex = getExercise(id);
  const [mode, setMode] = useState<'guided' | 'solo'>(initialMode ?? 'solo');
  const [code, setCode] = useState(() => getDrafts()[id] ?? ex?.starter ?? '');
  const [report, setReport] = useState<RunReport | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [hints, setHints] = useState(0);
  const [solution, setSolution] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [askSolo, setAskSolo] = useState(false);
  const attemptId = useRef<string | null>(null);
  const runs = useRef(0);
  const best = useRef(0);
  const solvedBefore = useStore((s) => s.attempts.some((a) => a.itemId === id && a.kind === 'code' && a.correct));

  useEffect(() => {
    setCode(getDrafts()[id] ?? ex?.starter ?? '');
    setReport(null);
    setHints(0);
    setSolution(false);
    attemptId.current = null;
    runs.current = 0;
    best.current = 0;
    setMode(initialMode ?? 'solo');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!ex) return <p>Exercice introuvable.</p>;

  const autonomous = hints === 0 && !solution;

  function onChange(v: string) {
    setCode(v);
    saveDraft(id, v);
  }

  async function run() {
    if (running) return;
    setRunning('Compilation…');
    runs.current++;
    const r = await runExercise(ex!, code, (d, t) => setRunning(`Test ${d} / ${t}…`));
    setRunning(null);
    setReport(r);
    if (r.engineUnavailable) return;
    const score = r.compiled ? r.passed / r.total : 0;
    const rulesOk = r.staticIssues.length === 0;
    const correct = r.compiled && r.passed === r.total && rulesOk;
    best.current = Math.max(best.current, correct ? 1 : rulesOk ? score : score * 0.5);
    const failedKinds = [...new Set(r.results.filter((x) => !x.pass).map((x) => x.test.kind ?? 'normal'))];
    const details = {
      passed: r.passed, total: r.total, compileError: !r.compiled, staticIssues: r.staticIssues.map((i) => i.message), failedKinds,
      timeout: r.results.some((x) => x.status === 'timeout'), crash: r.results.some((x) => x.status === 'trap'),
    };
    const payload = {
      kind: 'code' as const, itemId: ex!.id, skills: ex!.skills, score: best.current, correct: best.current === 1, autonomous,
      hintsUsed: hints, solutionViewed: solution, verified: r.compiled, level: ex!.level, context: (from === 'review' ? 'review' : from === 'lesson' ? 'lesson' : 'practice') as 'practice',
      details,
    };
    if (!attemptId.current) attemptId.current = recordAttempt(payload).id;
    else updateAttempt(attemptId.current, payload);
  }

  function openHint(n: number) {
    if (mode === 'solo' && hints === 0 && !askSolo) {
      setAskSolo(true);
      return;
    }
    setHints(Math.max(hints, n));
    if (attemptId.current) updateAttempt(attemptId.current, { autonomous: false, hintsUsed: Math.max(hints, n) });
  }
  function openSolution() {
    setSolution(true);
    if (attemptId.current) updateAttempt(attemptId.current, { autonomous: false, solutionViewed: true, score: Math.min(best.current, 0.5) });
  }

  const lesson = lessonForSkill(ex.skills[0]);
  const similar = EXERCISES.filter((e) => e.id !== ex.id && e.skills[0] === ex.skills[0]).slice(0, 3);
  const passedAll = report && report.compiled && report.passed === report.total && report.staticIssues.length === 0;

  return (
    <div className="page exercise-page">
      <header className="page-head">
        <button type="button" className="link-btn" onClick={back}>← Retour</button>
        <h1>{ex.title}<span className="cursor">_</span></h1>
        <div className="row gap wrap meta">
          <span className="tag">{RELATION[ex.relation]}</span>
          {ex.source && <SourceChip s={ex.source} />}
          <span className="tag tag-soft">niveau {ex.level}</span>
          <span className="tag tag-soft">≈ {fmtMinutes(ex.minutes)}</span>
          {ex.skills.map((s) => <span key={s} className="tag tag-soft">{skill(s).title}</span>)}
          {solvedBefore && <span className="tag tag-ok">déjà réussi</span>}
        </div>
      </header>

      <div className="mode-switch" role="radiogroup" aria-label="Mode">
        <button type="button" role="radio" aria-checked={mode === 'solo'} className={mode === 'solo' ? 'on' : ''} onClick={() => setMode('solo')}>
          Seul <small>compte pour la préparation</small>
        </button>
        <button type="button" role="radio" aria-checked={mode === 'guided'} className={mode === 'guided' ? 'on' : ''} onClick={() => setMode('guided')}>
          Accompagné <small>aides visibles, pour apprendre</small>
        </button>
      </div>

      <div className="ex-layout">
        <section className="ex-statement card" aria-label="Consigne">
          <h2>Consigne</h2>
          <Blocks blocks={ex.statement} />
          <dl className="facts">
            <dt>Fichier</dt><dd><code className="ic">{ex.file}</code></dd>
            {ex.prototype && <><dt>Prototype</dt><dd><code className="ic">{ex.prototype}</code></dd></>}
            <dt>Autorisé</dt><dd>{ex.allowed.length ? ex.allowed.join(', ') : 'aucune fonction de bibliothèque'}{ex.providesPutchar ? ' (my_putchar est fournie, ne la réécris pas)' : ''}</dd>
            {ex.noArrays && <><dt>Règle Day 03</dt><dd>ni tableaux ni chaînes</dd></>}
            <dt>Type</dt><dd>{ex.kind === 'function' ? 'une fonction, sans main (un main de test caché l\'appelle)' : 'un programme complet, avec main'}</dd>
          </dl>
          {ex.header && <CodeView code={ex.header.code} caption={`${ex.header.name} (fourni, à inclure avec #include "${ex.header.name}")`} />}

          <h3>Aides <small className="muted">(cachées par défaut)</small></h3>
          {askSolo && hints === 0 && (
            <div className="panel warn">
              <p>Tu es en mode « Seul ». Ouvrir une aide fera compter cette tentative comme <strong>aidée</strong> (moins de poids dans la préparation). C'est normal d'en avoir besoin : c'est comme ça qu'on apprend.</p>
              <div className="row gap"><button type="button" className="btn" onClick={() => { setAskSolo(false); setMode('guided'); setHints(1); if (attemptId.current) updateAttempt(attemptId.current, { autonomous: false, hintsUsed: 1 }); }}>Ouvrir l'aide 1</button><button type="button" className="btn ghost" onClick={() => setAskSolo(false)}>Je continue seul</button></div>
            </div>
          )}
          <ol className="hints">
            {ex.hints.map((h, i) => (
              <li key={i}>
                {hints > i ? (
                  <div className="hint open">
                    <p className="hint-title">{i + 1}. {HINT_TITLES[i]}</p>
                    {i === 3 ? <CodeView code={h} /> : <p><Rich text={h} /></p>}
                  </div>
                ) : (
                  <button type="button" className="btn ghost small" disabled={hints < i} onClick={() => openHint(i + 1)}>
                    {i + 1}. {HINT_TITLES[i]}
                  </button>
                )}
              </li>
            ))}
            <li>
              {solution ? (
                <div className="hint open">
                  <p className="hint-title">5. Solution commentée</p>
                  <CodeView code={ex.solution} />
                  <Blocks blocks={ex.solutionNotes} />
                </div>
              ) : (
                <button type="button" className="btn ghost small" disabled={hints < 4 && mode === 'solo'} onClick={openSolution}>
                  5. Solution commentée
                </button>
              )}
            </li>
          </ol>
          {(hints > 0 || solution || report) && (
            <>
              <h3>Erreurs fréquentes</h3>
              <ul className="list">{ex.pitfalls.map((p, i) => <li key={i}><Rich text={p} /></li>)}</ul>
            </>
          )}
        </section>

        <section className="ex-work" aria-label="Ton code">
          <Editor value={code} onChange={onChange} label={`Code de ${ex.file}`} />
          <div className="row gap wrap toolbar">
            <button type="button" className="btn primary" onClick={run} disabled={!!running}>
              {running ?? 'Compiler et tester'}
            </button>
            {!confirmReset ? (
              <button type="button" className="btn ghost" onClick={() => setConfirmReset(true)}>Réinitialiser</button>
            ) : (
              <span className="confirm">
                Effacer ton code et revenir au squelette ?
                <button type="button" className="btn danger small" onClick={() => { setCode(ex.starter); clearDraft(id); setConfirmReset(false); }}>Oui, effacer</button>
                <button type="button" className="btn ghost small" onClick={() => setConfirmReset(false)}>Annuler</button>
              </span>
            )}
            <span className="muted small">Brouillon sauvegardé automatiquement</span>
          </div>
          <EngineNotice />
          {report && <RunResults report={report} />}
          {passedAll && (
            <div className="panel ok">
              <p><strong>Tous les tests passent.</strong> {autonomous ? 'Réussi seul : ça compte pleinement.' : 'Réussi avec aide : refais-le seul plus tard pour le valider.'}</p>
              <div className="row gap wrap">
                {similar.map((s) => <button key={s.id} type="button" className="btn" onClick={() => navigate({ page: 'exercise', id: s.id, mode: 'solo' })}>Exercice voisin : {s.title}</button>)}
              </div>
            </div>
          )}
          {report && !passedAll && report.compiled && lesson && (
            <p className="small">Bloqué ? Relis <button type="button" className="link-btn" onClick={() => navigate({ page: 'lesson', id: lesson.id })}>le cours « {lesson.title} »</button> ou ouvre l'aide suivante.</p>
          )}
          {ex.kind === 'program' && <Terminal file={ex.file} code={code} extraFiles={ex.tests.find((t) => t.files)?.files} />}
        </section>
      </div>
    </div>
  );
}

export function EngineNotice() {
  const [state, setState] = useState(cRunner.state);
  useEffect(() => {
    const off = cRunner.onState(setState);
    return () => {
      off();
    };
  }, []);
  useEffect(() => {
    void cRunner.init();
  }, []);
  if (state === 'unavailable') {
    return (
      <div className="panel warn" role="status">
        <p><strong>Exécution du C indisponible ici</strong> ({cRunner.unavailableReason}). Le site reste utilisable, mais ton code ne sera ni compilé ni testé.</p>
        <p>Teste sur ta machine : <code className="ic">gcc -Wall -Wextra *.c -o test && ./test | cat -e</code></p>
      </div>
    );
  }
  if (state === 'loading') return <p className="muted small" role="status">Démarrage du compilateur C…</p>;
  return null;
}

export function Terminal({ file, code, extraFiles }: { file: string; code: string; extraFiles?: Record<string, string> }) {
  const [args, setArgs] = useState('');
  const [stdin, setStdin] = useState('');
  const [out, setOut] = useState<null | { text: string; err: string; code: number | null; note?: string }>(null);
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const r = await freeRun({ [file]: code }, parseArgs(args), stdin, extraFiles);
    setBusy(false);
    if (!r.compiled) setOut({ text: '', err: r.compileOutput, code: null, note: 'Ne compile pas.' });
    else {
      const run = r.run!;
      setOut({
        text: run.stdout,
        err: run.stderr,
        code: run.status === 'ok' ? run.exitCode : null,
        note: run.status === 'timeout' ? run.message : run.status === 'trap' ? trapMessage(run.message) : r.compileOutput ? 'Compilé avec des avertissements.' : undefined,
      });
    }
  }
  return (
    <details className="terminal card">
      <summary>Lancer avec mes propres arguments</summary>
      <label className="term-line">
        <span className="mono">$ ./a.out</span>
        <input type="text" value={args} onChange={(e) => setArgs(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} placeholder='arg1 "un argument avec espaces"' spellCheck={false} />
      </label>
      <label className="stdin">
        <span className="small muted">Entrée standard (facultatif)</span>
        <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={2} spellCheck={false} />
      </label>
      {extraFiles && <p className="small muted">Fichiers simulés disponibles : {Object.keys(extraFiles).join(', ')}</p>}
      <button type="button" className="btn" onClick={go} disabled={busy}>{busy ? 'Exécution…' : 'Exécuter'}</button>
      {out && (
        <div className="term-out">
          {out.note && <p className="reason">{out.note}</p>}
          <p className="io-label">Sortie (cat -e)</p>
          <pre className="io">{catE(out.text) || '(rien)'}</pre>
          {out.err && <><p className="io-label">Sortie d'erreur</p><pre className="io io-err">{out.err}</pre></>}
          {out.code !== null && <p className="small">echo $? → {out.code}</p>}
        </div>
      )}
    </details>
  );
}
