import { useState } from 'react';
import type { RunReport, TestResult } from '../engine/run';
import { catE } from '../engine/compare';

const KIND: Record<string, string> = { normal: 'cas normal', limit: 'cas limite', empty: 'entrée vide', error: 'cas d\'erreur' };

export function parseArgs(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q: string | null = null;
  let has = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === q) q = null;
      else if (c === '\\' && q === '"' && i + 1 < line.length) cur += line[++i];
      else cur += c;
    } else if (c === '"' || c === "'") {
      q = c;
      has = true;
    } else if (c === ' ' || c === '\t') {
      if (cur || has) out.push(cur);
      cur = '';
      has = false;
    } else if (c === '\\' && i + 1 < line.length) {
      cur += line[++i];
      has = true;
    } else {
      cur += c;
      has = true;
    }
  }
  if (cur || has) out.push(cur);
  return out;
}

function shellQuote(a: string) {
  return /^[\w./+-]+$/.test(a) ? a : `"${a.replace(/(["\\])/g, '\\$1')}"`;
}

function TestRow({ r, index, hidden }: { r: TestResult; index: number; hidden?: boolean }) {
  const [open, setOpen] = useState(!r.pass && index < 3);
  const t = r.test;
  return (
    <li className={`test ${r.pass ? 'ok' : 'bad'}`}>
      <button type="button" className="test-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="test-dot" aria-hidden="true">{r.pass ? '✓' : '✗'}</span>
        <span className="test-name">{t.name}</span>
        {t.kind && t.kind !== 'normal' && <span className="tag tag-soft">{KIND[t.kind]}</span>}
        <span className="sr-only">{r.pass ? 'réussi' : 'échoué'}</span>
      </button>
      {open && (
        <div className="test-body">
          {t.args && <p className="mono small">$ ./a.out {t.args.map(shellQuote).join(' ')}{t.stdin !== undefined ? '  (entrée standard fournie)' : ''}</p>}
          {t.code && !hidden && <pre className="mono small test-code">{t.code}</pre>}
          {t.files && <p className="small">Fichiers disponibles : {Object.keys(t.files).join(', ')}{t.denied?.length ? ` (accès refusé : ${t.denied.join(', ')})` : ''}</p>}
          {r.reasons.map((x, i) => <p key={i} className="reason">{x}</p>)}
          {r.status === 'ok' && (
            <div className="io-grid">
              <div>
                <p className="io-label">Attendu (cat -e)</p>
                <pre className="io">{catE(r.expected.stdout) || '(rien)'}</pre>
                {t.checkExit && <p className="small">code de sortie {r.expected.exitCode}</p>}
              </div>
              <div>
                <p className="io-label">Obtenu (cat -e)</p>
                <pre className="io">{catE(r.got.stdout) || '(rien)'}</pre>
                {t.checkExit && <p className="small">code de sortie {r.got.exitCode}</p>}
                {r.got.stderr && <><p className="io-label">Sortie d'erreur</p><pre className="io io-err">{catE(r.got.stderr)}</pre></>}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function RunResults({ report }: { report: RunReport }) {
  if (report.engineUnavailable) {
    return (
      <div className="panel warn" role="status">
        <p><strong>Code non compilé, non exécuté.</strong> Le compilateur C ne peut pas démarrer dans ce navigateur ({report.engineUnavailable}).</p>
        <p>Teste en local : <code className="ic">gcc -Wall -Wextra *.c -o test && ./test</code>, puis compare ta sortie avec les exemples du sujet. Ce résultat ne compte pas comme vérifié.</p>
      </div>
    );
  }
  return (
    <div className="results" aria-live="polite">
      {report.staticIssues.length > 0 && (
        <div className="panel warn">
          <p><strong>Règles du sujet (vérification simple du texte) :</strong></p>
          <ul className="list">{report.staticIssues.map((i, k) => <li key={k}>{i.message}</li>)}</ul>
        </div>
      )}
      {!report.compiled ? (
        <div className="panel bad">
          <p><strong>Ne compile pas.</strong> Lis la première erreur : fichier(ligne), puis le message.</p>
          {report.harnessProblem && <p>L'erreur vient du programme de test caché : vérifie que ton prototype est exactement celui du sujet (nom, types, ordre des paramètres).</p>}
          <pre className="io io-err">{report.compileOutput || 'Erreur de compilation.'}</pre>
          <p className="small">Le compilateur de ce site (wcc) est parfois moins précis que gcc : si le message ne t'aide pas, regarde aussi la <strong>ligne d'avant</strong> (point-virgule oublié, parenthèse ou accolade non fermée, variable non déclarée).</p>
        </div>
      ) : (
        <>
          {report.compileOutput && (
            <details className="panel warn">
              <summary>Avertissements du compilateur</summary>
              <pre className="io">{report.compileOutput}</pre>
            </details>
          )}
          <p className={`score-line ${report.passed === report.total ? 'ok' : ''}`}>
            {report.passed} / {report.total} tests réussis {report.passed === report.total ? '— code compilé et vérifié.' : ''}
          </p>
          <ol className="tests">{report.results.map((r, i) => <TestRow key={i} r={r} index={i} />)}</ol>
        </>
      )}
    </div>
  );
}
