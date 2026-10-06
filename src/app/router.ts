import { useSyncExternalStore } from 'react';

// In-memory router: the page may run inside a sandboxed frame where the URL cannot carry
// state, so navigation lives in memory (with a back stack). The last route is remembered.

export type Route =
  | { page: 'dashboard' }
  | { page: 'diagnostic' }
  | { page: 'plan' }
  | { page: 'days' }
  | { page: 'day'; id: string }
  | { page: 'lessons' }
  | { page: 'lesson'; id: string }
  | { page: 'exercises'; skill?: string }
  | { page: 'exercise'; id: string; mode?: 'guided' | 'solo'; from?: string }
  | { page: 'quiz'; ids: string[]; title: string; context?: 'practice' | 'review' | 'video' }
  | { page: 'review' }
  | { page: 'cheatsheets' }
  | { page: 'exams' }
  | { page: 'exam'; attemptId: string }
  | { page: 'examResult'; attemptId: string }
  | { page: 'stats' }
  | { page: 'videos' }
  | { page: 'video'; id: string }
  | { page: 'settings' }
  | { page: 'sources' };

let current: Route = { page: 'dashboard' };
const stack: Route[] = [];
const listeners = new Set<() => void>();

try {
  const saved = sessionStorage.getItem('stumperz-route');
  if (saved) current = JSON.parse(saved);
} catch {
  /* storage unavailable: start on the dashboard */
}

function emit() {
  try {
    sessionStorage.setItem('stumperz-route', JSON.stringify(current));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
  window.scrollTo?.({ top: 0 });
  // move focus to the main content for keyboard and screen reader users
  requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }));
}

export function navigate(r: Route) {
  stack.push(current);
  if (stack.length > 50) stack.shift();
  current = r;
  emit();
}

export function replace(r: Route) {
  current = r;
  emit();
}

export function back() {
  current = stack.pop() ?? { page: 'dashboard' };
  emit();
}

export function canGoBack() {
  return stack.length > 0;
}

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
