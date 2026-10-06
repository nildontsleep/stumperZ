import { useMemo, useRef, useState } from 'react';
import { EXERCISES, exercise } from '../content/exercises';
import { quiz as getQuiz } from '../content/quizzes';
import { SKILLS, skill } from '../content/skills';
import { LESSONS, lessonForSkill } from '../content/lessons';
import { PDF_DAYS, pdfDay } from '../content/pdf';
import { EXAMS, exam as getExam } from '../content/exams';
import { getDrafts, getState, isStorageOk, replaceAll, resetAll, setPrefs, useStore, useVersion } from '../app/store';
import { navigate, back } from '../app/router';
import { reviewQueue, tenMinuteSession } from '../engine/planner';
import { readiness, skillScores, coverage, contentProgress, recurringErrors, examRatio, METHOD_TEXT } from '../engine/scoring';
import { makeBackup, parseBackup } from '../engine/state';
import { QuizSession } from './Quiz';
import { CodeView, fmtMinutes, pct } from './text';
import type { SkillId } from '../content/types';

export function QuizRoute({ ids, title, context }: { ids: string[]; title: string; context?: 'practice' | 'review' | 'video' }) {
  return (
    <div className="page">
      <header className="page-head">
        <button type="button" className="link-btn" onClick={back}>← Retour</button>
        <h1>{title}<span className="cursor">_</span></h1>
      </header>
      <QuizSession key={ids.join()} ids={ids} context={context ?? 'practice'} title={title} />
    </div>
  );
}

// ------------------------------------------------------------------ review

