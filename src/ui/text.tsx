import { Fragment, type ReactNode } from 'react';
import type { Block, MemCell, SourceRef } from '../content/types';
import { pdfDay } from '../content/pdf';

/** Inline mini-markdown: `code` and **bold**. */
export function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('`')) parts.push(<code key={k++} className="ic">{tok.slice(1, -1)}</code>);
    else parts.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

const KEYWORDS = new Set([
  'int', 'char', 'void', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'struct', 'typedef', 'union', 'enum',
  'if', 'else', 'while', 'for', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default', 'sizeof', 'NULL',
]);

/** Display-only C highlighter (the real compiler is wcc; this only colours text). */
export function highlightC(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#\s*\w+[^\n]*|\b\d+\b|\b[A-Za-z_]\w*\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const t = m[0];
    let cls = '';
    if (t.startsWith('/*') || t.startsWith('//')) cls = 'tk-com';
    else if (t.startsWith('"') || t.startsWith("'")) cls = 'tk-str';
    else if (t.startsWith('#')) cls = 'tk-pre';
    else if (/^\d/.test(t)) cls = 'tk-num';
    else if (KEYWORDS.has(t)) cls = 'tk-kw';
    else if (code[m.index + t.length] === '(') cls = 'tk-fn';
    out.push(cls ? <span key={k++} className={cls}>{t}</span> : t);
    last = m.index + t.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeView({ code, lang = 'c', caption }: { code: string; lang?: string; caption?: string }) {
  return (
    <figure className="codefig">
      <pre className={`code lang-${lang}`} tabIndex={0}>
        <code>{lang === 'c' ? highlightC(code) : code}</code>
      </pre>
      {caption && <figcaption><Rich text={caption} /></figcaption>}
    </figure>
  );
}

function MemoryDiagram({ cells, caption }: { cells: MemCell[]; caption?: string }) {
  return (
    <figure className="memfig">
      <div className="mem" role="table" aria-label={caption ?? 'Schéma mémoire'}>
        <div className="mem-row mem-head" role="row">
          <span role="columnheader">adresse</span>
          <span role="columnheader">nom</span>
          <span role="columnheader">valeur</span>
        </div>
        {cells.map((c) => (
          <div key={c.id} className={`mem-row kind-${c.kind ?? 'var'}`} role="row">
            <span className="mem-addr" role="cell">{c.addr ?? ''}</span>
            <span className="mem-name" role="cell">{c.name ?? ''}</span>
            <span className="mem-val" role="cell">{c.value}</span>
          </div>
        ))}
      </div>
      {caption && <figcaption><Rich text={caption} /></figcaption>}
    </figure>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <Fragment key={i}>
          <BlockView b={b} />
        </Fragment>
      ))}
    </>
  );
}

const NOTE_LABEL = { info: 'À savoir', warn: 'Attention', pdf: 'D\'après le PDF', extra: 'Complément (hors PDF)' } as const;

export function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'p':
      return <p><Rich text={b.text} /></p>;
    case 'list':
      return <ul className="list">{b.items.map((it, i) => <li key={i}><Rich text={it} /></li>)}</ul>;
    case 'code':
      return <CodeView code={b.code} lang={b.lang ?? 'c'} caption={b.caption} />;
    case 'note':
      return (
        <aside className={`note note-${b.kind}`}>
          <span className="note-label">{NOTE_LABEL[b.kind]}</span>
          <span><Rich text={b.text} /></span>
        </aside>
      );
    case 'memory':
      return <MemoryDiagram cells={b.cells} caption={b.caption} />;
    case 'trace':
      return (
        <figure className="tracefig">
          <div className="table-wrap" tabIndex={0}>
            <table className="trace">
              <thead><tr>{b.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
              <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    case 'error':
      return (
        <div className="errcard">
          <pre className="errmsg">{b.message}</pre>
          <dl>
            <dt>Ce que ça veut dire</dt><dd>{b.meaning}</dd>
            <dt>Cause probable</dt><dd>{b.cause}</dd>
            <dt>Comment corriger</dt><dd>{b.fix}</dd>
          </dl>
        </div>
      );
  }
}

export function SourceChip({ s }: { s: SourceRef }) {
  const d = pdfDay(s.day);
  return (
    <span className="src-chip" title={`${d.file}, page ${s.page}`}>
      <span className="src-file">{d.title}</span> {s.section.replace(/^Task (\d+) - /, 'T$1 · ')} <span className="src-page">p.{s.page}</span>
    </span>
  );
}

export function fmtMinutes(min: number) {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

export function pct(x: number) {
  return `${Math.round(x * 100)} %`;
}
