import { useMemo, useState } from 'react';
import { DIAGNOSTIC } from '../content/diagnostic';
import { quiz as getQuiz } from '../content/quizzes';
import { exercise } from '../content/exercises';
import { lesson as getLesson, LESSONS, lessonForSkill } from '../content/lessons';
import { SKILLS, skill } from '../content/skills';
import { PDF_DAYS } from '../content/pdf';
import { exam as getExam } from '../content/exams';
import type { SkillId } from '../content/types';
import { getState, getDrafts, markPlanDone, recordAttempt, saveDraft, setDiagnostic, setPrefs, startExam, useStore, useVersion } from '../app/store';
import { navigate } from '../app/router';
import { buildPlan, planItemDone, type PlanItem } from '../engine/planner';
import { readiness, skillScores, coverage, contentProgress, recurringErrors } from '../engine/scoring';
import { todayKey, type DiagnosticResult } from '../engine/state';
import { runExercise, type RunReport } from '../engine/run';
import { QuizCard } from './Quiz';
import { Editor } from './Editor';
import { RunResults } from './RunResults';
import { Blocks, fmtMinutes, pct } from './text';
import { EngineNotice } from './ExercisePage';

// ------------------------------------------------------------------ helpers

export function openPlanItem(it: PlanItem) {
  switch (it.type) {
    case 'diagnostic':
      return navigate({ page: 'diagnostic' });
    case 'lesson':
      return navigate({ page: 'lesson', id: it.id });
    case 'exercise':
      return navigate({ page: 'exercise', id: it.id, mode: it.mode, from: 'plan' });
    case 'quiz':
      return navigate({ page: 'quiz', ids: it.ids, title: `Vérification : ${skill(it.skill).title}`, context: 'practice' });
    case 'exam': {
      const running = getState().exams.find((e) => e.status === 'running');
      if (running) return navigate({ page: 'exam', attemptId: running.id });
      return navigate({ page: 'exams' });
    }
  }
}

export function planItemLabel(it: PlanItem) {
  switch (it.type) {
    case 'diagnostic':
      return 'Diagnostic de départ';
    case 'lesson':
      return `Cours : ${getLesson(it.id)!.title}`;
    case 'exercise':
      return `${it.mode === 'solo' ? 'Exercice seul' : 'Exercice accompagné'} : ${exercise(it.id)!.title}`;
    case 'quiz':
      return `Questions : ${skill(it.skill).title}`;
    case 'exam':
      return `Simulation d'1 h : ${getExam(it.id)!.title}`;
  }
}

const TYPE_ICON: Record<PlanItem['type'], string> = { diagnostic: 'D', lesson: 'C', exercise: '{}', quiz: '?', exam: '1h' };

export function BudgetPicker() {
  const budget = useStore((s) => s.prefs.budget);
  const presets = [30, 60, 120, 240];
  const [custom, setCustom] = useState(presets.includes(budget) ? '' : String(budget));
  return (
    <div className="budget" role="group" aria-label="Temps disponible">
      <span className="budget-label">Temps disponible</span>
      {presets.map((p) => (
        <button key={p} type="button" className={`chip ${budget === p ? 'on' : ''}`} aria-pressed={budget === p} onClick={() => { setPrefs({ budget: p }); setCustom(''); }}>
          {fmtMinutes(p)}
        </button>
      ))}
      <label className="chip custom">
        <span className="sr-only">Durée personnalisée en minutes</span>
        <input
          type="number"
          min={10}
          max={600}
          inputMode="numeric"
          placeholder="autre (min)"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            const n = parseInt(e.target.value, 10);
            if (n >= 10 && n <= 600) setPrefs({ budget: n });
          }}
        />
      </label>
    </div>
  );
}

