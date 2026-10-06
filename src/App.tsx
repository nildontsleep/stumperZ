import { useEffect, useState } from 'react';
import { useRoute, navigate, type Route } from './app/router';
import { useStore, isLoaded, useVersion, getState, isStorageOk } from './app/store';
import { Dashboard, PlanPage, DiagnosticPage } from './ui/MainPages';
import { DaysPage, DayPage, LessonPage, LessonsPage, VideoPage, VideosPage } from './ui/LearnPages';
import { ExercisePage } from './ui/ExercisePage';
import { ExamsPage, ExamRun, ExamResult, finishExam } from './ui/ExamPages';
import { QuizRoute, ReviewPage, CheatsheetsPage, ExercisesPage, StatsPage, SettingsPage, SourcesPage } from './ui/OtherPages';
import type { DayId } from './content/types';

const NAV: { label: string; route: Route; match: Route['page'][]; key: string }[] = [
  { key: 'dashboard', label: 'Tableau de bord', route: { page: 'dashboard' }, match: ['dashboard'] },
  { key: 'diagnostic', label: 'Diagnostic', route: { page: 'diagnostic' }, match: ['diagnostic'] },
  { key: 'plan', label: 'Parcours demain', route: { page: 'plan' }, match: ['plan'] },
  { key: 'days', label: 'Jours de piscine', route: { page: 'days' }, match: ['days', 'day'] },
  { key: 'lessons', label: 'Cours et fiches', route: { page: 'lessons' }, match: ['lessons', 'lesson', 'cheatsheets'] },
  { key: 'videos', label: 'Vidéos', route: { page: 'videos' }, match: ['videos', 'video'] },
  { key: 'exercises', label: 'Exercices', route: { page: 'exercises' }, match: ['exercises', 'exercise'] },
  { key: 'review', label: 'Révision des erreurs', route: { page: 'review' }, match: ['review', 'quiz'] },
  { key: 'exams', label: 'Mode stumper', route: { page: 'exams' }, match: ['exams', 'exam', 'examResult'] },
  { key: 'stats', label: 'Statistiques', route: { page: 'stats' }, match: ['stats'] },
  { key: 'settings', label: 'Paramètres', route: { page: 'settings' }, match: ['settings'] },
  { key: 'sources', label: 'Sources PDF', route: { page: 'sources' }, match: ['sources'] },
];

function Page({ r }: { r: Route }) {
  switch (r.page) {
    case 'dashboard': return <Dashboard />;
    case 'diagnostic': return <DiagnosticPage />;
    case 'plan': return <PlanPage />;
    case 'days': return <DaysPage />;
    case 'day': return <DayPage id={r.id as DayId} />;
    case 'lessons': return <LessonsPage />;
    case 'lesson': return <LessonPage id={r.id} />;
    case 'exercises': return <ExercisesPage initialSkill={r.skill} />;
    case 'exercise': return <ExercisePage id={r.id} mode={r.mode} from={r.from} />;
    case 'quiz': return <QuizRoute ids={r.ids} title={r.title} context={r.context} />;
    case 'review': return <ReviewPage />;
    case 'cheatsheets': return <CheatsheetsPage />;
    case 'exams': return <ExamsPage />;
    case 'exam': return <ExamRun attemptId={r.attemptId} />;
    case 'examResult': return <ExamResult attemptId={r.attemptId} />;
    case 'stats': return <StatsPage />;
    case 'videos': return <VideosPage />;
    case 'video': return <VideoPage id={r.id} />;
    case 'settings': return <SettingsPage />;
    case 'sources': return <SourcesPage />;
  }
}

export function App() {
  useVersion();
  const route = useRoute();
  const theme = useStore((s) => s.prefs.theme);
  const [menu, setMenu] = useState(false);
  const runningExam = useStore((s) => s.exams.find((e) => e.status === 'running'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // An exam whose deadline passed while the page was closed is submitted automatically.
  useEffect(() => {
    const e = getState().exams.find((x) => x.status === 'running' && x.deadline < Date.now());
    if (e) void finishExam(e, 'timeout', false);
  }, []);

  if (!isLoaded()) {
    return <div className="boot" role="status">Chargement de ta progression…</div>;
  }

  const inExam = route.page === 'exam';
  const go = (r: Route) => {
    setMenu(false);
    navigate(r);
  };

  return (
    <div className={`shell ${inExam ? 'exam-mode' : ''}`}>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Aller au contenu</a>
      <header className="topbar">
        <button type="button" className="icon-btn menu-btn" aria-expanded={menu} aria-controls="sidenav" onClick={() => setMenu(!menu)} aria-label="Menu">☰</button>
        <button type="button" className="brand" onClick={() => go({ page: 'dashboard' })}>
          stumper<span className="brand-z">Z</span><span className="cursor">_</span>
        </button>
        {runningExam && !inExam && (
          <button type="button" className="btn small primary" onClick={() => go({ page: 'exam', attemptId: runningExam.id })}>Simulation en cours</button>
        )}
      </header>
      {!inExam && (
        <nav id="sidenav" className={`sidenav ${menu ? 'open' : ''}`} aria-label="Navigation principale">
          <button type="button" className="brand side-brand" onClick={() => go({ page: 'dashboard' })}>
            stumper<span className="brand-z">Z</span><span className="cursor">_</span>
          </button>
          <p className="side-sub">Piscine Epitech · Day 01 → 12</p>
          <ul>
            {NAV.map((n) => (
              <li key={n.key}>
                <button type="button" className={n.match.includes(route.page) ? 'active' : ''} aria-current={n.match.includes(route.page) ? 'page' : undefined} onClick={() => go(n.route)}>
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
          {!isStorageOk() && <p className="side-warn">Stockage local bloqué : exporte ta sauvegarde.</p>}
        </nav>
      )}
      {menu && <div className="scrim" onClick={() => setMenu(false)} aria-hidden="true" />}
      <main id="main" tabIndex={-1}>
        <Page r={route} />
      </main>
    </div>
  );
}
