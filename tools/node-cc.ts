// Node helper: load the toolchain from disk (used by content validation scripts).
import fs from 'node:fs';
import { decodeSysroot, type Toolchain } from '../src/runtime/cc';
export function loadToolchain(): Toolchain {
  const cc = new WebAssembly.Module(fs.readFileSync('vendor/wcc/cc.wasm'));
  const sysroot = decodeSysroot(JSON.parse(fs.readFileSync('src/runtime/generated/sysroot.json', 'utf8')));
  return { cc, sysroot };
}
