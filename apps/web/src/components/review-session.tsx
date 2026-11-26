"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarClock, Repeat2 } from "lucide-react";
import { completeReview, dayKey, dueReviewKeys, resolveReviewKey } from "@neuronaut/core";
import { Pip } from "./brand";
import { useProgress } from "./progress";
import { Runner, type RunItem } from "./runner";

export function ReviewSession() {
  const { state, setState, ready } = useProgress();
  const [items, setItems] = useState<RunItem[] | null>(null);
  const [earned, setEarned] = useState<number | null>(null);

  const due = ready ? dueReviewKeys(state, dayKey()) : [];
  const waiting = Object.values(state.review).filter((r) => !due.includes(r.key));
  const nextDue = waiting.map((r) => r.due).sort()[0];

  if (items) {
    return (
      <Runner
        items={items}
        exitHref="/review"
        onFinish={(results) => {
          const r = completeReview(state, results.map((x) => ({ key: x.key, correct: !x.retried })));
          setState(r.state);
          setEarned(r.events.reduce((n, e) => n + (e.type === "xp" ? e.amount : 0), 0));
          setItems(null);
        }}
      />
    );
  }

  return (
    <div className="wrap review-page">
      <header className="page-head">
        <h1>Review</h1>
        <p className="lede">
          Questions you miss come back after 0, 1, 3, 7 and 16 days. Answer one right on the first try five times in a row and it&rsquo;s mastered.
        </p>
      </header>

      <div className="review-panel">
        <Pip mood={due.length ? "think" : "happy"} size={112} />
        {earned !== null && <p className="review-earned num">Review done: +{earned} XP</p>}
        {!ready ? null : due.length > 0 ? (
          <>
            <h2 className="num">
              {due.length} question{due.length > 1 ? "s" : ""} ready for review
            </h2>
            <button
              type="button"
              className="btn btn-spark btn-lg"
              onClick={() =>
                setItems(
                  due.slice(0, 10).flatMap((key) => {
                    const r = resolveReviewKey(key);
                    return r ? [{ key, exercise: r.exercise }] : [];
                  }),
                )
              }
            >
              <Repeat2 size={20} aria-hidden /> Start review
            </button>
          </>
        ) : (
          <>
            <h2>Nothing to review right now</h2>
            <p>
              {waiting.length > 0 && nextDue ? (
                <>
                  <CalendarClock size={16} aria-hidden /> {waiting.length} question{waiting.length > 1 ? "s" : ""} will be back on{" "}
                  {new Date(`${nextDue}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}.
                </>
              ) : (
                "Any question you miss in a lesson will show up here."
              )}
            </p>
            <Link className="btn btn-ghost btn-lg" href="/learn">
              Keep learning <ArrowRight size={20} aria-hidden />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
