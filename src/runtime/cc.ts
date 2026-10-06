// Compile C sources with wcc (running as WebAssembly) and run the result,
// entirely in memory. Pure function: no DOM, usable from a Worker or Node.
import { runWasi, type MemFS } from './wasi';

export interface Toolchain {
  cc: WebAssembly.Module;
  sysroot: MemFS;
}

export interface CompileRunRequest {
  /** file name -> C source. All .c files are compiled and linked together. */
  sources: Record<string, string>;
  /** argv[1..] passed to the program. argv[0] is "./a.out". */
  args?: string[];
  stdin?: string;
  /** Extra files visible to the program (path relative to its working dir). */
  files?: Record<string, string>;
  denied?: string[];
  outputLimit?: number;
}

export interface CompileRunResult {
  phase: 'compile' | 'run';
  ok: boolean;
  compileOutput: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  outputTruncated: boolean;
  trap?: string;
}

const dec = new TextDecoder();
const enc = new TextEncoder();

export function decodeSysroot(json: Record<string, string>): MemFS {
  const fs: MemFS = new Map();
  for (const [k, b64] of Object.entries(json)) {
    const bin = atob(b64);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    fs.set(k, u);
  }
  return fs;
}

/**
 * In wasm32, `long` is 32 bits, whereas on the Linux x86-64 machines of the piscine it is 64 bits.
 * Student code often relies on that (my_put_nbr / my_getnbr with a long), so in student files only
 * we rewrite the keyword `long` to `long long` (outside comments, strings and char literals).
 */
export function promoteLong(code: string): string {
  let out = '';
  let i = 0;
  const n = code.length;
  while (i < n) {
    const c = code[i];
    if (c === '/' && code[i + 1] === '/') {
      const j = code.indexOf('\n', i);
      const end = j === -1 ? n : j;
      out += code.slice(i, end);
      i = end;
    } else if (c === '/' && code[i + 1] === '*') {
      const j = code.indexOf('*/', i + 2);
      const end = j === -1 ? n : j + 2;
      out += code.slice(i, end);
      i = end;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && code[j] !== c && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1;
      out += code.slice(i, j + 1);
      i = j + 1;
    } else if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /\w/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (word === 'long') {
        const before = out.match(/(\w+)\s*$/)?.[1];
        const after = code.slice(j).match(/^\s*(\w+)/)?.[1];
        out += before === 'long' || after === 'long' ? word : 'long long';
      } else {
        out += word;
      }
      i = j;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

export function compileOnly(tc: Toolchain, sources: Record<string, string>) {
  const fs: MemFS = new Map(tc.sysroot);
  const names: string[] = [];
  for (const [name, raw] of Object.entries(sources)) {
    const p = 'work/' + name;
    // Files whose name starts with "zz_" belong to the hidden test harness.
    const code = name.startsWith('zz_') ? raw : promoteLong(raw);
    fs.set(p, enc.encode(code));
    if (name.endsWith('.c')) names.push(p);
  }
  const r = runWasi(tc.cc, {
    args: ['cc', '-Wall', '-Wextra', '-Iwork', '--stack-size=1048576', '-o', 'work/a.wasm', ...names],
    fs,
  });
  const out = (dec.decode(r.stdout) + dec.decode(r.stderr)).replaceAll('work/', '');
  const bin = fs.get('work/a.wasm');
  const ok = r.exitCode === 0 && !!bin;
  return { ok, output: out + (r.trap ? `\n[compilateur interrompu: ${r.trap}]` : ''), wasm: ok ? bin! : null };
}

export function runCompiled(mod: WebAssembly.Module, req: Omit<CompileRunRequest, 'sources'>) {
  const fs: MemFS = new Map();
  for (const [p, content] of Object.entries(req.files ?? {})) fs.set(p.replace(/^\.?\//, ''), enc.encode(content));
  const r = runWasi(mod, {
    args: ['./a.out', ...(req.args ?? [])],
    fs,
    stdin: enc.encode(req.stdin ?? ''),
    denied: req.denied,
    outputLimit: req.outputLimit ?? 64 * 1024,
  });
  return {
    stdout: dec.decode(r.stdout),
    stderr: dec.decode(r.stderr),
    exitCode: r.exitCode,
    outputTruncated: r.outputTruncated,
    trap: r.trap,
  };
}

export function compileAndRun(tc: Toolchain, req: CompileRunRequest): CompileRunResult {
  const c = compileOnly(tc, req.sources);
  if (!c.ok || !c.wasm) {
    return {
      phase: 'compile', ok: false, compileOutput: c.output, stdout: '', stderr: '', exitCode: -1, outputTruncated: false,
    };
  }
  const mod = new WebAssembly.Module(c.wasm as BufferSource);
  return { phase: 'run', ok: true, compileOutput: c.output, ...runCompiled(mod, req) };
}
