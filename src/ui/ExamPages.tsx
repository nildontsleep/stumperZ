import { useEffect, useRef, useState } from 'react';
import { EXAMS, exam as getExam } from '../content/exams';
import { exercise } from '../content/exercises';
import { skill } from '../content/skills';
import { lessonForSkill } from '../content/lessons';
import type { SkillId } from '../content/types';
import { getState, recordAttempt, updateExam, useStore, useVersion } from '../app/store';
import { navigate } from '../app/router';
import { runExamTests, type RunReport } from '../engine/run';
import { examRatio } from '../engine/scoring';
import type { ExamAttempt } from '../engine/state';
import { Editor } from './Editor';
import { EngineNotice, Terminal } from './ExercisePage';
import { Blocks, CodeView, pct } from './text';
import { RunResults } from './RunResults';
import { startExamFlow } from './MainPages';

function fmtClock(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function ExamsPage() {
  useVersion();
  const st = getState();
  const running = st.exams.find((e) => e.status === 'running');
  const history = [...st.exams].filter((e) => e.status !== 'running').sort((a, b) => b.startedAt - a.startedAt);
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <div className="page">
      <header className="page-head">
        <h1>Mode stumper<span className="cursor">_</span></h1>
        <p className="lead">Une heure, un sujet en plusieurs étapes, aucune aide visible. Ces sujets sont des <strong>simulations de compétences</strong> écrites à partir des PDF : personne ne connaît le sujet de demain.</p>
      </header>
      {running && (
        <div className="panel warn">
          <p>Une simulation est en cours ({getExam(running.examId)!.title}).</p>
          <button type="button" className="btn primary" onClick={() => navigate({ page: 'exam', attemptId: running.id })}>Reprendre</button>
        </div>
      )}
      <section className="card">
        <h2>Conditions</h2>
        <ul className="list">
          <li>Chronomètre de 60 minutes, qui continue si tu recharges ou fermes la page.</li>
          <li>Tu peux compiler et lancer ton programme avec tes propres arguments, comme avec gcc dans un terminal.</li>
          <li>Les tests de correction sont cachés : ils ne tournent qu'à la fin.</li>
          <li>Pas d'indice ni de correction pendant la tentative. Sortir avant la fin est possible, mais la tentative compte alors comme interrompue (aidée).</li>
          <li>Travaille d'abord sur feuille 2 minutes : lis tout, repère les formats de sortie.</li>
        </ul>
      </section>
      <div className="grid cards-2">
        {EXAMS.map((e) => {
          const tries = st.exams.filter((x) => x.examId === e.id && x.status !== 'running');
          const best = tries.length ? Math.max(...tries.map(examRatio)) : null;
          return (
            <section key={e.id} className="card exam-card">
              <h3 className="mono">{e.binary}</h3>
              <p className="small muted">{e.steps.length} étapes · {e.steps.reduce((s, x) => s + x.points, 0)} points · notions : {[...new Set(e.steps.flatMap((s) => s.skills))].slice(0, 5).map((s) => skill(s).title).join(', ')}</p>
              {best !== null && <p className="small">Meilleur score : {pct(best)} ({tries.length} tentative{tries.length > 1 ? 's' : ''})</p>}
              {confirm === e.id ? (
                <div className="row gap wrap">
                  <span className="small">Le chrono démarre tout de suite (60 min).</span>
                  <button type="button" className="btn primary" disabled={!!running} onClick={() => startExamFlow(e.id)}>Démarrer</button>
                  <button type="button" className="btn ghost" onClick={() => setConfirm(null)}>Annuler</button>
                </div>
              ) : (
                <button type="button" className="btn" disabled={!!running} onClick={() => setConfirm(e.id)}>Commencer ce sujet</button>
              )}
            </section>
          );
        })}
      </div>
      {history.length > 0 && (
        <section>
          <h2>Historique</h2>
          <ul className="recent">
            {history.map((h) => (
              <li key={h.id}>
                <button type="button" className="link-btn" onClick={() => navigate({ page: 'examResult', attemptId: h.id })}>{getExam(h.examId)!.title}</button>
                <span className="muted small">{new Date(h.startedAt).toLocaleString('fr-FR')} · {h.verified ? pct(examRatio(h)) : 'non vérifié'} · {h.aided ? 'interrompue / aidée' : h.status === 'timeout' ? 'temps écoulé' : 'rendue'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export async function finishExam(att: ExamAttempt, status: ExamAttempt['status'], aided: boolean) {
  const ex = getExam(att.examId)!;
  const report: RunReport = await runExamTests(ex, att.code);
  const verified = !report.engineUnavailable;
  let k = 0;
  const steps = ex.steps.map((s) => {
    const res = report.results.slice(k, k + s.tests.length);
    k += s.tests.length;
    const passed = report.compiled ? res.filter((r) => r.pass).length : 0;
    const ruleOk = report.staticIssues.length === 0;
    const earned = Math.round((s.points * passed) / s.tests.length * (ruleOk ? 1 : 0.5) * 10) / 10;
    return { passed, total: s.tests.length, points: s.points, earned };
  });
  updateExam(att.id, {
    status, aided, endedAt: Date.now(), steps: verified ? steps : undefined, verified, compileError: report.compiled ? undefined : report.compileOutput,
  });
  if (verified) {
    ex.steps.forEach((s, i) => {
      const r = steps[i];
      recordAttempt({
        kind: 'exam', itemId: `${ex.id}#${i}`, skills: s.skills, score: r.passed / r.total, correct: r.passed === r.total, autonomous: !aided,
        hintsUsed: 0, solutionViewed: aided, verified: true, level: 3, context: 'exam',
        details: { passed: r.passed, total: r.total, compileError: !report.compiled, failedKinds: [...new Set(report.results.filter((x) => !x.pass).map((x) => x.test.kind ?? 'normal'))] },
      });
    });
  }
  return report;
}

export function ExamRun({ attemptId }: { attemptId: string }) {
  const att = useStore((s) => s.exams.find((e) => e.id === attemptId));
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState<null | 'submit' | 'quit'>(null);
  const [busy, setBusy] = useState(false);
  const finishing = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (att && att.status === 'running' && now >= att.deadline && !finishing.current) {
      finishing.current = true;
      setBusy(true);
      void finishExam(att, 'timeout', false).then(() => navigate({ page: 'examResult', attemptId: att.id }));
    }
  }, [now, att]);

  if (!att) return <p>Tentative introuvable.</p>;
  if (att.status !== 'running') {
    return (
      <div className="page"><p>Cette tentative est terminée.</p><button type="button" className="btn" onClick={() => navigate({ page: 'examResult', attemptId: att.id })}>Voir le bilan</button></div>
    );
  }
  const ex = getExam(att.examId)!;
  const left = att.deadline - now;

  async function end(kind: 'submit' | 'quit') {
    finishing.current = true;
    setBusy(true);
    await finishExam(getState().exams.find((e) => e.id === attemptId)!, kind === 'submit' ? 'finished' : 'abandoned', kind === 'quit');
    navigate({ page: 'examResult', attemptId });
  }

  return (
    <div className="page exam-run">
      <div className={`exam-bar ${left < 5 * 60000 ? 'urgent' : ''}`} role="timer" aria-live={left < 60000 ? 'assertive' : 'off'}>
        <span className="mono exam-name">{ex.binary}</span>
        <span className="exam-clock" aria-label={`Temps restant ${fmtClock(left)}`}>{fmtClock(left)}</span>
        {confirm ? (
          <span className="confirm">
            {confirm === 'submit' ? 'Rendre maintenant ? Les tests cachés vont tourner.' : 'Abandonner ? La tentative comptera comme interrompue, et la correction deviendra visible.'}
            <button type="button" className="btn small primary" disabled={busy} onClick={() => end(confirm)}>{busy ? 'Correction…' : 'Confirmer'}</button>
            <button type="button" className="btn small ghost" onClick={() => setConfirm(null)}>Annuler</button>
          </span>
        ) : (
          <span className="row gap">
            <button type="button" className="btn small primary" onClick={() => setConfirm('submit')}>Rendre</button>
            <button type="button" className="btn small ghost" onClick={() => setConfirm('quit')}>Abandonner</button>
          </span>
        )}
      </div>
      {busy && <p role="status" className="panel">Correction en cours…</p>}
      <div className="ex-layout">
        <section className="card ex-statement" aria-label="Sujet">
          <h1 className="mono">{ex.binary}</h1>
          <Blocks blocks={ex.intro} />
          <h2>Règles</h2>
          <ul className="list">{ex.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
          {ex.steps.map((s, i) => (
            <section key={i} className="exam-step">
              <h2>Étape {i + 1} · {s.title} <small className="muted">({s.points} pts)</small></h2>
              <Blocks blocks={s.statement} />
            </section>
          ))}
        </section>
        <section className="ex-work" aria-label="Ton code">
          <p className="small muted">Fichier : <code className="ic">{ex.file}</code> · sauvegarde automatique</p>
          <Editor value={att.code} onChange={(v) => updateExam(att.id, { code: v })} label={`Code de ${ex.file}`} minHeight={420} />
          <EngineNotice />
          <Terminal file={ex.file} code={att.code} />
          <p className="small muted">Astuce : teste les erreurs (aucun argument, mauvaise option) et regarde le code de sortie avec « echo $? ».</p>
        </section>
      </div>
    </div>
  );
}

export function ExamResult({ attemptId }: { attemptId: string }) {
  useVersion();
  const att = getState().exams.find((e) => e.id === attemptId);
  const [shown, setShown] = useState(0);
  const [report, setReport] = useState<RunReport | null>(null);
  const [selfEval, setSelfEval] = useState<boolean[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  if (!att) return <p>Tentative introuvable.</p>;
  const ex = getExam(att.examId)!;
  const total = ex.steps.reduce((s, x) => s + x.points, 0);
  const earned = att.steps?.reduce((s, x) => s + x.earned, 0) ?? 0;
  const failedSkills = [...new Set(ex.steps.flatMap((s, i) => (att.steps && att.steps[i].passed < att.steps[i].total ? s.skills : [])))] as SkillId[];
  return (
    <div className="page">
      <header className="page-head">
        <button type="button" className="link-btn" onClick={() => navigate({ page: 'exams' })}>← Mode stumper</button>
        <h1>Bilan · {ex.binary}<span className="cursor">_</span></h1>
        <p className="muted">
          {att.status === 'timeout' ? 'Temps écoulé : rendu automatique.' : att.status === 'abandoned' ? 'Tentative interrompue : elle compte comme aidée.' : 'Rendu avant la fin.'}{' '}
          Durée : {fmtClock((att.endedAt ?? att.deadline) - att.startedAt)}.
        </p>
      </header>
      {att.verified ? (
        <section className="card">
          <p className="kpi-value">{earned} / {total} points <small className="muted">({pct(examRatio(att))})</small></p>
          <p className="small">Résultats vérifiés : ton code a été compilé et exécuté sur les tests cachés.</p>
          {att.compileError && (
            <div className="panel bad"><p><strong>Le code rendu ne compile pas : 0 à toutes les étapes.</strong> Garde toujours une version qui compile.</p><pre className="io io-err">{att.compileError}</pre></div>
          )}
          <table className="tasks">
            <thead><tr><th>Étape</th><th>Tests</th><th>Points</th><th>État</th></tr></thead>
            <tbody>
              {ex.steps.map((s, i) => {
                const r = att.steps![i];
                return (
                  <tr key={i}>
                    <td>{i + 1}. {s.title}</td>
                    <td>{r.passed} / {r.total}</td>
                    <td>{r.earned} / {r.points}</td>
                    <td>{r.passed === r.total ? <span className="tag tag-ok">réussi</span> : r.passed > 0 ? <span className="tag">incomplet</span> : <span className="tag tag-bad">non fait / faux</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="card">
          <div className="panel warn"><p><strong>Non vérifié :</strong> le compilateur n'était pas disponible, ton code n'a pas été exécuté. Ce qui suit est une autoévaluation, elle ne compte pas dans la préparation.</p></div>
          {ex.steps.map((s, i) => (
            <label key={i} className="option">
              <input type="checkbox" checked={!!selfEval[i]} onChange={() => setSelfEval((v) => { const n = [...v]; n[i] = !n[i]; return n; })} />
              <span>Étape {i + 1} ({s.title}) : je pense l'avoir réussie (autoévalué)</span>
            </label>
          ))}
        </section>
      )}

      {failedSkills.length > 0 && (
        <section className="card">
          <h2>Notions responsables des blocages</h2>
          <div className="row gap wrap">{failedSkills.map((s) => <button key={s} type="button" className="pill pill-bad as-btn" onClick={() => navigate({ page: 'lesson', id: lessonForSkill(s)!.id })}>{skill(s).title}</button>)}</div>
        </section>
      )}

      {att.verified && !att.compileError && (
        <section className="card">
          <h2>Erreurs observées</h2>
          {report ? <RunResults report={report} /> : <button type="button" className="btn" onClick={async () => setReport(await runExamTests(ex, att.code))}>Afficher le détail des tests</button>}
        </section>
      )}

      <section className="card">
        <h2>Correction progressive</h2>
        <p className="small muted">Une étape à la fois : lis l'explication, puis essaie de corriger ton code avant de passer à la suivante.</p>
        {ex.correction.slice(0, shown).map((c) => (
          <div key={c.step} className="exam-step">
            <h3>Étape {c.step + 1} · {ex.steps[c.step].title}</h3>
            <Blocks blocks={c.blocks} />
          </div>
        ))}
        {shown < ex.correction.length && <button type="button" className="btn" onClick={() => setShown(shown + 1)}>Voir la correction de l'étape {shown + 1}</button>}
        {shown >= ex.correction.length && (showSolution ? <CodeView code={ex.solution} caption="Une solution complète possible" /> : <button type="button" className="btn ghost" onClick={() => setShowSolution(true)}>Voir une solution complète</button>)}
      </section>

      <section className="card">
        <h2>À refaire ensuite</h2>
        <div className="row gap wrap">
          {ex.followUp.map((id) => <button key={id} type="button" className="btn" onClick={() => navigate({ page: 'exercise', id, mode: 'solo', from: 'review' })}>{exercise(id)!.title}</button>)}
        </div>
        <p className="small muted">Puis retente une autre simulation : {EXAMS.filter((e) => e.id !== ex.id).map((e) => e.binary).join(', ')}.</p>
        <details>
          <summary>Ton code rendu</summary>
          <CodeView code={att.code} />
        </details>
      </section>
    </div>
  );
}
