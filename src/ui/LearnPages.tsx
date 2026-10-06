import { useState } from 'react';
import { LESSONS, lesson as getLesson } from '../content/lessons';
import { exercise } from '../content/exercises';
import { SKILLS, skill, prereqClosure } from '../content/skills';
import { PDF_DAYS, pdfDay } from '../content/pdf';
import { VIDEOS, video as getVideo, MAIN_VIDEO_ID, C_PLAYLIST, WRITTEN_COURSE } from '../content/videos';
import { EXERCISES } from '../content/exercises';
import { markLessonDone, markVideoSeen, setPrefs, useStore, useVersion, getState } from '../app/store';
import { navigate, back } from '../app/router';
import { skillScores } from '../engine/scoring';
import { Blocks, CodeView, SourceChip, fmtMinutes, Rich } from './text';
import { QuizSession } from './Quiz';
import type { DayId, SkillId, Video } from '../content/types';

export function StatusPill({ skillId }: { skillId: SkillId }) {
  useVersion();
  const s = skillScores(getState().attempts)[skillId];
  const cls = s.status === 'acquis' ? 'ok' : s.status === 'en cours' ? 'mid' : s.status === 'fragile' ? 'bad' : 'none';
  return <span className={`pill pill-${cls}`}>{s.status}{s.status !== 'non évalué' && s.provisional ? ' · provisoire' : ''}</span>;
}

function ExerciseLink({ id, mode, label }: { id: string; mode: 'guided' | 'solo'; label: string }) {
  const ex = exercise(id)!;
  const solved = useStore((s) => s.attempts.some((a) => a.itemId === id && a.kind === 'code' && a.correct));
  return (
    <button type="button" className="ex-link card" onClick={() => navigate({ page: 'exercise', id, mode, from: 'lesson' })}>
      <span className="ex-link-kind">{label}</span>
      <span className="ex-link-title">{ex.title}</span>
      <span className="muted small">niveau {ex.level} · ≈ {fmtMinutes(ex.minutes)} {solved ? '· déjà réussi' : ''}</span>
    </button>
  );
}

