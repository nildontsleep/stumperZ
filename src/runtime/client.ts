// Main-thread API for compiling and running C. Each run has a time limit:
// on timeout the worker is killed (stopping infinite loops) and recreated.
import CcWorker from './worker?worker&inline';

export interface RunRequest {
  args?: string[];
  stdin?: string;
  files?: Record<string, string>;
  denied?: string[];
  outputLimit?: number;
}

export interface RunOutcome {
  status: 'ok' | 'timeout' | 'trap' | 'error';
  stdout: string;
  stderr: string;
  exitCode: number;
  outputTruncated: boolean;
  message?: string;
}

export interface CompileOutcome {
  ok: boolean;
  output: string;
}

export type EngineState = 'idle' | 'loading' | 'ready' | 'unavailable';

type Pending = { resolve: (v: any) => void; reject: (e: Error) => void };

class CRunner {
  private worker: Worker | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private compiledSources: string | null = null;
  state: EngineState = 'idle';
  unavailableReason = '';
  private listeners = new Set<(s: EngineState) => void>();

  onState(fn: (s: EngineState) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private setState(s: EngineState) {
    this.state = s;
    this.listeners.forEach((f) => f(s));
  }

  private spawn() {
    this.worker = new CcWorker();
    this.worker.onmessage = (ev) => {
      const p = this.pending.get(ev.data.id);
      if (!p) return;
      this.pending.delete(ev.data.id);
      p.resolve(ev.data);
    };
    this.worker.onerror = (ev) => {
      const err = new Error(ev.message || 'Erreur du worker');
      this.pending.forEach((p) => p.reject(err));
      this.pending.clear();
    };
    this.compiledSources = null;
  }

  private kill() {
    this.worker?.terminate();
    this.worker = null;
    this.compiledSources = null;
    const err = new Error('worker terminated');
    this.pending.forEach((p) => p.reject(err));
    this.pending.clear();
  }

  private call(msg: any, timeoutMs: number): Promise<any> {
    if (!this.worker) this.spawn();
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.kill();
        reject(new TimeoutError());
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      this.worker!.postMessage({ ...msg, id });
    });
  }

  /** Loads the compiler. Resolves to false if C cannot run in this browser. */
  async init(): Promise<boolean> {
    if (this.state === 'ready') return true;
    if (this.state === 'unavailable') return false;
    this.setState('loading');
    try {
      const r = await this.call({ type: 'init' }, 20000);
      if (!r.ok) throw new Error(r.error);
      this.setState('ready');
      return true;
    } catch (e) {
      this.unavailableReason = e instanceof Error ? e.message : String(e);
      this.kill();
      this.setState('unavailable');
      return false;
    }
  }

  async compile(sources: Record<string, string>): Promise<CompileOutcome> {
    if (!(await this.init())) return { ok: false, output: 'Compilateur indisponible : ' + this.unavailableReason };
    try {
      const r = await this.call({ type: 'compile', sources }, 15000);
      if (r.error) return { ok: false, output: 'Erreur interne du compilateur : ' + r.error };
      this.compiledSources = r.ok ? JSON.stringify(sources) : null;
      return { ok: r.ok, output: r.output };
    } catch (e) {
      return { ok: false, output: e instanceof TimeoutError ? 'La compilation a pris trop de temps.' : String(e) };
    }
  }

  /** Runs the last compiled program. Recompiles transparently if the worker was restarted. */
  async run(sources: Record<string, string>, req: RunRequest, timeoutMs = 2000): Promise<RunOutcome> {
    const key = JSON.stringify(sources);
    if (this.compiledSources !== key) {
      const c = await this.compile(sources);
      if (!c.ok) return { status: 'error', stdout: '', stderr: '', exitCode: -1, outputTruncated: false, message: c.output };
    }
    try {
      const r = await this.call({ type: 'run', req }, timeoutMs);
      if (!r.ok) return { status: 'error', stdout: '', stderr: '', exitCode: -1, outputTruncated: false, message: r.error };
      const res = r.result;
      return {
        status: res.trap ? 'trap' : 'ok',
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
        outputTruncated: res.outputTruncated,
        message: res.trap,
      };
    } catch (e) {
      if (e instanceof TimeoutError) {
        return {
          status: 'timeout', stdout: '', stderr: '', exitCode: -1, outputTruncated: false,
          message: `Arrêté après ${timeoutMs / 1000} s (boucle infinie ?)`,
        };
      }
      return { status: 'error', stdout: '', stderr: '', exitCode: -1, outputTruncated: false, message: String(e) };
    }
  }
}

class TimeoutError extends Error {}

export const cRunner = new CRunner();
