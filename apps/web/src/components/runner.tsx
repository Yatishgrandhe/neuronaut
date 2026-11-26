"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, RotateCcw, X, XCircle } from "lucide-react";
import Link from "next/link";
import { checkAnswer, type Answer, type Exercise } from "@neuronaut/core";
import { ExerciseView, exercisePrompt } from "./exercise";
import { Pip } from "./brand";

export interface RunItem {
  key: string;
  exercise: Exercise;
}

export interface RunResult {
  key: string;
  correct: boolean;
  retried: boolean;
}

const PRAISE = ["Nice work!", "Exactly right.", "You've got it.", "Sharp thinking.", "Correct!"];

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

/** Runs a sequence of exercises with instant feedback and unlimited retries. */
export function Runner({
  items,
  exitHref,
  onFinish,
  xp,
}: {
  items: RunItem[];
  exitHref: string;
  onFinish: (r: RunResult[]) => void;
  /** XP shown on a right answer, matching what the engine will award. */
  xp?: { first: number; retry: number };
}) {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [results, setResults] = useState<RunResult[]>([]);
  const item = items[i];
  const onChange = useCallback((a: Answer | null) => setAnswer(a), []);

  const check = () => {
    if (!answer) return;
    const ok = checkAnswer(item.exercise, answer);
    setVerdict(ok ? "right" : "wrong");
    buzz(ok ? 20 : [30, 40, 30]);
  };

  const next = () => {
    const done = [...results, { key: item.key, correct: true, retried: attempt > 0 }];
    if (i + 1 >= items.length) {
      onFinish(done);
      return;
    }
    setResults(done);
    setI(i + 1);
    setAnswer(null);
    setVerdict(null);
    setAttempt(0);
  };

  const retry = () => {
    setAttempt(attempt + 1);
    setAnswer(null);
    setVerdict(null);
  };

  const progress = (i + (verdict === "right" ? 1 : 0)) / items.length;

  return (
    <div className="runner" onKeyDown={(e) => {
      if (e.key !== "Enter" || e.target instanceof HTMLButtonElement) return;
      if (verdict === "right") next();
      else if (verdict === "wrong") retry();
      else check();
    }}>
      <div className="runner-top wrap-narrow">
        <Link href={exitHref} className="icon-btn" aria-label="Quit lesson">
          <X aria-hidden />
        </Link>
        <div className="runner-bar" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={i} aria-label="Lesson progress">
          <span style={{ width: `${Math.max(progress * 100, 4)}%` }} />
        </div>
        <span className="runner-count num">
          {i + 1}/{items.length}
        </span>
      </div>

      <div className="runner-body wrap-narrow" key={`${item.key}-${attempt}`}>
        <h1 className="runner-prompt">{exercisePrompt(item.exercise)}</h1>
        <ExerciseView exercise={item.exercise} seed={`${item.key}-${attempt}`} locked={verdict !== null} onChange={onChange} />
      </div>

      <div className={`runner-foot ${verdict ? `is-${verdict}` : ""}`} aria-live="polite">
        <div className="wrap-narrow runner-foot-row">
          {verdict === null && (
            <>
              <div className="runner-hint">
                <Pip mood="idle" size={48} />
                <p>{answer ? "Ready? Press Check." : "Pick an answer, then press Check."}</p>
              </div>
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
                    {PRAISE[(i + attempt) % PRAISE.length]}
                    {xp && (attempt ? xp.retry : xp.first) > 0 ? (
                      <span className="fb-xp num"> +{attempt ? xp.retry : xp.first} XP</span>
                    ) : null}
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
                  <p className="fb-title">Not quite. Have another go.</p>
                  <p className="fb-explain">Hint: {hint(item.exercise)}</p>
                </div>
              </div>
              <button type="button" className="btn btn-lg runner-cta btn-wrong" onClick={retry} autoFocus>
                <RotateCcw size={20} aria-hidden /> Try again
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

/** A nudge that doesn't give the answer away. */
function hint(ex: Exercise): string {
  switch (ex.kind) {
    case "choice":
      return "Re-read the question and rule out the options that sound extreme or too good to be true.";
    case "truefalse":
      return "Watch for absolute words like “always”, “never” and “automatically”.";
    case "order":
      return "Think about what has to happen first, and leave out the step that doesn't belong.";
    case "match":
      return "Start with the pair you're surest about, then work through the rest.";
  }
}
