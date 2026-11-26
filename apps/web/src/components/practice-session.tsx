"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Dumbbell, TrendingDown, TrendingUp } from "lucide-react";
import {
  PRACTICE_SIZE,
  PRACTICE_XP,
  allLessons,
  completePractice,
  dayKey,
  masteryLabel,
  practiceQueue,
  resolveReviewKey,
} from "@neuronaut/core";
import { Pip } from "./brand";
import { useProgress } from "./progress";
import { Runner, type RunItem } from "./runner";

const pct = (p: number) => `${Math.round(p * 100)}%`;
const title = (id: string) => allLessons.find((l) => l.id === id)?.title ?? id;

/** Adaptive practice: questions from the lessons you know least, chosen by the mastery model. */
export function PracticeSession() {
  const { state, setState, ready } = useProgress();
  const [items, setItems] = useState<RunItem[] | null>(null);
  const [changes, setChanges] = useState<{ id: string; from: number; to: number }[] | null>(null);

  const queue = ready ? practiceQueue(state, dayKey()) : [];
  const focus = [...new Set(queue.map((q) => q.lessonId))];

  if (items) {
    return (
      <Runner
        items={items}
        exitHref="/practice"
        xp={{ first: PRACTICE_XP, retry: 0 }}
        onFinish={(results) => {
          const r = completePractice(state, results.map((x) => ({ key: x.key, correct: !x.retried })));
          setState(r.state);
          setChanges(Object.entries(r.before).map(([id, from]) => ({ id, from, to: r.state.mastery[id] ?? from })));
          setItems(null);
        }}
      />
    );
  }

  return (
    <div className="wrap review-page">
      <header className="page-head">
        <h1>Practice</h1>
        <p className="lede">
          {PRACTICE_SIZE} questions picked from the lessons you know least. Each answer updates your mastery estimate, and a miss
          goes into Review.
        </p>
      </header>

      <div className="review-panel">
        <Pip mood={changes ? "happy" : "think"} size={112} />
        {changes ? (
          <div className="practice-result" role="status">
            <h2>Practice done</h2>
            <ul className="mastery-changes">
              {changes.map((c) => (
                <li key={c.id}>
                  <span>{title(c.id)}</span>
                  <span className="num" data-up={c.to >= c.from}>
                    {c.to >= c.from ? <TrendingUp size={16} aria-hidden /> : <TrendingDown size={16} aria-hidden />} {pct(c.from)} →{" "}
                    {pct(c.to)} <span className="muted">({masteryLabel(c.to)})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {!ready ? null : queue.length ? (
          <>
            <h2>{changes ? "Another round?" : "Today's set"}</h2>
            <p>Focus: {focus.map(title).join(", ")}.</p>
            <button
              type="button"
              className="btn btn-spark btn-lg"
              onClick={() => {
                setChanges(null);
                setItems(queue.flatMap((q) => {
                  const r = resolveReviewKey(q.key);
                  return r ? [{ key: q.key, exercise: r.exercise }] : [];
                }));
              }}
            >
              <Dumbbell size={20} aria-hidden /> Start practice
            </button>
            <p className="muted small">
              <Link href="/how-we-built-it#mastery">How the questions are chosen</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Finish a lesson to unlock practice</h2>
            <p>Practice only uses lessons you have finished, so it never spoils a new one.</p>
            <Link className="btn btn-spark btn-lg" href="/learn">
              Go to lessons <ArrowRight size={20} aria-hidden />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
