import { useMemo, useState } from 'react';
import type { Quiz } from '../content/types';
import { QUIZZES, quiz as getQuiz } from '../content/quizzes';
import { skill } from '../content/skills';
import { lessonForSkill } from '../content/lessons';
import { recordAttempt } from '../app/store';
import type { Context } from '../engine/state';
import { navigate } from '../app/router';
import { CodeView, Rich, SourceChip } from './text';
import { catE } from '../engine/compare';

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const KIND_LABEL: Record<Quiz['kind'], string> = {
  mcq: 'QCM', multi: 'Plusieurs réponses', output: 'Prédire la sortie', bug: 'Trouver le bug', order: 'Remettre en ordre', fill: 'Compléter', tests: 'Choisir les tests',
};

export interface QuizOutcome {
  quizId: string;
  correct: boolean;
  dontKnow: boolean;
}

export function QuizCard({ q, context, onNext, nextLabel = 'Question suivante' }: { q: Quiz; context: Context; onNext?: (o: QuizOutcome) => void; nextLabel?: string }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [picked, setPicked] = useState<number[]>([]);
  const [order, setOrder] = useState<number[]>(() => shuffle(q.lines?.map((_, i) => i) ?? [], seed));
  const [fill, setFill] = useState('');
  const [result, setResult] = useState<null | { correct: boolean; dontKnow: boolean; score: number }>(null);
  const [tries, setTries] = useState(0);

  const options = useMemo(() => shuffle((q.options ?? []).map((o, i) => ({ ...o, i })), seed), [q, seed]);
  const multi = q.kind === 'multi' || q.kind === 'tests';

  function submit(dontKnow = false) {
    let correct = false;
    let score = 0;
    if (dontKnow) {
      correct = false;
    } else if (q.kind === 'order') {
      const ok = order.filter((v, i) => q.lines![v] === q.lines![i]).length;
      correct = ok === order.length;
      score = ok / order.length;
    } else if (q.kind === 'fill') {
      const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
      correct = (q.answers ?? []).some((a) => norm(a) === norm(fill));
    } else if (multi) {
      const good = new Set((q.options ?? []).map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0));
      const sel = new Set(picked);
      const right = (q.options ?? []).filter((_, i) => good.has(i) === sel.has(i)).length;
      correct = right === (q.options ?? []).length;
      score = right / (q.options ?? []).length;
    } else {
      correct = picked.length === 1 && !!q.options?.[picked[0]]?.correct;
    }
    if (correct) score = 1;
    if (dontKnow) score = 0;
    setResult({ correct, dontKnow, score });
    recordAttempt({
      kind: 'quiz', itemId: q.id, skills: [q.skill], score, correct, dontKnow, autonomous: true, hintsUsed: 0, solutionViewed: false,
      verified: false, level: q.level, context, gap: correct ? undefined : q.gap, firstTry: tries === 0 ? undefined : false,
    });
  }

  function retry() {
    setTries((t) => t + 1);
    const s = seed + 7;
    setSeed(s);
    setPicked([]);
    setFill('');
    setOrder(shuffle(q.lines?.map((_, i) => i) ?? [], s));
    setResult(null);
  }

  const neighbour = useMemo(() => QUIZZES.find((x) => x.skill === q.skill && x.id !== q.id && x.kind !== 'order'), [q]);
  const lesson = lessonForSkill(q.skill);
  const answered = result !== null;
  const canSubmit = q.kind === 'order' || (q.kind === 'fill' ? fill.trim() !== '' : picked.length > 0);

  return (
    <article className="quiz card" aria-labelledby={`qt-${q.id}`}>
      <header className="quiz-head">
        <span className="tag">{KIND_LABEL[q.kind]}</span>
        <span className="tag tag-soft">{skill(q.skill).title}</span>
        <span className="tag tag-soft">niveau {q.level}</span>
        {q.source && <SourceChip s={q.source} />}
      </header>
      <h3 id={`qt-${q.id}`} className="quiz-prompt"><Rich text={q.prompt} /></h3>
      {q.code && (
        <>
          <CodeView code={q.code} />
          {q.kind === 'output' && <p className="hint-line">my_putchar, my_put_nbr et my_putstr sont fournies (comme au Day 03). Dans les réponses, <code className="ic">$</code> marque un retour à la ligne, comme <code className="ic">cat -e</code>.</p>}
        </>
      )}

      {q.kind === 'order' ? (
        <ol className="order-list">
          {order.map((lineIdx, pos) => (
            <li key={lineIdx} className={answered ? (q.lines![lineIdx] === q.lines![pos] ? 'ok' : 'bad') : ''}>
              <code className="order-line">{q.lines![lineIdx] || ' '}</code>
              {!answered && (
                <span className="order-btns">
                  <button type="button" className="icon-btn" aria-label={`Monter la ligne ${pos + 1}`} disabled={pos === 0} onClick={() => setOrder((o) => { const n = [...o]; [n[pos - 1], n[pos]] = [n[pos], n[pos - 1]]; return n; })}>↑</button>
                  <button type="button" className="icon-btn" aria-label={`Descendre la ligne ${pos + 1}`} disabled={pos === order.length - 1} onClick={() => setOrder((o) => { const n = [...o]; [n[pos + 1], n[pos]] = [n[pos], n[pos + 1]]; return n; })}>↓</button>
                </span>
              )}
            </li>
          ))}
        </ol>
      ) : q.kind === 'fill' ? (
        <label className="fill">
          <span className="sr-only">Ta réponse</span>
          <input
            type="text"
            value={fill}
            disabled={answered}
            onChange={(e) => setFill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && fill.trim() && !answered) submit(); }}
            placeholder="Ta réponse"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      ) : (
        <fieldset className="options">
          <legend className="sr-only">Réponses possibles</legend>
          {options.map((o) => {
            const sel = picked.includes(o.i);
            let state = '';
            if (answered) state = o.correct ? 'ok' : sel ? 'bad' : '';
            return (
              <label key={o.i} className={`option ${sel ? 'sel' : ''} ${state}`}>
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={`q-${q.id}-${seed}`}
                  checked={sel}
                  disabled={answered}
                  onChange={() => setPicked((p) => (multi ? (p.includes(o.i) ? p.filter((x) => x !== o.i) : [...p, o.i]) : [o.i]))}
                />
                {q.kind === 'output' ? <pre className="opt-out">{catE(o.text)}</pre> : <span><Rich text={o.text} /></span>}
              </label>
            );
          })}
        </fieldset>
      )}

      {!answered && (
        <div className="row gap">
          <button type="button" className="btn primary" disabled={!canSubmit} onClick={() => submit()}>Valider</button>
          <button type="button" className="btn ghost" onClick={() => submit(true)}>Je ne sais pas</button>
        </div>
      )}

      {answered && (
        <div className={`feedback ${result!.correct ? 'ok' : 'bad'}`} role="status">
          <p className="fb-title">{result!.correct ? 'Juste.' : result!.dontKnow ? 'Pas de souci : voici la réponse.' : q.kind === 'order' ? `Pas encore : ${Math.round(result!.score * order.length)} ligne(s) sur ${order.length} à la bonne place.` : 'Pas tout à fait.'}</p>
          {!result!.correct && !multi && picked.length === 1 && q.options?.[picked[0]]?.why && (
            <p><strong>Ta réponse :</strong> <Rich text={q.options[picked[0]].why!} /></p>
          )}
          {!result!.correct && multi && (
            <ul className="list">
              {(q.options ?? []).map((o, i) => {
                const sel = picked.includes(i);
                if (sel === !!o.correct || !o.why) return null;
                return <li key={i}>{sel ? 'Coché à tort' : 'Oublié'} : « <Rich text={o.text} /> » — <Rich text={o.why} /></li>;
              })}
            </ul>
          )}
          {!result!.correct && q.kind === 'fill' && <p><strong>Réponse attendue :</strong> <code className="ic">{q.answers![0]}</code></p>}
          {!result!.correct && q.kind === 'order' && (
            <CodeView code={q.lines!.join('\n')} lang={q.lines!.some((l) => l.includes(';')) ? 'c' : 'text'} caption="Ordre correct" />
          )}
          <p><Rich text={q.explain} /></p>
          <div className="row gap wrap">
            {onNext && <button type="button" className="btn primary" onClick={() => onNext({ quizId: q.id, correct: result!.correct, dontKnow: result!.dontKnow })}>{nextLabel}</button>}
            {!result!.correct && <button type="button" className="btn" onClick={retry}>Nouvelle tentative</button>}
            {!result!.correct && neighbour && (
              <button type="button" className="btn" onClick={() => navigate({ page: 'quiz', ids: [neighbour.id], title: 'Question voisine', context: 'review' })}>Question voisine</button>
            )}
            {!result!.correct && lesson && (
              <button type="button" className="btn ghost" onClick={() => navigate({ page: 'lesson', id: lesson.id })}>Revoir le cours : {lesson.title}</button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export function QuizSession({ ids, context, onFinish, title }: { ids: string[]; context: Context; onFinish?: (o: QuizOutcome[]) => void; title?: string }) {
  const [idx, setIdx] = useState(0);
  const [outcomes, setOutcomes] = useState<QuizOutcome[]>([]);
  const qs = ids.map(getQuiz).filter(Boolean) as Quiz[];
  if (!qs.length) return <p>Aucune question.</p>;
  if (idx >= qs.length) {
    const ok = outcomes.filter((o) => o.correct).length;
    const wrongSkills = [...new Set(outcomes.filter((o) => !o.correct).map((o) => getQuiz(o.quizId)!.skill))];
    return (
      <section className="card">
        <h3>{title ?? 'Bilan'} : {ok} / {qs.length}</h3>
        {wrongSkills.length > 0 ? (
          <>
            <p>À retravailler :</p>
            <div className="row gap wrap">
              {wrongSkills.map((s) => {
                const l = lessonForSkill(s);
                return l ? <button key={s} type="button" className="btn" onClick={() => navigate({ page: 'lesson', id: l.id })}>{l.title}</button> : null;
              })}
            </div>
          </>
        ) : (
          <p>Tout est juste. Passe à un exercice de code pour le prouver en pratique.</p>
        )}
        <div className="row gap">
          <button type="button" className="btn" onClick={() => { setIdx(0); setOutcomes([]); }}>Refaire la série</button>
        </div>
      </section>
    );
  }
  return (
    <div className="quiz-session">
      <p className="progress-label" aria-live="polite">Question {idx + 1} / {qs.length}</p>
      <QuizCard
        key={qs[idx].id + idx}
        q={qs[idx]}
        context={context}
        nextLabel={idx + 1 < qs.length ? 'Question suivante' : 'Voir le bilan'}
        onNext={(o) => {
          const next = [...outcomes, o];
          setOutcomes(next);
          setIdx(idx + 1);
          if (idx + 1 >= qs.length) onFinish?.(next);
        }}
      />
    </div>
  );
}
