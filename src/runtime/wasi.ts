// Minimal WASI preview1 implementation over an in-memory file system.
// Used both to run the wcc compiler (cc.wasm) and the programs it produces.

export type MemFS = Map<string, Uint8Array>;

export interface RunOptions {
  args: string[];
  fs: MemFS;
  stdin?: Uint8Array;
  /** Paths that exist but cannot be opened (simulates "Permission denied"). */
  denied?: string[];
  /** Max bytes kept for stdout/stderr (protection against infinite printing). */
  outputLimit?: number;
}

export interface RunResult {
  exitCode: number;
  stdout: Uint8Array;
  stderr: Uint8Array;
  outputTruncated: boolean;
  trap?: string;
}

const E = {
  SUCCESS: 0, ACCES: 2, BADF: 8, EXIST: 20, INVAL: 28, ISDIR: 31, NOENT: 44, NOSYS: 52, NOTDIR: 54, SPIPE: 70,
};

class ExitSignal {
  constructor(public code: number) {}
}
class OutputLimitSignal {}

interface OpenFile {
  path: string;
  pos: number;
  append: boolean;
  dir: boolean;
}

function normalize(p: string): string {
  const parts: string[] = [];
  for (const seg of p.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

function isDir(fs: MemFS, p: string): boolean {
  if (p === '') return true;
  const prefix = p + '/';
  for (const k of fs.keys()) if (k.startsWith(prefix)) return true;
  return false;
}

export function runWasi(module: WebAssembly.Module, opts: RunOptions): RunResult {
  const fs = opts.fs;
  const denied = new Set((opts.denied ?? []).map(normalize));
  const limit = opts.outputLimit ?? 1 << 20;
  const out: number[][] = [[], []];
  let outCount = 0;
  let truncated = false;
  const stdin = opts.stdin ?? new Uint8Array(0);
  let stdinPos = 0;
  const fds = new Map<number, OpenFile>();
  // Two preopens on the same root: "/" for absolute paths, "." for relative ones.
  const preopens = ['/', '.'];
  fds.set(3, { path: '', pos: 0, append: false, dir: true });
  fds.set(4, { path: '', pos: 0, append: false, dir: true });
  let nextFd = 5;
  let memory: WebAssembly.Memory;
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const argBufs = opts.args.map((a) => enc.encode(a + '\0'));

  const view = () => new DataView(memory.buffer);
  const bytes = () => new Uint8Array(memory.buffer);
  const readStr = (ptr: number, len: number) => dec.decode(bytes().slice(ptr, ptr + len));
  const resolve = (dirfd: number, p: string): string | null => {
    const d = fds.get(dirfd);
    if (!d || !d.dir) return null;
    return normalize(p.startsWith('/') ? p : d.path + '/' + p);
  };
  const writeFilestat = (buf: number, filetype: number, size: number) => {
    const v = view();
    for (let i = 0; i < 64; i += 8) v.setBigUint64(buf + i, 0n, true);
    v.setUint8(buf + 16, filetype);
    v.setBigUint64(buf + 24, 1n, true);
    v.setBigUint64(buf + 32, BigInt(size), true);
  };

  const impl: Record<string, (...a: any[]) => number | void> = {
    args_sizes_get(argcPtr: number, bufSizePtr: number) {
      const v = view();
      v.setUint32(argcPtr, argBufs.length, true);
      v.setUint32(bufSizePtr, argBufs.reduce((s, b) => s + b.length, 0), true);
      return E.SUCCESS;
    },
    args_get(argvPtr: number, bufPtr: number) {
      const v = view();
      const m = bytes();
      let p = bufPtr;
      argBufs.forEach((b, i) => {
        v.setUint32(argvPtr + i * 4, p, true);
        m.set(b, p);
        p += b.length;
      });
      return E.SUCCESS;
    },
    environ_sizes_get(cPtr: number, sPtr: number) {
      view().setUint32(cPtr, 0, true);
      view().setUint32(sPtr, 0, true);
      return E.SUCCESS;
    },
    environ_get() {
      return E.SUCCESS;
    },
    fd_prestat_get(fd: number, buf: number) {
      const name = preopens[fd - 3];
      if (name === undefined) return E.BADF;
      const v = view();
      v.setUint8(buf, 0);
      v.setUint32(buf + 4, name.length, true);
      return E.SUCCESS;
    },
    fd_prestat_dir_name(fd: number, ptr: number, len: number) {
      const name = preopens[fd - 3];
      if (name === undefined) return E.BADF;
      bytes().set(enc.encode(name).subarray(0, len), ptr);
      return E.SUCCESS;
    },
    fd_fdstat_get(fd: number, buf: number) {
      const v = view();
      const f = fds.get(fd);
      if (fd > 2 && !f) return E.BADF;
      v.setUint8(buf, fd <= 2 ? 2 : f!.dir ? 3 : 4);
      v.setUint16(buf + 2, 0, true);
      v.setBigUint64(buf + 8, 0xffffffffn, true);
      v.setBigUint64(buf + 16, 0xffffffffn, true);
      return E.SUCCESS;
    },
    path_open(dirfd: number, _dirflags: number, pathPtr: number, pathLen: number, oflags: number,
      _rb: bigint, _ri: bigint, fdflags: number, fdOut: number) {
      const p = resolve(dirfd, readStr(pathPtr, pathLen));
      if (p === null) return E.BADF;
      if (denied.has(p)) return E.ACCES;
      const exists = fs.has(p);
      const dir = !exists && isDir(fs, p);
      if (oflags & 2 && !dir) return exists ? E.NOTDIR : E.NOENT;
      if (dir) {
        if (oflags & 1 && oflags & 4) return E.EXIST;
        fds.set(nextFd, { path: p, pos: 0, append: false, dir: true });
      } else {
        if (!exists) {
          if (!(oflags & 1)) return E.NOENT;
          fs.set(p, new Uint8Array(0));
        } else if (oflags & 1 && oflags & 4) {
          return E.EXIST;
        }
        if (oflags & 8) fs.set(p, new Uint8Array(0));
        fds.set(nextFd, { path: p, pos: 0, append: !!(fdflags & 1), dir: false });
      }
      view().setUint32(fdOut, nextFd, true);
      nextFd++;
      return E.SUCCESS;
    },
    fd_close(fd: number) {
      if (fd <= 2) return E.SUCCESS;
      if (fd === 3 || fd === 4) return E.BADF;
      return fds.delete(fd) ? E.SUCCESS : E.BADF;
    },
    fd_read(fd: number, iovs: number, iovsLen: number, nreadPtr: number) {
      const v = view();
      const m = bytes();
      let total = 0;
      let src: Uint8Array;
      let pos: number;
      const f = fds.get(fd);
      if (fd === 0) {
        src = stdin;
        pos = stdinPos;
      } else if (f && !f.dir) {
        src = fs.get(f.path) ?? new Uint8Array(0);
        pos = f.pos;
      } else if (f && f.dir) {
        return E.ISDIR;
      } else {
        return E.BADF;
      }
      for (let i = 0; i < iovsLen; i++) {
        const ptr = v.getUint32(iovs + i * 8, true);
        const len = v.getUint32(iovs + i * 8 + 4, true);
        const n = Math.max(0, Math.min(len, src.length - pos));
        m.set(src.subarray(pos, pos + n), ptr);
        pos += n;
        total += n;
        if (n < len) break;
      }
      if (fd === 0) stdinPos = pos;
      else f!.pos = pos;
      v.setUint32(nreadPtr, total, true);
      return E.SUCCESS;
    },
    fd_write(fd: number, iovs: number, iovsLen: number, nwrittenPtr: number) {
      const v = view();
      const m = bytes();
      let total = 0;
      const f = fds.get(fd);
      if (fd !== 1 && fd !== 2 && (!f || f.dir)) return E.BADF;
      for (let i = 0; i < iovsLen; i++) {
        const ptr = v.getUint32(iovs + i * 8, true);
        const len = v.getUint32(iovs + i * 8 + 4, true);
        const chunk = m.slice(ptr, ptr + len);
        if (fd === 1 || fd === 2) {
          const room = limit - outCount;
          const take = Math.min(room, chunk.length);
          for (let j = 0; j < take; j++) out[fd - 1].push(chunk[j]);
          outCount += take;
          if (take < chunk.length) {
            truncated = true;
            throw new OutputLimitSignal();
          }
        } else {
          const old = fs.get(f!.path) ?? new Uint8Array(0);
          const at = f!.append ? old.length : f!.pos;
          const nb = new Uint8Array(Math.max(old.length, at + chunk.length));
          nb.set(old);
          nb.set(chunk, at);
          fs.set(f!.path, nb);
          f!.pos = at + chunk.length;
        }
        total += len;
      }
      v.setUint32(nwrittenPtr, total, true);
      return E.SUCCESS;
    },
    fd_seek(fd: number, offset: bigint, whence: number, newOffPtr: number) {
      const f = fds.get(fd);
      if (!f || f.dir) return fd <= 2 ? E.SPIPE : E.BADF;
      const size = fs.get(f.path)?.length ?? 0;
      const base = whence === 0 ? 0 : whence === 1 ? f.pos : size;
      const np = base + Number(offset);
      if (np < 0) return E.INVAL;
      f.pos = np;
      view().setBigUint64(newOffPtr, BigInt(np), true);
      return E.SUCCESS;
    },
    fd_tell(fd: number, outPtr: number) {
      const f = fds.get(fd);
      if (!f) return E.BADF;
      view().setBigUint64(outPtr, BigInt(f.pos), true);
      return E.SUCCESS;
    },
    fd_filestat_get(fd: number, buf: number) {
      if (fd <= 2) {
        writeFilestat(buf, 2, 0);
        return E.SUCCESS;
      }
      const f = fds.get(fd);
      if (!f) return E.BADF;
      if (f.dir) writeFilestat(buf, 3, 0);
      else writeFilestat(buf, 4, fs.get(f.path)?.length ?? 0);
      return E.SUCCESS;
    },
    path_filestat_get(dirfd: number, _flags: number, pathPtr: number, pathLen: number, buf: number) {
      const p = resolve(dirfd, readStr(pathPtr, pathLen));
      if (p === null) return E.BADF;
      if (fs.has(p)) writeFilestat(buf, 4, fs.get(p)!.length);
      else if (isDir(fs, p)) writeFilestat(buf, 3, 0);
      else return E.NOENT;
      return E.SUCCESS;
    },
    path_unlink_file(dirfd: number, pathPtr: number, pathLen: number) {
      const p = resolve(dirfd, readStr(pathPtr, pathLen));
      if (p === null) return E.BADF;
      return fs.delete(p) ? E.SUCCESS : E.NOENT;
    },
    random_get(buf: number, len: number) {
      const m = bytes();
      for (let i = 0; i < len; i++) m[buf + i] = (Math.random() * 256) | 0;
      return E.SUCCESS;
    },
    clock_time_get(_id: number, _prec: bigint, outPtr: number) {
      view().setBigUint64(outPtr, BigInt(Date.now()) * 1000000n, true);
      return E.SUCCESS;
    },
    sched_yield() {
      return E.SUCCESS;
    },
    proc_exit(code: number) {
      throw new ExitSignal(code);
    },
  };

  const wasiImports: Record<string, (...a: any[]) => number | void> = {};
  const imports: WebAssembly.Imports = { wasi_snapshot_preview1: wasiImports };
  for (const imp of WebAssembly.Module.imports(module)) {
    if (imp.kind !== 'function') continue;
    if (imp.module === 'wasi_snapshot_preview1') {
      wasiImports[imp.name] = impl[imp.name] ?? (() => E.NOSYS);
    } else {
      // Unknown import (should not happen with wcc): link a stub so instantiation works.
      (imports[imp.module] ??= {} as any)[imp.name] = () => E.NOSYS;
    }
  }

  let exitCode = 0;
  let trap: string | undefined;
  try {
    const instance = new WebAssembly.Instance(module, imports);
    memory = instance.exports.memory as WebAssembly.Memory;
    (instance.exports._start as () => void)();
  } catch (e) {
    if (e instanceof ExitSignal) exitCode = e.code;
    else if (e instanceof OutputLimitSignal) exitCode = -2;
    else {
      exitCode = -1;
      trap = e instanceof Error ? e.message : String(e);
    }
  }
  return {
    exitCode,
    stdout: Uint8Array.from(out[0]),
    stderr: Uint8Array.from(out[1]),
    outputTruncated: truncated,
    trap,
  };
}