export function LessonPage({ id }: { id: string }) {
  const l = getLesson(id);
  const done = useStore((s) => !!(l && s.lessonsDone[l.id]));
  const [checkDone, setCheckDone] = useState(false);
  if (!l) return <p>Cours introuvable.</p>;
  const sk = skill(l.skill);
  const missing = prereqClosure(l.skill);
  const scores = skillScores(getState().attempts);
  const weakPrereqs = missing.filter((p) => scores[p].status === 'fragile');
  return (
    <div className="page lesson-page">
      <header className="page-head">
        <button type="button" className="link-btn" onClick={back}>← Retour</button>
        <h1>{l.title}<span className="cursor">_</span></h1>
        <div className="row gap wrap meta">
          <StatusPill skillId={l.skill} />
          <span className="tag tag-soft">≈ {fmtMinutes(l.minutes)}</span>
          {l.complement && <span className="tag">Complément (hors PDF)</span>}
          {l.sources.map((s, i) => <SourceChip key={i} s={s} />)}
        </div>
        {sk.prereqs.length > 0 && (
          <p className="small muted">Prérequis : {sk.prereqs.map((p, i) => <span key={p}>{i > 0 && ', '}<button type="button" className="link-btn" onClick={() => navigate({ page: 'lesson', id: LESSONS.find((x) => x.skill === p)!.id })}>{skill(p).title}</button></span>)}</p>
        )}
        {weakPrereqs.length > 0 && (
          <div className="panel warn">
            <p><strong>Détour conseillé :</strong> ce cours s'appuie sur {weakPrereqs.map((p) => skill(p).title).join(', ')}, que tes réponses montrent fragile. Un passage rapide sur ce prérequis rendra la suite beaucoup plus claire.</p>
            <div className="row gap wrap">{weakPrereqs.map((p) => <button key={p} type="button" className="btn small" onClick={() => navigate({ page: 'lesson', id: LESSONS.find((x) => x.skill === p)!.id })}>{skill(p).title}</button>)}</div>
          </div>
        )}
      </header>
      <ol className="lesson-steps">
        <li><h2>À quoi ça sert</h2><Blocks blocks={l.why} /></li>
        <li><h2>Comment ça marche</h2><Blocks blocks={l.how} /></li>
        <li><h2>Un exemple</h2><CodeView code={l.example.code} lang={/^\$|^#!/.test(l.example.code) ? 'sh' : 'c'} /></li>
        <li><h2>Le code expliqué</h2><Blocks blocks={l.example.explain} /></li>
        <li><h2>Erreur fréquente</h2><Blocks blocks={l.pitfall} /></li>
        <li>
          <h2>Exercice accompagné</h2>
          {l.guided ? <ExerciseLink id={l.guided} mode="guided" label="Avec aides" /> : <p className="muted">Pas d'exercice exécutable pour cette notion dans le navigateur : fais l'exercice local décrit plus haut.</p>}
        </li>
        <li>
          <h2>À faire seul</h2>
          {l.solo ? <ExerciseLink id={l.solo} mode="solo" label="Sans aide" /> : <p className="muted">Entraîne-toi en local (voir l'exemple), puis vérifie avec les questions ci-dessous.</p>}
        </li>
        <li>
          <h2>Vérification des acquis</h2>
          <QuizSession ids={l.check} context="lesson" title="Vérification" onFinish={() => { setCheckDone(true); markLessonDone(l.id); }} />
        </li>
      </ol>
      {l.videos && l.videos.length > 0 && (
        <section>
          <h2>Vidéos liées</h2>
          <div className="grid cards-3">{l.videos.map((v) => <VideoCard key={v} v={getVideo(v)!} />)}</div>
        </section>
      )}
      <div className="row gap">
        {!done && !checkDone && <button type="button" className="btn" onClick={() => markLessonDone(l.id)}>Marquer le cours comme lu</button>}
        {(done || checkDone) && <span className="tag tag-ok">Cours lu</span>}
      </div>
    </div>
  );
}

export function LessonsPage() {
  useVersion();
  const scores = skillScores(getState().attempts);
  const done = getState().lessonsDone;
  return (
    <div className="page">
      <header className="page-head"><h1>Cours et fiches<span className="cursor">_</span></h1>
        <p className="lead">Dans l'ordre des dépendances : chaque notion s'appuie sur les précédentes. Tout est accessible, rien n'est bloqué.</p></header>
      <div className="lesson-list">
        {SKILLS.map((s) => {
          const l = LESSONS.find((x) => x.skill === s.id)!;
          return (
            <button key={s.id} type="button" className="lesson-row" onClick={() => navigate({ page: 'lesson', id: l.id })}>
              <span className={`imp imp-${s.stumper}`} title="Importance pour un examen en C">{'●'.repeat(s.stumper) || '○'}</span>
              <span className="lesson-row-title">{l.title}</span>
              <span className="muted small lesson-row-days">{s.days.map((d) => pdfDay(d).title).join(', ') || 'méthode'}</span>
              <span className={`pill pill-${scores[s.id].status === 'acquis' ? 'ok' : scores[s.id].status === 'en cours' ? 'mid' : scores[s.id].status === 'fragile' ? 'bad' : 'none'}`}>{scores[s.id].status}</span>
              {done[l.id] && <span className="tag tag-ok">lu</span>}
            </button>
          );
        })}
      </div>
      <p className="small muted">● ● ● indispensable pour un examen d'une heure en C · ● ● utile · ● secondaire · ○ hors C (shell, git)</p>
    </div>
  );
}

// ------------------------------------------------------------------ days

export function DaysPage() {
  useVersion();
  const st = getState();
  return (
    <div className="page">
      <header className="page-head">
        <h1>Rattraper la piscine<span className="cursor">_</span></h1>
        <p className="lead">Le parcours complet, jour par jour, d'après les 12 PDF. Navigue librement : si un jour demande une notion que tu n'as pas, un détour est proposé.</p>
      </header>
      <div className="days-grid">
        {PDF_DAYS.map((d) => {
          const exIds = d.tasks.map((t) => t.exercise).filter(Boolean) as string[];
          const solved = exIds.filter((id) => st.attempts.some((a) => a.itemId === id && a.correct)).length;
          return (
            <button key={d.id} type="button" className="day-card card" onClick={() => navigate({ page: 'day', id: d.id })}>
              <span className="day-num">{d.title.replace('Day ', '')}</span>
              <span className="day-title">{d.subtitle}</span>
              <span className="muted small">{d.tasks.length} sections · {exIds.length} exercices ici</span>
              {exIds.length > 0 && (
                <span className="meter" aria-label={`${solved} sur ${exIds.length} exercices réussis`}><span style={{ width: `${(solved / exIds.length) * 100}%` }} /></span>
              )}
            </button>
          );
        })}
      </div>
      <p className="small muted">Jours 13 et suivants : aucun PDF fourni, donc aucun contenu inventé.</p>
    </div>
  );
}

export function DayPage({ id }: { id: DayId }) {
  useVersion();
  const d = pdfDay(id);
  const st = getState();
  const skills = SKILLS.filter((s) => s.days.includes(id));
  const lessons = LESSONS.filter((l) => skills.some((s) => s.id === l.skill));
  const prereqs = [...new Set(skills.flatMap((s) => prereqClosure(s.id)))].filter((p) => !skills.some((s) => s.id === p));
  const exercises = EXERCISES.filter((e) => e.source?.day === id || (e.relation !== 'reproduces' && skills.some((s) => e.skills[0] === s.id)));
  const videos = VIDEOS.filter((v) => v.days.includes(id));
  const quizIds = lessons.flatMap((l) => l.check).filter((q, i, a) => a.indexOf(q) === i).slice(0, 8);
  const practical = d.tasks.map((t) => t.exercise).filter(Boolean) as string[];
  const solvedAlone = practical.filter((x) => st.attempts.some((a) => a.itemId === x && a.correct && a.autonomous && a.verified));
  const minutes = lessons.reduce((s, l) => s + l.minutes, 0) + exercises.reduce((s, e) => s + e.minutes, 0);
  const [quiz, setQuiz] = useState(false);
  return (
    <div className="page day-page">
      <header className="page-head">
        <button type="button" className="link-btn" onClick={back}>← Tous les jours</button>
        <h1>{d.title} · {d.subtitle}<span className="cursor">_</span></h1>
        <p className="muted">Source : {d.file} ({d.version}, {d.pages} pages) · langage : {d.language} · temps estimé ici : {fmtMinutes(minutes)}</p>
      </header>

      <section className="card">
        <h2>Objectifs</h2>
        <ul className="list">{skills.map((s) => <li key={s.id}><strong>{s.title}</strong> — {s.short} <StatusPill skillId={s.id} /></li>)}</ul>
        {prereqs.length > 0 && <p className="small">Prérequis : {prereqs.map((p) => skill(p).title).join(', ')}.</p>}
        {practical.length > 0 && <p className="small">Progression : {solvedAlone.length} / {practical.length} tâches du PDF réussies seul ici.</p>}
      </section>

      <section>
        <h2>Règles du jour (PDF)</h2>
        <ul className="list rules">
          {d.rules.map((r, i) => <li key={i}>{r.text} <span className="src-page">p.{r.page}</span></li>)}
          <li><strong>Fonctions autorisées :</strong> {d.allowed}</li>
          {d.compile && <li><strong>Compilation :</strong> <code className="ic">{d.compile}</code></li>}
        </ul>
        {d.extractionNotes && <aside className="note note-info"><span className="note-label">Lecture du PDF</span><span>{d.extractionNotes.join(' ')}</span></aside>}
      </section>

      <section>
        <h2>Tâches du PDF</h2>
        <div className="table-wrap" tabIndex={0}>
          <table className="tasks">
            <thead><tr><th>Section</th><th>p.</th><th>Rendu / prototype</th><th>Ce qu'il faut faire</th><th>Ici</th></tr></thead>
            <tbody>
              {d.tasks.map((t) => {
                const ok = t.exercise && st.attempts.some((a) => a.itemId === t.exercise && a.correct);
                return (
                  <tr key={t.section}>
                    <td>{t.section}</td>
                    <td>{t.page}</td>
                    <td>{t.delivery && <div className="mono small">{t.delivery}</div>}{t.prototype && <code className="ic">{t.prototype}</code>}</td>
                    <td>{t.summary}</td>
                    <td>{t.exercise ? <button type="button" className="btn small" onClick={() => navigate({ page: 'exercise', id: t.exercise!, mode: 'solo' })}>{ok ? 'Refaire' : 'S\'entraîner'}</button> : <span className="muted small">local</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {lessons.length > 0 && (
        <section>
          <h2>Cours</h2>
          <div className="grid cards-2">
            {lessons.map((l) => (
              <button key={l.id} type="button" className="card lesson-card" onClick={() => navigate({ page: 'lesson', id: l.id })}>
                <span className="lesson-card-title">{l.title}</span>
                <span className="muted small">≈ {fmtMinutes(l.minutes)} {st.lessonsDone[l.id] ? '· lu' : ''}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2>Vidéos</h2>
          <div className="grid cards-3">{videos.map((v) => <VideoCard key={v.id} v={v} />)}</div>
        </section>
      )}

      {exercises.length > 0 && (
        <section>
          <h2>Exercices</h2>
          <div className="grid cards-3">
            {exercises.map((e) => {
              const ok = st.attempts.some((a) => a.itemId === e.id && a.correct);
              return (
                <button key={e.id} type="button" className="card ex-card" onClick={() => navigate({ page: 'exercise', id: e.id, mode: 'solo' })}>
                  <span className="ex-card-title">{e.title}</span>
                  <span className="muted small">{e.relation === 'reproduces' ? 'tâche du PDF' : e.relation === 'inspired' ? 'inspiré' : 'complément'} · niveau {e.level} · {fmtMinutes(e.minutes)}</span>
                  {ok && <span className="tag tag-ok">réussi</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {quizIds.length > 0 && (
        <section>
          <h2>Quiz du jour</h2>
          {quiz ? <QuizSession ids={quizIds} context="practice" title={`Quiz ${d.title}`} /> : <button type="button" className="btn" onClick={() => setQuiz(true)}>Commencer le quiz ({quizIds.length} questions)</button>}
        </section>
      )}

      {practical.length > 0 && (
        <section className="card">
          <h2>Évaluation pratique</h2>
          <p>Fais les tâches du PDF en mode « Seul », sans aide : seules ces réussites comptent comme preuves solides. {solvedAlone.length} / {practical.length} validées.</p>
          <div className="row gap wrap">
            {practical.filter((x) => !solvedAlone.includes(x)).slice(0, 4).map((x) => (
              <button key={x} type="button" className="btn" onClick={() => navigate({ page: 'exercise', id: x, mode: 'solo' })}>{exercise(x)!.title}</button>
            ))}
          </div>
        </section>
      )}
      {skills.length === 0 && <p className="muted">Ce jour porte sur le shell : voir le cours « Shell Unix ».</p>}
    </div>
  );
}

// ------------------------------------------------------------------ videos

export function VideoCard({ v }: { v: Video }) {
  const seen = useStore((s) => !!s.videosSeen[v.id]);
  return (
    <button type="button" className="card video-card" onClick={() => navigate({ page: 'video', id: v.id })}>
      <span className="video-play" aria-hidden="true">▶</span>
      <span className="video-title">{v.title}</span>
      <span className="muted small">{v.author.split(' (')[0]}{seen ? ' · vue' : ''}</span>
    </button>
  );
}

export function VideoPage({ id }: { id: string }) {
  const v = getVideo(id);
  const embed = useStore((s) => s.prefs.embedVideos);
  const [quiz, setQuiz] = useState(false);
  if (!v) return <p>Vidéo introuvable.</p>;
  return (
    <div className="page video-page">
      <header className="page-head">
        <button type="button" className="link-btn" onClick={back}>← Retour</button>
        <h1>{v.title}<span className="cursor">_</span></h1>
        <p className="muted">{v.author}</p>
      </header>
      <div className="video-frame card">
        {embed && v.youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
            title={v.title}
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video-placeholder">
            <a className="btn primary" href={v.url} target="_blank" rel="noopener noreferrer" onClick={() => markVideoSeen(v.id)}>Ouvrir la vidéo sur YouTube ↗</a>
            <button type="button" className="btn ghost small" onClick={() => setPrefs({ embedVideos: true })}>Essayer le lecteur intégré</button>
            <p className="small muted">Le lecteur intégré peut être bloqué selon l'endroit où le site est ouvert. Le lien fonctionne toujours.</p>
          </div>
        )}
      </div>
      {embed && (
        <p className="small">
          <a href={v.url} target="_blank" rel="noopener noreferrer" onClick={() => markVideoSeen(v.id)}>Ouvrir sur YouTube ↗</a> ·{' '}
          <button type="button" className="link-btn" onClick={() => setPrefs({ embedVideos: false })}>Lecteur bloqué ? Revenir au lien seul</button>
        </p>
      )}
      <section className="card">
        <h2>Ce que tu vas y voir</h2>
        <ul className="list">{v.learn.map((x, i) => <li key={i}>{x}</li>)}</ul>
        {v.caveat && <aside className="note note-warn"><span className="note-label">Attention</span><span>{v.caveat}</span></aside>}
        <p className="small muted">{v.verified}</p>
      </section>
      <section>
        <h2>Juste après la vidéo</h2>
        <p>Regarder ne suffit pas à valider une notion : réponds aux questions, puis fais l'exercice.</p>
        {quiz ? <QuizSession ids={v.quiz} context="video" title="Questions sur la vidéo" /> : <button type="button" className="btn primary" onClick={() => { setQuiz(true); markVideoSeen(v.id); }}>J'ai regardé : questions ({v.quiz.length})</button>}
        {v.exercise && (
          <p><button type="button" className="btn" onClick={() => navigate({ page: 'exercise', id: v.exercise!, mode: 'guided' })}>Petit exercice : {exercise(v.exercise)!.title}</button></p>
        )}
      </section>
    </div>
  );
}

export function VideosPage() {
  const main = getVideo(MAIN_VIDEO_ID)!;
  return (
    <div className="page">
      <header className="page-head">
        <h1>Vidéos<span className="cursor">_</span></h1>
        <p className="lead">En français, d'un même auteur pour garder un fil cohérent. Chaque vidéo est suivie de questions : regarder ne valide rien.</p>
      </header>
      <section className="card main-video">
        <p className="eyebrow">Pour commencer à comprendre le C</p>
        <h2>{main.title} — et la suite de la playlist</h2>
        <p><Rich text={`Auteur : ${main.author}. Cours de C complet en 29 épisodes d'après l'index de l'auteur. Commence par les épisodes 1 à 3 (introduction, compiler, variables), puis 6 à 8 (conditions, boucles, fonctions), puis 11 à 13 (pointeurs, tableaux, chaînes).`} /></p>
        <div className="row gap wrap">
          <button type="button" className="btn primary" onClick={() => navigate({ page: 'video', id: main.id })}>Voir la fiche de la vidéo 1</button>
          <a className="btn" href={C_PLAYLIST} target="_blank" rel="noopener noreferrer">Ouvrir la playlist « C – cours » ↗</a>
        </div>
        <p className="small muted">{main.verified} Les durées et chapitres ne sont donc pas affichés.</p>
        <aside className="note note-info"><span className="note-label">Alternative écrite</span><span>{WRITTEN_COURSE.title} — {WRITTEN_COURSE.author}. {WRITTEN_COURSE.note} <a href={WRITTEN_COURSE.url} target="_blank" rel="noopener noreferrer">Ouvrir ↗</a></span></aside>
      </section>
      <div className="grid cards-3">{VIDEOS.map((v) => <VideoCard key={v.id} v={v} />)}</div>
    </div>
  );
}
