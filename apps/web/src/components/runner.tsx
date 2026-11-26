"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Flame, X, XCircle } from "lucide-react";
import Link from "next/link";
import { checkAnswer, type Answer, type Exercise } from "@neuronaut/core";
import { ExerciseView, exercisePrompt } from "./exercise";

export interface RunItem {
  key: string;
  exercise: Exercise;
}

export interface RunResult {
  key: string;
  /** Answered right at some point in the run. */
  correct: boolean;
  /** Missed at least once before that (or never got it). */
  retried: boolean;
}

export interface RunMeta {
  ms: number;
  bestCombo: number;
}

const PRAISE = ["Nice work!", "Exactly right.", "You've got it.", "Sharp thinking.", "Correct!"];
/** A missed question comes back at the end of the run, at most this many extra times. */
const MAX_REQUEUE = 2;

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

/**
 * Runs a set of questions the way learning apps do: pick, Check, and a feedback sheet.
 * A miss shows the right answer and why, then the question comes back at the end of the run.
 */
export function Runner({
  items,
  exitHref,
  onFinish,
  xp,
}: {
  items: RunItem[];
  exitHref: string;
  onFinish: (r: RunResult[], meta: RunMeta) => void;
  /** XP shown on a right answer, matching what the engine will award. */
  xp?: { first: number; retry: number };
}) {
  const [queue, setQueue] = useState<RunItem[]>(items);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [misses, setMisses] = useState<Record<string, number>>({});
  const [done, setDone] = useState<Record<string, RunResult>>({});
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const started = useRef(0);
  useEffect(() => {
    started.current = performance.now();
  }, []);

  const item = queue[i];
  const missedBefore = misses[item.key] ?? 0;
  const onChange = useCallback((a: Answer | null) => setAnswer(a), []);

  const check = useCallback(() => {
    if (!answer || verdict) return;
    const ok = checkAnswer(item.exercise, answer);
    setVerdict(ok ? "right" : "wrong");
    buzz(ok ? 20 : [30, 40, 30]);
    if (ok) {
      const firstTry = missedBefore === 0;
      const c = firstTry ? combo + 1 : 0;
      setCombo(c);
      setBest((b) => Math.max(b, c));
      setDone((d) => ({ ...d, [item.key]: { key: item.key, correct: true, retried: !firstTry } }));
    } else {
      setCombo(0);
      const n = missedBefore + 1;
      setMisses((m) => ({ ...m, [item.key]: n }));
      // Out of retries: it counts as missed, and Review will bring it back on a later day.
      if (n > MAX_REQUEUE) setDone((d) => ({ ...d, [item.key]: { key: item.key, correct: false, retried: true } }));
    }
  }, [answer, verdict, item, missedBefore, combo]);

  const next = useCallback(() => {
    let q = queue;
    if (verdict === "wrong" && (misses[item.key] ?? 0) <= MAX_REQUEUE) {
      q = [...queue, item];
      setQueue(q);
    }
    if (i + 1 >= q.length) {
      const results = items.map((it) => done[it.key] ?? { key: it.key, correct: false, retried: true });
      onFinish(results, { ms: performance.now() - started.current, bestCombo: best });
      return;
    }
    setI(i + 1);
    setAnswer(null);
    setVerdict(null);
  }, [queue, verdict, misses, item, i, items, done, best, onFinish]);

  // Enter checks, then continues (anywhere on the page, like Duolingo on the web).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return;
      e.preventDefault();
      if (verdict) next();
      else check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [verdict, next, check]);

  const solved = Object.keys(done).length;
  const progress = solved / items.length;
  const isRepeat = i >= items.length;
  const gain = xp ? (missedBefore ? xp.retry : xp.first) : 0;

  return (
    <div className="runner">
      <div className="runner-top wrap-narrow">
        <Link href={exitHref} className="icon-btn" aria-label="Quit">
          <X aria-hidden />
        </Link>
        <div
          className="runner-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-valuenow={solved}
          aria-label={`${solved} of ${items.length} questions done`}
        >
          <span style={{ width: `${Math.max(progress * 100, 3)}%` }} />
        </div>
        <span className="runner-combo num" data-on={combo >= 2} aria-live="polite">
          {combo >= 2 ? (
            <>
              <Flame size={16} aria-hidden /> {combo} in a row
            </>
          ) : null}
        </span>
      </div>

      <div className="runner-body wrap-narrow" key={`${item.key}-${i}`} data-verdict={verdict ?? undefined}>
        {isRepeat ? <p className="runner-again">Let&rsquo;s try this one again</p> : null}
        <h1 className="runner-prompt">{exercisePrompt(item.exercise)}</h1>
        <ExerciseView exercise={item.exercise} seed={item.key} locked={verdict !== null} reveal={verdict === "wrong"} onChange={onChange} />
      </div>

      <div className={`runner-foot ${verdict ? `is-${verdict}` : ""}`}>
        <div className="wrap-narrow runner-foot-row">
          <div className="visually-hidden" aria-live="assertive">
            {verdict === "right" ? "Correct." : verdict === "wrong" ? `Incorrect. ${answerText(item.exercise)}` : ""}
          </div>
          {verdict === null && (
            <>
              <p className="runner-hint">{answer ? "Press Check, or Enter." : keyHint(item.exercise)}</p>
              <button type="button" className="btn btn-spark btn-lg runner-cta" disabled={!answer} onClick={check}>
                Check
              </button>
            </>
          )}
          {verdict === "right" && (
            <>
              <div className="feedback">
                <CheckCircle2 className="fb-icon" aria-hidden />
                <div>
                  <p className="fb-title">
                    {PRAISE[i % PRAISE.length]}
                    {gain > 0 ? <span className="fb-xp num"> +{gain} XP</span> : null}
                  </p>
                  <p className="fb-explain">{item.exercise.explain}</p>
                </div>
              </div>
              <button type="button" className="btn btn-leaf btn-lg runner-cta" onClick={next} autoFocus>
                Continue
              </button>
            </>
          )}
          {verdict === "wrong" && (
            <>
              <div className="feedback">
                <XCircle className="fb-icon" aria-hidden />
                <div>
                  <p className="fb-title">Not quite</p>
                  <p className="fb-answer">{answerText(item.exercise)}</p>
                  <p className="fb-explain">{item.exercise.explain}</p>
                  {(misses[item.key] ?? 0) <= MAX_REQUEUE ? <p className="fb-note">This one will come back at the end.</p> : null}
                </div>
              </div>
              <button type="button" className="btn btn-lg runner-cta btn-wrong" onClick={next} autoFocus>
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** The right answer in words. */
export function answerText(ex: Exercise): string {
  switch (ex.kind) {
    case "choice":
      return `Correct answer: ${ex.options[ex.answer]}`;
    case "truefalse":
      return `Correct answer: ${ex.answer ? "True" : "False"}`;
    case "order":
      return `Correct order: ${ex.answer.map((k) => ex.tiles[k]).join(" → ")}`;
    case "match":
      return `Correct pairs:\n${ex.pairs.map(([a, b]) => `${a} = ${b}`).join("\n")}`;
  }
}

function keyHint(ex: Exercise): string {
  switch (ex.kind) {
    case "choice":
      return "Pick an answer. Keys 1 to 4 work too.";
    case "truefalse":
      return "Pick True or False. Keys 1 and 2 work too.";
    case "order":
      return "Tap the tiles in order.";
    case "match":
      return "Match each item with its pair.";
  }
}
