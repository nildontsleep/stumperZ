// Persistent learner state: attempts, progress, drafts, exam attempts, preferences.
// Stored locally in IndexedDB (falls back to memory if the browser blocks storage).
import type { SkillId } from '../content/types';

export const FORMAT = 'stumperz-backup';
export const VERSION = 1;

export type Context = 'diagnostic' | 'lesson' | 'practice' | 'review' | 'exam' | 'video';

export interface Attempt {
  id: string;
  ts: number;
  kind: 'quiz' | 'code' | 'exam';
  itemId: string;
  skills: SkillId[];
  /** 0..1 */
  score: number;
  correct: boolean;
  dontKnow?: boolean;
  /** No hint and no solution looked at before submitting. */
  autonomous: boolean;
  hintsUsed: number;
  solutionViewed: boolean;
  /** The code was really compiled and the tests were executed. */
  verified: boolean;
  /** First attempt ever on this item. */
  firstTry: boolean;
  level: 1 | 2 | 3;
  context: Context;
  gap?: string;
  details?: {
    passed?: number;
    total?: number;
    compileError?: boolean;
    staticIssues?: string[];
    failedKinds?: string[];
    timeout?: boolean;
    crash?: boolean;
  };
}

export interface ExamAttempt {
  id: string;
  examId: string;
  startedAt: number;
  deadline: number;
  endedAt?: number;
  status: 'running' | 'finished' | 'timeout' | 'abandoned';
  /** Help was seen (correction opened before the end, or attempt abandoned). */
  aided: boolean;
  code: string;
  compiles?: number;
  runs?: number;
  steps?: { passed: number; total: number; points: number; earned: number }[];
  verified: boolean;
  compileError?: string;
}

export interface DiagnosticResult {
  completedAt: number;
  answers: { item: string; skill: SkillId; outcome: 'ok' | 'wrong' | 'dontknow' | 'skipped'; gap?: string }[];
}

export interface Prefs {
  theme: 'dark' | 'light';
  budget: number;
  embedVideos: boolean;
}

export interface State {
  version: number;
  createdAt: number;
  attempts: Attempt[];
  exams: ExamAttempt[];
  lessonsDone: Record<string, number>;
  videosSeen: Record<string, number>;
  activity: Record<string, number>;
  diagnostic?: DiagnosticResult;
  prefs: Prefs;
  /** Ids of plan items completed, per day (YYYY-MM-DD). */
  planDone: Record<string, string[]>;
}

export function emptyState(): State {
  return {
    version: VERSION,
    createdAt: Date.now(),
    attempts: [],
    exams: [],
    lessonsDone: {},
    videosSeen: {},
    activity: {},
    prefs: { theme: 'dark', budget: 120, embedVideos: false },
    planDone: {},
  };
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// ------------------------------------------------------------------ persistence

const DB_NAME = 'stumperz';
const STORE = 'kv';
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  if (!db) return memory.get(key) as T | undefined;
  return new Promise((resolve) => {
    try {
      const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      r.onsuccess = () => resolve(r.result as T | undefined);
      r.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

export async function kvSet(key: string, value: unknown): Promise<boolean> {
  const db = await openDb();
  if (!db) {
    memory.set(key, value);
    return false;
  }
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

const memory = new Map<string, unknown>();

export async function storageAvailable() {
  return (await openDb()) !== null;
}

// ------------------------------------------------------------------ import / export

export interface Backup {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  state: State;
  drafts: Record<string, string>;
}

export function makeBackup(state: State, drafts: Record<string, string>): Backup {
  return { format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), state, drafts };
}

/** Validates an imported backup. Returns a readable error, or the parsed data. */
export function parseBackup(text: string): { ok: true; backup: Backup } | { ok: false; error: string } {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Ce fichier n\'est pas du JSON valide.' };
  }
  if (!data || data.format !== FORMAT) return { ok: false, error: 'Ce fichier n\'est pas une sauvegarde StumperZ.' };
  if (typeof data.version !== 'number' || data.version > VERSION) {
    return { ok: false, error: `Version de sauvegarde ${data.version} non prise en charge (version du site : ${VERSION}).` };
  }
  const s = data.state;
  if (!s || !Array.isArray(s.attempts) || !Array.isArray(s.exams) || typeof s.prefs !== 'object') {
    return { ok: false, error: 'Sauvegarde incomplète : il manque les résultats ou les préférences.' };
  }
  for (const a of s.attempts) {
    if (typeof a.itemId !== 'string' || typeof a.ts !== 'number' || !Array.isArray(a.skills) || typeof a.score !== 'number') {
      return { ok: false, error: 'Un résultat de la sauvegarde est mal formé.' };
    }
  }
  const state: State = { ...emptyState(), ...s, prefs: { ...emptyState().prefs, ...s.prefs }, version: VERSION };
  const drafts: Record<string, string> = {};
  if (data.drafts && typeof data.drafts === 'object') {
    for (const [k, v] of Object.entries(data.drafts)) if (typeof v === 'string') drafts[k] = v;
  }
  return { ok: true, backup: { ...data, state, drafts } };
}