export function ReviewPage() {
  useVersion();
  const st = getState();
  const queue = reviewQueue(st);
  const [session, setSession] = useState<null | { quizzes: string[]; exercise?: string }>(null);
  return (
    <div className="page">
      <header className="page-head">
        <h1>Révision de mes erreurs<span className="cursor">_</span></h1>
        <p className="lead">Construite à partir de tes erreurs : prérequis qui bloquent, erreurs répétées, difficultés en simulation, notions pas revues depuis longtemps.</p>
      </header>
      <section className="card">
        <h2>10 minutes sur mes points faibles</h2>
        {session ? (
          <>
            <QuizSession ids={session.quizzes} context="review" title="Session points faibles" />
            {session.exercise && (
              <p><button type="button" className="btn primary" onClick={() => navigate({ page: 'exercise', id: session.exercise!, mode: 'solo', from: 'review' })}>Pour finir, un exercice court : {exercise(session.exercise)!.title}</button></p>
            )}
          </>
        ) : (
          <button type="button" className="btn primary" onClick={() => setSession(tenMinuteSession(st))}>Lancer la session (4 questions + 1 exercice court)</button>
        )}
      </section>
      <section>
        <h2>File de révision</h2>
        {queue.length === 0 ? <p className="muted">Rien à réviser pour l'instant : la file se remplit avec tes erreurs.</p> : (
          <ol className="review-queue">
            {queue.slice(0, 8).map((e) => (
              <li key={e.skill} className="card">
                <div className="row between wrap">
                  <h3>{skill(e.skill).title}</h3>
                  <span className="small muted">{e.reasons.join(' · ')}</span>
                </div>
                <ol className="steps">
                  {e.steps.map((s, i) => (
                    <li key={i}>
                      <button type="button" className="link-btn" onClick={() => (s.type === 'quiz' ? navigate({ page: 'quiz', ids: [s.id], title: s.label, context: 'review' }) : navigate({ page: 'exercise', id: s.id, mode: 'solo', from: 'review' }))}>
                        {s.type === 'quiz' ? `Question : ${getQuiz(s.id)?.prompt.replace(/`/g, '').slice(0, 70)}…` : s.label}
                      </button>
                    </li>
                  ))}
                </ol>
                <button type="button" className="btn ghost small" onClick={() => navigate({ page: 'lesson', id: lessonForSkill(e.skill)!.id })}>Fiche / cours</button>
              </li>
            ))}
          </ol>
        )}
      </section>
      <section className="card">
        <h2>Fiches courtes</h2>
        <p>Une page de rappels par notion, à relire juste avant de pratiquer.</p>
        <button type="button" className="btn" onClick={() => navigate({ page: 'cheatsheets' })}>Ouvrir les fiches</button>
      </section>
    </div>
  );
}

const SHEETS: { title: string; skill: SkillId; code: string; points: string[] }[] = [
  { title: 'Squelette de programme', skill: 'structure', code: '#include <unistd.h>\n\nstatic int my_puterr(char const *s)\n{\n    int n = 0;\n\n    while (s[n])\n        n++;\n    write(2, s, n);\n    return 84;\n}\n\nint main(int argc, char **argv)\n{\n    if (argc != 2)\n        return my_puterr("Usage: ./prog ARG\\n");\n    /* ... */\n    return 0;\n}', points: ['Vérifier argc avant argv[1].', 'Erreur : fd 2 + return 84.', 'Compiler : gcc -Wall -Wextra main.c -o prog'] },
  { title: 'Caractères', skill: 'chars', code: "c - '0'          /* '7' -> 7 */\nd + '0'          /* 7 -> '7' */\nc - 'a' + 'A'    /* minuscule -> majuscule */\nc >= 'a' && c <= 'z'", points: ["'\\0' (0) ≠ '0' (48).", "'a' = caractère ; \"a\" = chaîne."] },
  { title: 'Boucles', skill: 'loops', code: 'int i = 0;\n\nwhile (i < n) {   /* n tours : 0 .. n-1 */\n    ...\n    i++;\n}', points: ['Boucle imbriquée : remettre le compteur intérieur à 0.', 'Tester n = 0 et n = 1 à la main.'] },
  { title: 'my_put_nbr', skill: 'putnbr', code: "static void put(long n)\n{\n    if (n >= 10)\n        put(n / 10);\n    my_putchar(n % 10 + '0');\n}\n\nint my_put_nbr(int nb)\n{\n    long n = nb;\n\n    if (n < 0) {\n        my_putchar('-');\n        n = -n;\n    }\n    put(n);\n    return 0;\n}", points: ['long pour INT_MIN.', '0 doit afficher 0.'] },
  { title: 'Chaînes', skill: 'strings', code: "int i = 0;\n\nwhile (str[i] != '\\0') {\n    ... str[i] ...\n    i++;\n}", points: ['Longueur + 1 octet pour le \\0.', 'Littéral "abc" = lecture seule.'] },
  { title: 'Pointeurs', skill: 'pointers', code: 'int x = 7;\nint *p = &x;   /* p = adresse de x */\n*p = 42;       /* x vaut 42 */', points: ['Pour modifier une variable de l\'appelant : passer son adresse.', 'Pour modifier un pointeur de l\'appelant : passer **.'] },
  { title: 'my_getnbr', skill: 'getnbr', code: "while (s[i] == '+' || s[i] == '-')\n    neg = (s[i++] == '-') ? !neg : neg;\nwhile (s[i] >= '0' && s[i] <= '9') {\n    r = r * 10 + (s[i++] - '0');\n    if (r > 2147483647 + (long)neg)\n        return 0;\n}\nreturn neg ? -r : r;", points: ['Vérifier le débordement à chaque chiffre.', 'Arrêt au premier non-chiffre.'] },
  { title: 'malloc', skill: 'malloc', code: 'char *s = malloc(sizeof(char) * (len + 1));\n\nif (s == NULL)\n    return NULL;\n...\nfree(s);', points: ['Tableau de mots : sizeof(char *) * (n + 1).', 'Jamais utiliser après free.'] },
  { title: 'Fichiers', skill: 'fd', code: 'int fd = open(path, O_RDONLY);\nchar buf[30000];\nint n;\n\nif (fd == -1)\n    return 84;\nwhile ((n = read(fd, buf, sizeof(buf))) > 0)\n    write(1, buf, n);\nclose(fd);', points: ['read : >0 données, 0 fin, -1 erreur.', 'errno == EACCES / ENOENT pour le message.'] },
];

export function CheatsheetsPage() {
  return (
    <div className="page">
      <header className="page-head">
        <button type="button" className="link-btn" onClick={back}>← Retour</button>
        <h1>Fiches courtes<span className="cursor">_</span></h1>
        <p className="lead">L'essentiel à avoir en tête. La pratique reste l'activité principale : chaque fiche renvoie vers son cours et ses exercices.</p>
      </header>
      <div className="grid cards-2">
        {SHEETS.map((s) => (
          <section key={s.title} className="card sheet">
            <h2>{s.title}</h2>
            <CodeView code={s.code} />
            <ul className="list">{s.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
            <button type="button" className="btn small" onClick={() => navigate({ page: 'lesson', id: lessonForSkill(s.skill)!.id })}>Cours et exercices</button>
          </section>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ exercises bank

export function ExercisesPage({ initialSkill }: { initialSkill?: string }) {
  useVersion();
  const st = getState();
  const [sk, setSk] = useState(initialSkill ?? '');
  const [day, setDay] = useState('');
  const [status, setStatus] = useState('');
  const list = EXERCISES.filter((e) => (!sk || e.skills.includes(sk as SkillId)) && (!day || e.source?.day === day || (!e.source && SKILLS.find((s) => s.id === e.skills[0])?.days.includes(day as never))))
    .filter((e) => {
      const solved = st.attempts.some((a) => a.itemId === e.id && a.correct);
      const tried = st.attempts.some((a) => a.itemId === e.id);
      if (status === 'todo') return !tried;
      if (status === 'failed') return tried && !solved;
      if (status === 'solved') return solved;
      return true;
    });
  return (
    <div className="page">
      <header className="page-head">
        <h1>Exercices<span className="cursor">_</span></h1>
        <p className="lead">{EXERCISES.length} exercices de code, tous compilés et testés dans le navigateur. Les solutions sont cachées par défaut.</p>
      </header>
      <div className="filters row gap wrap">
        <label>Notion <select value={sk} onChange={(e) => setSk(e.target.value)}><option value="">toutes</option>{SKILLS.filter((s) => EXERCISES.some((e) => e.skills.includes(s.id))).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
        <label>Jour <select value={day} onChange={(e) => setDay(e.target.value)}><option value="">tous</option>{PDF_DAYS.filter((d) => d.language === 'C').map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label>
        <label>État <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">tous</option><option value="todo">jamais essayé</option><option value="failed">essayé, pas réussi</option><option value="solved">réussi</option></select></label>
      </div>
      <div className="grid cards-3">
        {list.map((e) => {
          const solvedAlone = st.attempts.some((a) => a.itemId === e.id && a.correct && a.autonomous && a.verified);
          const solved = st.attempts.some((a) => a.itemId === e.id && a.correct);
          return (
            <button key={e.id} type="button" className="card ex-card" onClick={() => navigate({ page: 'exercise', id: e.id, mode: 'solo' })}>
              <span className="ex-card-title">{e.title}</span>
              <span className="muted small">{e.source ? pdfDay(e.source.day).title + ' · ' : ''}{e.relation === 'reproduces' ? 'tâche du PDF' : e.relation === 'inspired' ? 'inspiré' : 'complément'} · niveau {e.level} · {fmtMinutes(e.minutes)}</span>
              <span className="muted small">{e.skills.map((s) => skill(s).title).join(', ')}</span>
              {solvedAlone ? <span className="tag tag-ok">réussi seul</span> : solved ? <span className="tag">réussi avec aide</span> : null}
            </button>
          );
        })}
      </div>
      {list.length === 0 && <p className="muted">Aucun exercice ne correspond à ces filtres.</p>}
    </div>
  );
}

// ------------------------------------------------------------------ stats

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <p className="muted small">Pas encore assez de points pour une courbe (il faut au moins 2 jours d'activité).</p>;
  const w = 320;
  const h = 80;
  const pts = values.map((v, i) => [10 + (i * (w - 20)) / (values.length - 1), h - 10 - v * (h - 20)] as const);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="spark" role="img" aria-label={`Évolution : de ${pct(values[0])} à ${pct(values[values.length - 1])}`}>
      <line x1="10" x2={w - 10} y1={h - 10} y2={h - 10} className="spark-axis" />
      <line x1="10" x2={w - 10} y1={10} y2={10} className="spark-grid" />
      <path d={`${d} L${pts[pts.length - 1][0]},${h - 10} L${pts[0][0]},${h - 10} Z`} className="spark-area" />
      <path d={d} className="spark-line" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" className="spark-dot" />
    </svg>
  );
}

export function StatsPage() {
  useVersion();
  const st = getState();
  const scores = useMemo(() => skillScores(st.attempts), [st.attempts]);
  const ready = readiness(st, scores);
  const cov = coverage(scores);
  const prog = contentProgress(st, LESSONS.length);
  const errors = recurringErrors(st.attempts).slice(0, 8);
  const codeAttempts = st.attempts.filter((a) => a.kind === 'code');
  const alone = codeAttempts.filter((a) => a.autonomous);
  const aided = codeAttempts.filter((a) => !a.autonomous);
  // readiness over time: recompute at the end of each active day
  const days = [...new Set(st.attempts.map((a) => new Date(a.ts).toDateString()))]
    .map((d) => new Date(d).getTime() + 86399999)
    .sort((a, b) => a - b);
  const curve = days.map((t) => readiness({ ...st, attempts: st.attempts.filter((a) => a.ts <= t), exams: st.exams.filter((e) => (e.endedAt ?? 0) <= t) }, skillScores(st.attempts.filter((a) => a.ts <= t), t)).value);
  const validations = [...st.attempts].filter((a) => a.correct && (a.kind === 'code' || a.kind === 'exam') && a.verified).sort((a, b) => b.ts - a.ts).slice(0, 8);
  return (
    <div className="page">
      <header className="page-head">
        <h1>Statistiques<span className="cursor">_</span></h1>
        <p className="lead">Quatre mesures séparées, pour ne pas confondre « j'ai lu » et « je sais faire seul ».</p>
      </header>
      <section className="kpis">
        <div className="kpi card"><span className="kpi-label">Progression dans les contenus</span><span className="kpi-value">{pct(prog.lessons)}</span><span className="kpi-sub">cours lus · {pct(prog.exercisesTried)} des exercices essayés · {prog.examsDone} simulation(s)</span></div>
        <div className="kpi card"><span className="kpi-label">Maîtrise estimée (notions clés)</span><span className="kpi-value">{pct(ready.parts.skills)}</span><span className="kpi-sub">pondérée par l'importance en examen</span></div>
        <div className="kpi card"><span className="kpi-label">Préparation à 1 h en autonomie</span><span className="kpi-value">{pct(ready.value)}</span><span className="kpi-sub">{ready.provisional ? 'estimation provisoire' : 'estimation'} · pas une probabilité de réussite</span></div>
        <div className="kpi card"><span className="kpi-label">Couverture de l'évaluation</span><span className="kpi-value">{pct(cov)}</span><span className="kpi-sub">part des notions clés réellement testées</span></div>
      </section>
      {ready.caps.length > 0 && <div className="panel warn">{ready.caps.map((c, i) => <p key={i}>{c}</p>)}</div>}
      <div className="dash-grid">
        <section className="card">
          <h2>Préparation dans le temps</h2>
          <Sparkline values={curve} />
          <p className="small muted">Composantes actuelles : notions {pct(ready.parts.skills)} · autonomie {pct(ready.parts.autonomy)} · simulations {ready.parts.exam === null ? 'aucune terminée sans aide' : pct(ready.parts.exam)}</p>
        </section>
        <section className="card">
          <h2>Tentatives avec et sans aide</h2>
          <p>Exercices de code : <strong>{alone.length}</strong> tentatives seul (dont {alone.filter((a) => a.correct).length} réussies) · <strong>{aided.length}</strong> avec aide (dont {aided.filter((a) => a.correct).length} réussies).</p>
          <p>Quiz : {st.attempts.filter((a) => a.kind === 'quiz').length} réponses, {pct(st.attempts.filter((a) => a.kind === 'quiz' && a.correct).length / Math.max(1, st.attempts.filter((a) => a.kind === 'quiz').length))} justes.</p>
          <p>Simulations : {st.exams.filter((e) => e.status !== 'running').map((e) => `${getExam(e.examId)!.binary} ${e.verified ? pct(examRatio(e)) : '(non vérifiée)'}${e.aided ? ' aidée' : ''}`).join(' · ') || 'aucune'}</p>
        </section>
      </div>
      <section className="card">
        <h2>Résultats par notion</h2>
        <div className="table-wrap" tabIndex={0}>
          <table className="tasks">
            <thead><tr><th>Notion</th><th>Importance</th><th>Maîtrise</th><th>Preuves</th><th>Code réussi seul</th><th>État</th></tr></thead>
            <tbody>
              {SKILLS.map((s) => {
                const sc = scores[s.id];
                return (
                  <tr key={s.id}>
                    <td><button type="button" className="link-btn" onClick={() => navigate({ page: 'lesson', id: lessonForSkill(s.id)!.id })}>{s.title}</button></td>
                    <td>{'●'.repeat(s.stumper) || '○'}</td>
                    <td><span className="meter inline"><span style={{ width: `${Math.round((sc.mastery) * 100)}%` }} /></span> {pct(sc.mastery)}</td>
                    <td>{sc.evidence.toFixed(1)}</td>
                    <td>{sc.autonomousCode}</td>
                    <td><span className={`pill pill-${sc.status === 'acquis' ? 'ok' : sc.status === 'en cours' ? 'mid' : sc.status === 'fragile' ? 'bad' : 'none'}`}>{sc.status}{sc.status !== 'non évalué' && sc.provisional ? ' · provisoire' : ''}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <div className="dash-grid">
        <section className="card">
          <h2>Erreurs récurrentes</h2>
          {errors.length ? <ul className="errors-list">{errors.map((e) => <li key={e.key}><span className="count">{e.count}×</span> {e.label}</li>)}</ul> : <p className="muted small">Aucune.</p>}
        </section>
        <section className="card">
          <h2>Dernières validations</h2>
          {validations.length ? <ul className="recent">{validations.map((a) => <li key={a.id}><span className="dot ok" aria-hidden="true" />{a.kind === 'exam' ? `Simulation ${a.itemId.split('#')[0].replace('exam_', '')}, étape ${Number(a.itemId.split('#')[1]) + 1}` : exercise(a.itemId)?.title}<span className="muted small">{a.autonomous ? 'seul' : 'aidé'} · {new Date(a.ts).toLocaleString('fr-FR')}</span></li>)}</ul> : <p className="muted small">Aucune validation par compilation pour l'instant.</p>}
        </section>
      </div>
      <section className="card">
        <h2>Compétences à revoir</h2>
        <div className="row gap wrap">{SKILLS.filter((s) => s.stumper >= 2 && scores[s.id].status !== 'acquis').map((s) => <button key={s.id} type="button" className="pill pill-mid as-btn" onClick={() => navigate({ page: 'lesson', id: lessonForSkill(s.id)!.id })}>{s.title}</button>)}</div>
      </section>
      <section className="card method">
        <h2>Comment ces chiffres sont calculés</h2>
        <h3>Maîtrise d'une notion</h3>
        <ul className="list">{METHOD_TEXT.mastery.map((t, i) => <li key={i}>{t}</li>)}</ul>
        <h3>Préparation estimée</h3>
        <ul className="list">{METHOD_TEXT.readiness.map((t, i) => <li key={i}>{t}</li>)}</ul>
        <h3>Temps de travail actif</h3>
        <p>Compté par tranches de 5 secondes, seulement quand l'onglet est visible ET qu'il y a eu une action (clavier, souris, défilement) dans la dernière minute. Un onglet oublié ne compte pas.</p>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ settings

export function SettingsPage() {
  const prefs = useStore((s) => s.prefs);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null);
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function doExport() {
    const json = JSON.stringify(makeBackup(getState(), getDrafts()), null, 1);
    setExportText(json);
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `stumperz-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch {
      /* downloads may be blocked: the text below remains */
    }
    setMsg({ kind: 'ok', text: 'Sauvegarde prête. Si le téléchargement ne démarre pas (certains cadres l\'interdisent), copie le texte ci-dessous dans un fichier.' });
  }
  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportText);
      setMsg({ kind: 'ok', text: 'Sauvegarde copiée dans le presse-papiers.' });
    } catch {
      setMsg({ kind: 'bad', text: 'Copie refusée par le navigateur : sélectionne le texte et copie-le à la main.' });
    }
  }
  async function doImport(text: string) {
    const r = parseBackup(text);
    if (!r.ok) {
      setMsg({ kind: 'bad', text: r.error });
      return;
    }
    await replaceAll(r.backup.state, r.backup.drafts);
    setMsg({ kind: 'ok', text: `Sauvegarde du ${new Date(r.backup.exportedAt).toLocaleString('fr-FR')} restaurée : ${r.backup.state.attempts.length} résultats, ${r.backup.state.exams.length} simulations.` });
    setImportText('');
  }
  return (
    <div className="page">
      <header className="page-head"><h1>Paramètres et sauvegarde<span className="cursor">_</span></h1></header>
      {msg && <div className={`panel ${msg.kind}`} role="status"><p>{msg.text}</p></div>}
      {!isStorageOk() && <div className="panel warn"><p>Le navigateur bloque le stockage local : tes résultats seront perdus à la fermeture. Exporte une sauvegarde régulièrement.</p></div>}
      <section className="card">
        <h2>Affichage</h2>
        <div className="row gap wrap">
          <button type="button" className={`chip ${prefs.theme === 'dark' ? 'on' : ''}`} aria-pressed={prefs.theme === 'dark'} onClick={() => setPrefs({ theme: 'dark' })}>Thème sombre</button>
          <button type="button" className={`chip ${prefs.theme === 'light' ? 'on' : ''}`} aria-pressed={prefs.theme === 'light'} onClick={() => setPrefs({ theme: 'light' })}>Thème clair</button>
          <label className="chip"><input type="checkbox" checked={prefs.embedVideos} onChange={(e) => setPrefs({ embedVideos: e.target.checked })} /> Lecteur vidéo intégré</label>
        </div>
      </section>
      <section className="card">
        <h2>Exporter</h2>
        <p>Tout est enregistré dans ce navigateur (IndexedDB), sans compte. Exporte pour changer d'ordinateur ou garder une copie.</p>
        <button type="button" className="btn primary" onClick={doExport}>Exporter ma sauvegarde</button>
        {exportText && (
          <>
            <textarea className="mono backup" readOnly value={exportText} rows={6} aria-label="Contenu de la sauvegarde" onFocus={(e) => e.currentTarget.select()} />
            <button type="button" className="btn small" onClick={copyExport}>Copier</button>
          </>
        )}
      </section>
      <section className="card">
        <h2>Importer</h2>
        <p>Remplace les données actuelles par celles de la sauvegarde (format et version vérifiés avant).</p>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await doImport(await f.text()); if (fileRef.current) fileRef.current.value = ''; }} aria-label="Fichier de sauvegarde" />
        <textarea className="mono backup" rows={4} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="… ou colle ici le texte d'une sauvegarde" aria-label="Texte de la sauvegarde à importer" />
        <button type="button" className="btn" disabled={!importText.trim()} onClick={() => doImport(importText)}>Importer ce texte</button>
      </section>
      <section className="card">
        <h2>Réinitialiser</h2>
        {confirmReset ? (
          <div className="row gap wrap">
            <span>Effacer définitivement tous les résultats, brouillons et simulations ? (Exporte d'abord si tu veux les garder.)</span>
            <button type="button" className="btn danger" onClick={async () => { await resetAll(); setConfirmReset(false); setMsg({ kind: 'ok', text: 'Toutes les données ont été effacées.' }); }}>Oui, tout effacer</button>
            <button type="button" className="btn ghost" onClick={() => setConfirmReset(false)}>Annuler</button>
          </div>
        ) : <button type="button" className="btn danger" onClick={() => setConfirmReset(true)}>Tout effacer…</button>}
      </section>
      <section className="card">
        <h2>À propos du compilateur</h2>
        <p className="small">Le C est compilé dans ton navigateur par <strong>wcc</strong> (projet xcc de tyfkda, licence MIT) transformé en WebAssembly, puis exécuté dans un worker isolé, sans accès réseau ni fichiers réels, arrêté après 2 s. Différences avec Linux à connaître :</p>
        <ul className="list small">
          <li>Les pointeurs font 4 octets (8 sur Linux 64 bits). <code className="ic">long</code> est ramené à 64 bits comme sur Linux.</li>
          <li>Lire ou écrire à l'adresse NULL ne plante pas toujours ici, alors que Linux donne une Segmentation fault. Un test réussi ici n'exclut pas un plantage sur ta machine.</li>
          <li>Les messages d'erreur ont la forme fichier(ligne) au lieu de fichier:ligne:colonne de gcc.</li>
          <li>Pas de Criterion ni de make : à pratiquer sur ta machine.</li>
        </ul>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ sources

export function SourcesPage() {
  return (
    <div className="page">
      <header className="page-head">
        <h1>Sources : PDF → notions<span className="cursor">_</span></h1>
        <p className="lead">Les 12 PDF exploités, ce qu'ils enseignent et où le retrouver sur ce site.</p>
      </header>
      <div className="table-wrap" tabIndex={0}>
        <table className="tasks">
          <thead><tr><th>PDF</th><th>Jour</th><th>Notions</th><th>Compétences</th><th>Activités</th></tr></thead>
          <tbody>
            {PDF_DAYS.map((d) => {
              const skills = SKILLS.filter((s) => s.days.includes(d.id));
              const ex = d.tasks.filter((t) => t.exercise).length;
              return (
                <tr key={d.id}>
                  <td className="mono small">{d.file}<br /><span className="muted">{d.version} · {d.pages} p.</span></td>
                  <td><button type="button" className="link-btn" onClick={() => navigate({ page: 'day', id: d.id })}>{d.title}</button><br /><span className="small muted">{d.subtitle}</span></td>
                  <td className="small">{d.tasks.map((t) => t.section.replace(/^Task \d+ - /, '')).join(', ')}</td>
                  <td>{skills.map((s) => <span key={s.id} className="tag tag-soft">{s.title}</span>)}</td>
                  <td className="small">{LESSONS.filter((l) => skills.some((s) => s.id === l.skill)).length} cours · {ex} tâches reproduites</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <section className="card">
        <h2>Ce qui n'est pas couvert par les PDF</h2>
        <ul className="list">
          <li>Jours 13 et suivants, et le contenu exact du stumper : non fournis, rien n'est inventé. Les simulations sont des sujets originaux.</li>
          <li>Le chapitre « Unit tests for C/C++ » et le document « How to turn-in using Github » de l'E-Learning sont cités mais pas fournis.</li>
          <li>Les ressources du Day 02 (students.csv, passwd) et le fichier my_opp.h du Day 10 ne sont pas fournis : ces tâches ne sont pas reproduites.</li>
          <li>Le cours « Méthode d'examen » est un complément pédagogique, marqué comme tel.</li>
        </ul>
      </section>
      <p className="small muted">Exercices de simulation : {EXAMS.map((e) => e.binary).join(', ')}.</p>
    </div>
  );
}