function PlanList({ items, limit }: { items: PlanItem[]; limit?: number }) {
  const st = getState();
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <ol className="plan">
      {shown.map((it) => {
        const done = planItemDone(st, it);
        return (
          <li key={it.key} className={done ? 'done' : ''}>
            <span className={`plan-ico t-${it.type}`} aria-hidden="true">{TYPE_ICON[it.type]}</span>
            <div className="plan-body">
              <button type="button" className="plan-title link-btn" onClick={() => openPlanItem(it)}>{planItemLabel(it)}</button>
              <span className="small muted">{fmtMinutes(it.minutes)} · {it.reason}</span>
            </div>
            {done ? <span className="tag tag-ok">fait</span> : (
              <button type="button" className="btn ghost small" onClick={() => markPlanDone(it.key)} aria-label={`Marquer « ${planItemLabel(it)} » comme fait`}>Fait</button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function nextItem(items: PlanItem[]) {
  const st = getState();
  return items.find((it) => !planItemDone(st, it));
}

// ------------------------------------------------------------------ dashboard

export function Dashboard() {
  useVersion();
  const st = getState();
  const scores = useMemo(() => skillScores(st.attempts), [st.attempts]);
  const ready = readiness(st, scores);
  const cov = coverage(scores);
  const prog = contentProgress(st, LESSONS.length);
  const plan = buildPlan(st, st.prefs.budget);
  const next = nextItem(plan.items);
  const errors = recurringErrors(st.attempts).slice(0, 4);
  const running = st.exams.find((e) => e.status === 'running');
  const today = st.activity[todayKey()] ?? 0;
  const total = Object.values(st.activity).reduce((s, x) => s + x, 0);
  const acquired = SKILLS.filter((s) => scores[s.id].status === 'acquis');
  const toWork = SKILLS.filter((s) => s.stumper >= 2 && (scores[s.id].status === 'fragile' || scores[s.id].status === 'en cours'));
  const recent = [...st.attempts].sort((a, b) => b.ts - a.ts).slice(0, 6);
  const masteryAvg = SKILLS.filter((s) => s.stumper >= 2).reduce((s, x) => s + scores[x.id].mastery, 0) / SKILLS.filter((s) => s.stumper >= 2).length;

  return (
    <div className="page dashboard">
      <section className="hero">
        <p className="eyebrow">Stumper demain · révision de ce soir</p>
        {running ? (
          <>
            <h1>Une simulation est en cours<span className="cursor">_</span></h1>
            <p className="lead">Le chronomètre continue même si tu fermes la page.</p>
            <button type="button" className="btn primary xl" onClick={() => navigate({ page: 'exam', attemptId: running.id })}>Reprendre la simulation</button>
          </>
        ) : next ? (
          <>
            <h1>{st.attempts.length === 0 && !st.diagnostic ? 'On commence par un diagnostic de 15 min' : 'Prochaine étape'}<span className="cursor">_</span></h1>
            <p className="lead">{planItemLabel(next)} — {next.reason}</p>
            <button type="button" className="btn primary xl" onClick={() => openPlanItem(next)}>Continuer ma révision</button>
          </>
        ) : (
          <>
            <h1>Parcours du jour terminé<span className="cursor">_</span></h1>
            <p className="lead">Enchaîne une simulation d'examen ou une session sur tes points faibles.</p>
            <div className="row gap wrap">
              <button type="button" className="btn primary xl" onClick={() => navigate({ page: 'exams' })}>Simulation d'1 h</button>
              <button type="button" className="btn xl" onClick={() => navigate({ page: 'review' })}>10 min points faibles</button>
            </div>
          </>
        )}
        <BudgetPicker />
      </section>

      <section className="kpis" aria-label="Indicateurs">
        <button type="button" className="kpi card" onClick={() => navigate({ page: 'stats' })}>
          <span className="kpi-label">Préparation estimée</span>
          <span className="kpi-value">{pct(ready.value)}</span>
          <span className="kpi-sub">{ready.provisional ? 'estimation provisoire' : 'à un exercice autonome d\'1 h'}</span>
          <span className="meter"><span style={{ width: `${Math.round((ready.value) * 100)}%` }} /></span>
        </button>
        <div className="kpi card">
          <span className="kpi-label">Maîtrise des notions clés</span>
          <span className="kpi-value">{pct(masteryAvg)}</span>
          <span className="kpi-sub">{acquired.length} notion(s) acquise(s)</span>
          <span className="meter"><span style={{ width: `${Math.round((masteryAvg) * 100)}%` }} /></span>
        </div>
        <div className="kpi card">
          <span className="kpi-label">Couverture de l'évaluation</span>
          <span className="kpi-value">{pct(cov)}</span>
          <span className="kpi-sub">des notions clés réellement testées</span>
          <span className="meter"><span style={{ width: `${Math.round((cov) * 100)}%` }} /></span>
        </div>
        <div className="kpi card">
          <span className="kpi-label">Temps de travail actif</span>
          <span className="kpi-value">{fmtMinutes(today / 60)}</span>
          <span className="kpi-sub">aujourd'hui · {fmtMinutes(total / 60)} au total</span>
        </div>
      </section>

      <div className="dash-grid">
        <section className="card">
          <div className="row between"><h2>Parcours prioritaire</h2><button type="button" className="link-btn" onClick={() => navigate({ page: 'plan' })}>Tout voir →</button></div>
          <p className="small muted">{plan.note} Total : {fmtMinutes(plan.total)} sur {fmtMinutes(st.prefs.budget)}.</p>
          <PlanList items={plan.items} limit={6} />
        </section>

        <section className="card">
          <h2>Compétences</h2>
          <p className="small muted">Acquises</p>
          <div className="row gap wrap">{acquired.length ? acquired.map((s) => <span key={s.id} className="pill pill-ok">{s.title}</span>) : <span className="muted small">aucune pour l'instant (il faut des exercices réussis seul)</span>}</div>
          <p className="small muted">À retravailler</p>
          <div className="row gap wrap">{toWork.length ? toWork.map((s) => <button key={s.id} type="button" className={`pill pill-${scores[s.id].status === 'fragile' ? 'bad' : 'mid'} as-btn`} onClick={() => navigate({ page: 'lesson', id: lessonForSkill(s.id)!.id })}>{s.title}</button>) : <span className="muted small">rien de signalé</span>}</div>
          <p className="small muted">Non évaluées : {SKILLS.filter((s) => s.stumper >= 2 && scores[s.id].status === 'non évalué').length} notion(s) clé(s)</p>
        </section>

        <section className="card">
          <h2>Progression par jour</h2>
          <DayProgress />
          <p className="small muted">Contenus : {pct(prog.lessons)} des cours lus · {pct(prog.exercisesSolved)} des exercices réussis</p>
        </section>

        <section className="card">
          <h2>Erreurs récurrentes</h2>
          {errors.length ? (
            <ul className="errors-list">{errors.map((e) => <li key={e.key}><span className="count">{e.count}×</span> {e.label} <span className="muted small">({e.skills.map((s) => skill(s).title).join(', ')})</span></li>)}</ul>
          ) : <p className="muted small">Pas encore d'erreur enregistrée.</p>}
          <button type="button" className="btn small" onClick={() => navigate({ page: 'review' })}>Réviser mes erreurs</button>
        </section>

        <section className="card span-2">
          <h2>Derniers résultats</h2>
          {recent.length ? (
            <ul className="recent">
              {recent.map((a) => (
                <li key={a.id}>
                  <span className={`dot ${a.correct ? 'ok' : 'bad'}`} aria-hidden="true" />
                  <span>{a.kind === 'code' ? exercise(a.itemId)?.title ?? a.itemId : getQuiz(a.itemId) ? 'Question · ' + skill(a.skills[0]).title : a.itemId}</span>
                  <span className="muted small">{a.kind === 'code' ? `${a.details?.passed ?? 0}/${a.details?.total ?? 0} tests` : a.correct ? 'juste' : a.dontKnow ? 'je ne sais pas' : 'faux'}{a.kind === 'code' ? (a.autonomous ? ' · seul' : ' · aidé') : ''}</span>
                </li>
              ))}
            </ul>
          ) : <p className="muted small">Aucun résultat : lance le diagnostic.</p>}
        </section>
      </div>
    </div>
  );
}

function DayProgress() {
  const st = getState();
  return (
    <ul className="dayprog">
      {PDF_DAYS.map((d) => {
        const ids = d.tasks.map((t) => t.exercise).filter(Boolean) as string[];
        const ok = ids.filter((id) => st.attempts.some((a) => a.itemId === id && a.correct)).length;
        const ratio = ids.length ? ok / ids.length : 0;
        return (
          <li key={d.id}>
            <button type="button" className="dayprog-btn" onClick={() => navigate({ page: 'day', id: d.id })} aria-label={`${d.title} : ${ok} sur ${ids.length}`}>
              <span className="dayprog-n">{d.title.replace('Day ', 'J')}</span>
              <span className="meter thin"><span style={{ width: `${ratio * 100}%` }} /></span>
              <span className="small muted">{ids.length ? `${ok}/${ids.length}` : 'shell'}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ------------------------------------------------------------------ plan

export function PlanPage() {
  useVersion();
  const st = getState();
  const plan = buildPlan(st, st.prefs.budget);
  return (
    <div className="page">
      <header className="page-head">
        <h1>Priorité : stumper demain<span className="cursor">_</span></h1>
        <p className="lead">Un parcours court, réorganisé selon ton temps, tes résultats et les dépendances entre notions. Les exercices « seul » sont ceux qui comptent pour la préparation.</p>
        <BudgetPicker />
      </header>
      <p className="muted">{plan.note} Total prévu : {fmtMinutes(plan.total)}.</p>
      <PlanList items={plan.items} />
      <section className="card">
        <h2>Et après le stumper ?</h2>
        <p>Le parcours « Rattraper la piscine » reprend tout, jour par jour, du Day 01 au Day 12.</p>
        <button type="button" className="btn" onClick={() => navigate({ page: 'days' })}>Rattraper la piscine</button>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ diagnostic

type Answer = DiagnosticResult['answers'][number];

export function DiagnosticPage() {
  const existing = useStore((s) => s.diagnostic);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [idx, setIdx] = useState(0);
  const [finished, setFinished] = useState<DiagnosticResult | null>(null);

  const failed = (s: SkillId, list: Answer[]) => list.some((a) => a.skill === s && (a.outcome === 'wrong' || a.outcome === 'dontknow'));

  function advance(list: Answer[], from: number) {
    let i = from;
    const out = [...list];
    while (i < DIAGNOSTIC.length && DIAGNOSTIC[i].requires.some((r) => failed(r, out))) {
      out.push({ item: DIAGNOSTIC[i].quiz, skill: DIAGNOSTIC[i].skill, outcome: 'skipped' });
      i++;
    }
    setAnswers(out);
    setIdx(i);
    if (i >= DIAGNOSTIC.length) {
      const res = { completedAt: Date.now(), answers: out };
      setDiagnostic(res);
      setFinished(res);
    }
  }

  if (!started && !finished) {
    return (
      <div className="page">
        <header className="page-head">
          <h1>Diagnostic<span className="cursor">_</span></h1>
          <p className="lead">10 à 15 minutes, {DIAGNOSTIC.length} questions au plus. Ça commence facile. Si une base manque, les questions qui en dépendent sont sautées : pas la peine de deviner.</p>
        </header>
        <ul className="list">
          <li>« Je ne sais pas » est une bonne réponse : elle indique précisément quoi revoir.</li>
          <li>Il y a des questions de compréhension, des programmes à lire, des sorties à prédire, des bugs à trouver, et un petit code à écrire.</li>
          <li>Le résultat donne un point de départ et un parcours pour demain.</li>
        </ul>
        {existing && <p className="muted small">Déjà passé le {new Date(existing.completedAt).toLocaleString('fr-FR')}. Le refaire remplace l'ancien résultat (tes réponses restent dans l'historique).</p>}
        <button type="button" className="btn primary xl" onClick={() => { setStarted(true); advance([], 0); }}>Commencer</button>
        {existing && <DiagnosticSummary res={existing} />}
      </div>
    );
  }
  if (finished) {
    return (
      <div className="page">
        <header className="page-head"><h1>Résultat du diagnostic<span className="cursor">_</span></h1></header>
        <DiagnosticSummary res={finished} />
      </div>
    );
  }
  const item = DIAGNOSTIC[idx];
  return (
    <div className="page">
      <header className="page-head">
        <h1>Diagnostic<span className="cursor">_</span></h1>
        <p className="progress-label" aria-live="polite">Étape {idx + 1} / {DIAGNOSTIC.length} · {skill(item.skill).title}</p>
        <span className="meter"><span style={{ width: `${(idx / DIAGNOSTIC.length) * 100}%` }} /></span>
      </header>
      {item.code ? (
        <DiagCode
          id={item.quiz}
          onDone={(ok, skipped) => advance([...answers, { item: item.quiz, skill: item.skill, outcome: skipped ? 'dontknow' : ok ? 'ok' : 'wrong' }], idx + 1)}
        />
      ) : (
        <QuizCard
          key={item.quiz}
          q={getQuiz(item.quiz)!}
          context="diagnostic"
          nextLabel="Suivant"
          onNext={(o) => advance([...answers, { item: item.quiz, skill: item.skill, outcome: o.correct ? 'ok' : o.dontKnow ? 'dontknow' : 'wrong', gap: o.correct ? undefined : getQuiz(item.quiz)!.gap }], idx + 1)}
        />
      )}
    </div>
  );
}

function DiagCode({ id, onDone }: { id: string; onDone: (ok: boolean, skipped: boolean) => void }) {
  const ex = exercise(id)!;
  const [code, setCode] = useState(getDrafts()[id] ?? ex.starter);
  const [report, setReport] = useState<RunReport | null>(null);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    const r = await runExercise(ex, code);
    setBusy(false);
    setReport(r);
    if (r.engineUnavailable) return;
    const ok = r.compiled && r.passed === r.total && r.staticIssues.length === 0;
    recordAttempt({ kind: 'code', itemId: ex.id, skills: ex.skills, score: r.compiled ? r.passed / r.total : 0, correct: ok, autonomous: true, hintsUsed: 0, solutionViewed: false, verified: r.compiled, level: ex.level, context: 'diagnostic', details: { passed: r.passed, total: r.total, compileError: !r.compiled } });
  }
  const ok = report && report.compiled && report.passed === report.total && report.staticIssues.length === 0;
  return (
    <section className="card">
      <h2>Dernière étape : écrire du code (5 min max)</h2>
      <Blocks blocks={ex.statement} />
      <p><code className="ic">{ex.prototype}</code> — fonctions autorisées : aucune (pas besoin).</p>
      <EngineNotice />
      <Editor value={code} onChange={(v) => { setCode(v); saveDraft(id, v); }} label="Code de my_strlen" minHeight={180} />
      <div className="row gap wrap toolbar">
        <button type="button" className="btn primary" onClick={run} disabled={busy}>{busy ? 'Compilation…' : 'Compiler et tester'}</button>
        <button type="button" className="btn ghost" onClick={() => onDone(false, true)}>Je ne sais pas faire</button>
        {report && <button type="button" className="btn" onClick={() => onDone(!!ok, false)}>Terminer le diagnostic</button>}
      </div>
      {report && <RunResults report={report} />}
    </section>
  );
}

function DiagnosticSummary({ res }: { res: DiagnosticResult }) {
  useVersion();
  const st = getState();
  const bySkill = new Map<SkillId, Answer['outcome'][]>();
  for (const a of res.answers) bySkill.set(a.skill, [...(bySkill.get(a.skill) ?? []), a.outcome]);
  const ok: SkillId[] = [];
  const fragile: SkillId[] = [];
  const skipped: SkillId[] = [];
  for (const [s, outs] of bySkill) {
    if (outs.some((o) => o === 'wrong' || o === 'dontknow')) fragile.push(s);
    else if (outs.every((o) => o === 'skipped')) skipped.push(s);
    else ok.push(s);
  }
  const notEvaluated = SKILLS.filter((s) => s.stumper >= 1 && !bySkill.has(s.id)).map((s) => s.id);
  const order = SKILLS.map((s) => s.id);
  const start = [...fragile, ...skipped].sort((a, b) => order.indexOf(a) - order.indexOf(b))[0];
  const plan = buildPlan(st, st.prefs.budget);
  const gaps = res.answers.filter((a) => a.gap).map((a) => a.gap!);
  return (
    <div className="diag-summary">
      <div className="grid cards-3">
        <section className="card"><h3>Bases acquises</h3><p className="small muted">D'après une ou deux questions : à confirmer par un exercice.</p><div className="row gap wrap">{ok.length ? ok.map((s) => <span key={s} className="pill pill-ok">{skill(s).title}</span>) : <span className="muted small">aucune pour l'instant</span>}</div></section>
        <section className="card"><h3>Notions fragiles</h3><div className="row gap wrap">{fragile.length ? fragile.map((s) => <span key={s} className="pill pill-bad">{skill(s).title}</span>) : <span className="muted small">aucune</span>}</div>{gaps.length > 0 && <p className="small">Lacunes repérées : {[...new Set(gaps)].slice(0, 6).map((g) => g.replace(/-/g, ' ')).join(' · ')}</p>}</section>
        <section className="card"><h3>Non évaluées</h3><p className="small muted">Sautées (prérequis fragile) ou hors diagnostic.</p><div className="row gap wrap">{[...skipped, ...notEvaluated].map((s) => <span key={s} className="pill pill-none">{skill(s).title}</span>)}</div></section>
      </div>
      <section className="card">
        <h3>Point de départ conseillé</h3>
        {start ? (
          <p>Commence par <strong>{skill(start).title}</strong> : c'est la première notion fragile dans l'ordre des dépendances, beaucoup d'autres s'appuient dessus.</p>
        ) : <p>Bases solides sur ce diagnostic. Commence par les exercices « seul », puis une simulation d'une heure.</p>}
        {start && <button type="button" className="btn primary" onClick={() => navigate({ page: 'lesson', id: lessonForSkill(start)!.id })}>Ouvrir le cours</button>}
      </section>
      <section className="card">
        <h3>Parcours prioritaire pour demain ({fmtMinutes(st.prefs.budget)})</h3>
        <BudgetPicker />
        <PlanList items={plan.items} limit={8} />
      </section>
    </div>
  );
}

export function startExamFlow(examId: string) {
  const ex = getExam(examId)!;
  const a = startExam(examId, ex.starter, 60);
  navigate({ page: 'exam', attemptId: a.id });
}
