/// <reference lib="webworker" />
// Compilation worker: holds the wcc toolchain and the last compiled program.
import { compileOnly, decodeSysroot, runCompiled, type Toolchain } from './cc';
import { CC_WASM_BASE64 } from './generated/cc-wasm';
import sysrootJson from './generated/sysroot.json';

let tc: Toolchain | null = null;
let program: WebAssembly.Module | null = null;

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

function init() {
  if (tc) return;
  const cc = new WebAssembly.Module(base64ToBytes(CC_WASM_BASE64) as BufferSource);
  tc = { cc, sysroot: decodeSysroot(sysrootJson as Record<string, string>) };
}

self.onmessage = (ev: MessageEvent) => {
  const msg = ev.data;
  try {
    if (msg.type === 'init') {
      init();
      postMessage({ id: msg.id, ok: true });
    } else if (msg.type === 'compile') {
      init();
      const r = compileOnly(tc!, msg.sources);
      program = r.wasm ? new WebAssembly.Module(r.wasm as BufferSource) : null;
      postMessage({ id: msg.id, ok: r.ok, output: r.output });
    } else if (msg.type === 'run') {
      if (!program) throw new Error('Aucun programme compilé');
      const r = runCompiled(program, msg.req);
      postMessage({ id: msg.id, ok: true, result: r });
    }
  } catch (e) {
    postMessage({ id: msg.id, ok: false, error: e instanceof Error ? e.message : String(e) });
  }
};
