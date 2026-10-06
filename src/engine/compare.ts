import type { TestCase } from '../content/types';

export interface Observed {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface Verdict {
  pass: boolean;
  reasons: string[];
}

/** Compares a run with the expected output of the reference solution. */
export function compareOutput(t: TestCase, expected: Observed, got: Observed): Verdict {
  const reasons: string[] = [];
  if (got.stdout !== expected.stdout) reasons.push('La sortie standard ne correspond pas.');
  if (t.checkExit && got.exitCode !== expected.exitCode) {
    reasons.push(`Code de sortie ${got.exitCode} au lieu de ${expected.exitCode}.`);
  }
  if (t.stderr === 'any' && !got.stderr) reasons.push('Un message d\'erreur était attendu sur la sortie d\'erreur (fd 2).');
  if (t.stderr === 'empty' && got.stderr) reasons.push('Rien ne devait être écrit sur la sortie d\'erreur.');
  return { pass: reasons.length === 0, reasons };
}

/** Shows a string like `cat -e`: line ends as $, tabs as ^I, other control chars as ^X. */
export function catE(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (ch === '\n') out += '$\n';
    else if (ch === '\t') out += '^I';
    else if (c < 32) out += '^' + String.fromCharCode(c + 64);
    else if (c === 127) out += '^?';
    else out += ch;
  }
  return out;
}
