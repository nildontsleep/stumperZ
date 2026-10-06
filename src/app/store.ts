import { useSyncExternalStore } from 'react';
import { emptyState, kvGet, kvSet, storageAvailable, todayKey, uid, type Attempt, type ExamAttempt, type State, type DiagnosticResult, type Prefs } from '../engine/state';

let state: State = emptyState();
let drafts: Record<string, string> = {};
let loaded = false;
let storageOk = true;
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  listeners.forEach((l) => l());
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let draftTimer: ReturnType<typeof setTimeout> | null = null;

function writeNow() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  void kvSet('state', state).then((ok) => {
    if (!ok && storageOk) {
      storageOk = false;
      emit();
    }
  });
}

/** Debounced save for frequent changes (typing, active time); immediate for important ones. */
function persist(immediate = false) {
  if (immediate) return writeNow();
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(writeNow, 300);
}

function persistDrafts() {
  if (draftTimer) clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    draftTimer = null;
    void kvSet('drafts', drafts);
  }, 300);
}

/** Flush pending saves when the page is hidden or closed. */
export function flushOnHide() {
  const flush = () => {
    if (saveTimer) writeNow();
    if (draftTimer) {
      clearTimeout(draftTimer);
      draftTimer = null;
      void kvSet('drafts', drafts);
    }
  };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

export async function loadStore() {
  storageOk = await storageAvailable();
  const s = await kvGet<State>('state');
  const d = await kvGet<Record<string, string>>('drafts');
  if (s && Array.isArray(s.attempts)) state = { ...emptyState(), ...s, prefs: { ...emptyState().prefs, ...s.prefs } };
  if (d) drafts = d;
  for (const e of state.exams) {
    try {
      const key = 'stumperz-exam-' + e.id;
      const backup = localStorage.getItem(key);
      if (e.status === 'running' && backup !== null && backup !== e.code) e.code = backup;
      if (e.status !== 'running') localStorage.removeItem(key);
    } catch {
      /* storage blocked */
    }
  }
  loaded = true;
  emit();
}

function set(fn: (s: State) => State, immediate = true) {
  state = fn(state);
  persist(immediate);
  emit();
}

export function getState() {
  return state;
}
export function getDrafts() {
  return drafts;
}
export function isLoaded() {
  return loaded;
}
export function isStorageOk() {
  return storageOk;
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(state),
  );
}

/** Re-render on any change (for components computing derived data). */
export function useVersion() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
  );
}

// ------------------------------------------------------------------ actions

export function recordAttempt(a: Omit<Attempt, 'id' | 'ts' | 'firstTry'> & { firstTry?: boolean }) {
  const firstTry = a.firstTry ?? !state.attempts.some((x) => x.itemId === a.itemId && x.kind === a.kind);
  const full: Attempt = { ...a, id: uid(), ts: Date.now(), firstTry };
  set((s) => ({ ...s, attempts: [...s.attempts, full] }));
  return full;
}

export function updateAttempt(id: string, patch: Partial<Attempt>) {
  set((s) => ({ ...s, attempts: s.attempts.map((a) => (a.id === id ? { ...a, ...patch, ts: Date.now() } : a)) }));
}

export function markLessonDone(id: string) {
  set((s) => ({ ...s, lessonsDone: { ...s.lessonsDone, [id]: Date.now() } }));
}

export function markVideoSeen(id: string) {
  set((s) => ({ ...s, videosSeen: { ...s.videosSeen, [id]: Date.now() } }));
}

export function setPrefs(p: Partial<Prefs>) {
  set((s) => ({ ...s, prefs: { ...s.prefs, ...p } }));
}

export function setDiagnostic(d: DiagnosticResult) {
  set((s) => ({ ...s, diagnostic: d }));
}

export function markPlanDone(key: string) {
  const k = todayKey();
  set((s) => ({ ...s, planDone: { ...s.planDone, [k]: [...new Set([...(s.planDone[k] ?? []), key])] } }));
}

export function saveDraft(id: string, code: string) {
  drafts = { ...drafts, [id]: code };
  persistDrafts();
}

export function clearDraft(id: string) {
  const { [id]: _, ...rest } = drafts;
  drafts = rest;
  persistDrafts();
}

export function startExam(examId: string, starter: string, minutes: number): ExamAttempt {
  const now = Date.now();
  const e: ExamAttempt = { id: uid(), examId, startedAt: now, deadline: now + minutes * 60000, status: 'running', aided: false, code: starter, verified: false, compiles: 0, runs: 0 };
  set((s) => ({ ...s, exams: [...s.exams, e] }));
  return e;
}

export function updateExam(id: string, patch: Partial<ExamAttempt>) {
  if (patch.code !== undefined) {
    // synchronous backup of the exam code, in case the page is closed before IndexedDB commits
    try {
      localStorage.setItem('stumperz-exam-' + id, patch.code);
    } catch {
      /* storage blocked */
    }
  }
  // code edits are frequent: debounced; status changes are saved at once
  set((s) => ({ ...s, exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) }), !(Object.keys(patch).length === 1 && 'code' in patch));
}

export function addActiveSeconds(sec: number) {
  const k = todayKey();
  // not persisted on every tick: activity is saved with the next persist
  state = { ...state, activity: { ...state.activity, [k]: (state.activity[k] ?? 0) + sec } };
  persist();
  emit();
}

export async function replaceAll(next: State, nextDrafts: Record<string, string>) {
  state = next;
  drafts = nextDrafts;
  await kvSet('state', state);
  await kvSet('drafts', drafts);
  emit();
}

export async function resetAll() {
  await replaceAll(emptyState(), {});
}

// ------------------------------------------------------------------ active time

/**
 * Counts time only while the tab is visible AND the student interacted in the last 60 s
 * (keyboard, mouse, scroll, touch). A tab left open for hours does not count.
 */
export function startActivityTracker() {
  let lastInput = Date.now();
  const bump = () => {
    lastInput = Date.now();
  };
  for (const ev of ['keydown', 'pointerdown', 'pointermove', 'wheel', 'touchstart', 'scroll']) {
    window.addEventListener(ev, bump, { passive: true, capture: true });
  }
  const TICK = 5;
  const timer = setInterval(() => {
    const visible = typeof document === 'undefined' || document.visibilityState === 'visible';
    if (visible && Date.now() - lastInput < 60000) addActiveSeconds(TICK);
  }, TICK * 1000);
  return () => clearInterval(timer);
}
