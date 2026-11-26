"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";
import { allLessons, getLesson, type ChoiceExercise } from "@neuronaut/core";

/**
 * Three real questions from the course. The first is the verification lab's AI answer, whose
 * suspicious phrases get marked in orange pen once the visitor has answered (never before:
 * marking them first would give the answer away).
 */
const VERIFY_ID = "t3-verify";
const SOURCES: { lessonId: string; exId: string; marks?: string[]; note?: string }[] = [
  {
    lessonId: VERIFY_ID,
    exId: "q1",
    marks: ["47% faster", "(Johnson & Lee, Journal of Teen Sleep Science, 2019, p. 212)"],
    note: "Does this journal exist? Search it before you quote it.",
  },
  { lessonId: "f3-how-llms-work", exId: "q1" },
  { lessonId: "e1-integrity", exId: "q1" },
];
const QUESTIONS = SOURCES.map(({ lessonId, exId, marks, note }) => {
  const lesson = getLesson(lessonId)!;
  const ex = lesson.exercises.find((e) => e.id === exId) as ChoiceExercise;
  return {
    lessonId,
    source: `Lesson ${allLessons.findIndex((l) => l.id === lessonId) + 1}, ${lesson.title}`,
    ex,
    marks: marks ?? [],
    note,
  };
});
const KEYS = ["A", "B", "C", "D", "E", "F"];

/** Split text into plain and marked runs, in order. */
function withMarks(text: string, marks: string[]) {
  const out: { t: string; mark: boolean }[] = [];
  let rest = text;
  for (const m of marks) {
    const i = rest.indexOf(m);
    if (i < 0) continue;
    if (i > 0) out.push({ t: rest.slice(0, i), mark: false });
    out.push({ t: m, mark: true });
    rest = rest.slice(i + m.length);
  }
  if (rest) out.push({ t: rest, mark: false });
  return out;
}

interface Flyer {
  id: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/** The hero's proof: a real AI answer from the course, checked right here. */
export function HeroQuiz() {
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const flyId = useRef(0);
  const reduced = useReducedMotion();

  const { lessonId, source, ex, marks, note } = QUESTIONS[qi];
  const answered = pick !== null;
  const right = answered && pick === ex.answer;
  const claim = ex.passage ?? ex.prompt;

  const choose = (i: number, el: HTMLElement) => {
    if (answered) return;
    setPick(i);
    if (i !== ex.answer || reduced) return;
    const target = document.querySelector<HTMLElement>(".site-header [data-xp-target]");
    if (!target) return;
    const a = el.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    if (b.width === 0) return;
    flyId.current += 1;
    setFlyer({ id: flyId.current, from: { x: a.left + a.width / 2 - 34, y: a.top }, to: { x: b.left, y: b.top } });
  };
  const next = () => {
    setQi((qi + 1) % QUESTIONS.length);
    setPick(null);
  };

  return (
    <div className="pf" data-state={answered ? (right ? "right" : "wrong") : "idle"} role="group" aria-labelledby="pf-q">
      <figure className="pf-sheet" key={qi}>
        <figcaption className="pf-who">{ex.passage ? "A chatbot answered" : source}</figcaption>
        <blockquote className={ex.passage ? "pf-claim" : "pf-claim pf-claim-q"}>
          {withMarks(claim, answered ? marks : []).map((r, i) =>
            r.mark ? (
              <mark key={i} className="pf-mark">
                {r.t}
              </mark>
            ) : (
              <span key={i}>{r.t}</span>
            ),
          )}
        </blockquote>
        {answered && note && <p className="pf-note">{note}</p>}

      </figure>

      <h2 id="pf-q" className={ex.passage ? "pf-q" : "visually-hidden"}>
        {ex.prompt}
      </h2>
      <ol className="pf-opts" key={`o${qi}`}>
        {ex.options.map((o, i) => (
          <li key={i}>
            <button
              type="button"
              className="pf-opt"
              disabled={answered}
              data-picked={pick === i}
              data-correct={answered && i === ex.answer}
              onClick={(e) => choose(i, e.currentTarget)}
            >
              <span className="pf-key" aria-hidden>
                {answered && i === ex.answer ? <Check size={14} strokeWidth={3} /> : answered && pick === i ? <X size={14} strokeWidth={3} /> : KEYS[i]}
              </span>
              <span>{o}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="pf-foot">
        <p className="pf-explain" aria-live="polite">
          {answered ? (
            <>
              <strong>{right ? "Nice catch." : "Not quite."}</strong> {ex.explain}
            </>
          ) : (
            <span className="pf-src">{source}. Pick an answer.</span>
          )}
        </p>
        <div className="pf-links">
          {answered && lessonId === VERIFY_ID && (
            <Link className="btn-secondary" href={`/lesson/${VERIFY_ID}`}>
              See how to spot it
            </Link>
          )}
          <button type="button" className="btn-secondary" onClick={next}>
            Try another
          </button>
        </div>
      </div>

      {flyer &&
        createPortal(
          <AnimatePresence>
            {flyer && (
              <motion.span
                key={flyer.id}
                className="xp-flyer"
                aria-hidden
                initial={{ x: flyer.from.x, y: flyer.from.y, scale: 0.6, opacity: 0 }}
                animate={{
                  x: [flyer.from.x, flyer.from.x + (flyer.to.x - flyer.from.x) * 0.35, flyer.to.x],
                  y: [flyer.from.y, Math.min(flyer.from.y, flyer.to.y) - 60, flyer.to.y],
                  scale: [0.6, 1.1, 0.7],
                  opacity: [0, 1, 0.9],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => setFlyer(null)}
              >
                <Zap size={14} strokeWidth={2.6} /> +20 XP
              </motion.span>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
