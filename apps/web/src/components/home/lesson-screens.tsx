"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BADGES,
  allLessons,
  getLesson,
  type BadgeDef,
  type ChoiceExercise,
  type Exercise,
  type ModuleId,
  type TeachCard,
} from "@neuronaut/core";
import { BadgeGlyph } from "@/components/badge";
import type { LessonWindowProps } from "@/components/home/lesson-steps";
import "@/app/home-screens.css";

/* ------------------------------------------------------------------ */
/* Data (real content from packages/core)                              */
/* ------------------------------------------------------------------ */

const LESSON = getLesson("f1-what-is-ai");
const LESSON_TOTAL = LESSON?.exercises.length ?? 0;
const IDEAS: TeachCard[] = (LESSON?.cards ?? []).slice(0, 2);

function findChoice(exercises: Exercise[]): { ex: ChoiceExercise; no: number } | null {
  const i = exercises.findIndex((e) => e.kind === "choice");
  const ex = exercises[i];
  return ex && ex.kind === "choice" ? { ex, no: i + 1 } : null;
}
const CHOICE = findChoice(LESSON?.exercises ?? []);

function promptOf(e: Exercise): string {
  return e.kind === "truefalse" ? e.statement : e.prompt;
}

const MODULE_COLOR: Record<ModuleId, string> = {
  foundations: "var(--m1)",
  toolkit: "var(--m2)",
  ethics: "var(--m3)",
};

const DUE = ["in 1 day", "in 3 days", "in 7 days"];
const REVIEW_ROWS = (["foundations", "toolkit", "ethics"] as ModuleId[])
  .flatMap((mid) => {
    const first = allLessons.find((l) => l.moduleId === mid)?.exercises[0];
    return first ? [{ key: mid, color: MODULE_COLOR[mid], prompt: promptOf(first) }] : [];
  })
  .slice(0, 3);

const TIMELINE = ["1d", "3d", "7d", "16d"];

const SHOWN_BADGES = ["first-step", "foundations", "toolkit", "ethics", "graduate", "flawless"];
const EARNED_BADGES = new Set(["first-step", "foundations", "toolkit", "ethics"]);
const BADGE_LIST = SHOWN_BADGES.flatMap((id) => {
  const b = BADGES.find((x) => x.id === id);
  return b ? [b] : [];
});

const CONFETTI_COLORS = ["#c2410c", "#1f9d55", "#0a66c2", "#f2b600"];
const CONFETTI = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + 0.4;
  const dist = 64 + (i % 3) * 24;
  return {
    x: Math.round(Math.cos(angle) * dist),
    y: Math.round(Math.sin(angle) * dist) - 14,
    rotate: (i * 83) % 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  };
});

/* ------------------------------------------------------------------ */
/* Demo timing                                                         */
/* ------------------------------------------------------------------ */

const READ_DELAYS = [2500];
const ANSWER_DELAYS = [1500, 650, 350];
const REVIEW_DELAYS = [300, 300, 300, 300];
const BADGE_DELAYS = [350, 300];

/**
 * Steps through `delays` one timer at a time while `playing`.
 * Timers are cleared when playing stops, so the frame freezes; resuming continues.
 * Reduced motion jumps straight to the final stage.
 */
function useDemo(delays: readonly number[], playing: boolean, reduced: boolean) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!playing || reduced || stage >= delays.length) return;
    const t = window.setTimeout(() => setStage(stage + 1), delays[stage]);
    return () => window.clearTimeout(t);
  }, [stage, delays, playing, reduced]);
  return [reduced ? delays.length : stage, setStage] as const;
}

/** `onNext` moves the tour to the next step (tabs on desktop, next card on phones). */
type ScreenProps = { playing: boolean; reduced: boolean; compact: boolean; onNext?: () => void };

/* ------------------------------------------------------------------ */
/* Screen 0: Read                                                      */
/* ------------------------------------------------------------------ */

function IdeaFace({ n, card, back }: { n: number; card: TeachCard | undefined; back?: boolean }) {
  return (
    <div className={back ? "lw-face lw-face-back" : "lw-face"}>
      <span className="lw-kicker">Idea {n} of 2</span>
      <p className="lw-idea-title">{card?.title ?? ""}</p>
      <p className="lw-idea-body">{card?.body ?? ""}</p>
    </div>
  );
}

function ReadScreen({ playing, reduced, onNext }: ScreenProps) {
  const [stage, setStage] = useDemo(READ_DELAYS, playing, reduced);
  const flipped = stage >= 1;
  return (
    <div className="lw-read">
      <div className="lw-flip">
        <div
          className="lw-flip-inner"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <IdeaFace n={1} card={IDEAS[0]} />
          <IdeaFace n={2} card={IDEAS[1]} back />
        </div>
      </div>
      <div className="lw-foot">
        <span className="lw-dots" aria-hidden>
          <i data-on={!flipped} />
          <i data-on={flipped} />
        </span>
        {/* Idea 1: flip to idea 2. Idea 2: there is no third idea, so move on to the questions. */}
        <button type="button" className="lw-pill" onClick={() => (flipped ? onNext?.() : setStage(1))}>
          {flipped ? "Start questions" : "Next idea"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 1: Answer                                                    */
/* ------------------------------------------------------------------ */

function AnswerScreen({ playing, reduced, onNext }: ScreenProps) {
  const [stage] = useDemo(ANSWER_DELAYS, playing, reduced);
  if (!CHOICE) return null;
  const { ex, no } = CHOICE;
  const found = stage >= 3;
  const col = ex.answer % 2;
  const row = ex.answer >= 2 ? 1 : 0;

  const cursor: CSSProperties = {
    left: stage >= 1 ? (col ? "75%" : "25%") : "96%",
    top: stage >= 1 ? (row ? "75%" : "25%") : "96%",
    opacity: stage >= 1 && !found ? 0.8 : 0,
    transform: `translate(-50%, -50%) scale(${stage === 2 ? 0.78 : 1})`,
  };

  return (
    <div className="lw-answer">
      <div>
        <span className="lw-kicker">
          Question {no} of {LESSON_TOTAL}
        </span>
        <p className="lw-q" style={{ marginTop: 6 }}>
          {ex.prompt}
        </p>
      </div>
      <div className="lw-opts">
        {ex.options.map((option, i) => (
          <button
            key={option}
            type="button"
            tabIndex={-1}
            className={found && i === ex.answer ? "lw-opt lw-opt-ok" : "lw-opt"}
          >
            {option}
          </button>
        ))}
        <span className="lw-cursor" style={cursor} aria-hidden />
      </div>
      {found && (
        <motion.div
          className="lw-explain"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {ex.explain}
        </motion.div>
      )}
      <div className="lw-foot">
        <button
          type="button"
          className="lw-pill"
          disabled={!found}
          onClick={() => onNext?.()}
          style={{ opacity: found ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 2: Review                                                    */
/* ------------------------------------------------------------------ */

function ReviewScreen({ playing, reduced, onNext }: ScreenProps) {
  const [filled] = useDemo(REVIEW_DELAYS, playing, reduced);
  const fraction = filled <= 1 ? 0 : (filled - 1) / (TIMELINE.length - 1);

  return (
    <div className="lw-review">
      <span className="lw-kicker">Coming back</span>
      <div className="lw-tl" aria-hidden>
        <span className="lw-tl-line" />
        <span className="lw-tl-fill" style={{ width: `calc((100% - 14px) * ${fraction})` }} />
        {TIMELINE.map((label, i) => (
          <span key={label} className="lw-tl-step">
            <span className="lw-tl-dot" data-on={i < filled} />
            <span className="lw-tl-label">{label}</span>
          </span>
        ))}
      </div>
      <div className="lw-rows">
        {REVIEW_ROWS.map((row, i) => (
          <div key={row.key} className="lw-row">
            <span className="lw-row-dot" style={{ background: row.color }} />
            <span className="lw-row-text">{row.prompt}</span>
            <span className="lw-due">{DUE[i]}</span>
          </div>
        ))}
      </div>
      <div className="lw-foot">
        <button type="button" className="lw-pill lw-pill-block" onClick={() => onNext?.()}>
          Review now
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 3: Badge                                                     */
/* ------------------------------------------------------------------ */

function BadgeCell({
  def,
  earned,
  pop,
  popped,
  reduced,
  size,
}: {
  def: BadgeDef;
  earned: boolean;
  pop: boolean;
  popped: boolean;
  reduced: boolean;
  size: number;
}) {
  const glyph = (
    <span className={pop && popped && !reduced ? "lw-medal lw-shine" : "lw-medal"}>
      <BadgeGlyph glyph={def.glyph} earned={earned} size={size} />
    </span>
  );
  const label = <span className="lw-bname">{def.name}</span>;

  if (!pop) {
    return (
      <div className="lw-cell">
        {glyph}
        {label}
      </div>
    );
  }
  return (
    <motion.div
      className="lw-cell"
      initial={reduced ? false : { scale: 0.3, opacity: 0 }}
      animate={{ scale: popped ? 1 : 0.3, opacity: popped ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 16 }}
    >
      {glyph}
      {label}
    </motion.div>
  );
}

function BadgeScreen({ playing, reduced, compact }: ScreenProps) {
  const [stage] = useDemo(BADGE_DELAYS, playing, reduced);
  const [xp, setXp] = useState(0);

  // Count-up 0 -> 100 over 800ms (25 ticks of 4 XP).
  useEffect(() => {
    if (!playing || reduced) return;
    const tick = window.setInterval(() => setXp((v) => Math.min(100, v + 4)), 32);
    const stop = window.setTimeout(() => window.clearInterval(tick), 800);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(stop);
    };
  }, [playing, reduced]);

  const xpShown = reduced ? 100 : xp;
  const popped = stage >= 1;
  const burst = !reduced && stage >= 2;
  const size = compact ? 36 : 44;

  return (
    <div className="lw-badge">
      <div className="lw-badge-head">
        <p className="lw-h-lg">Lesson complete</p>
        <span className="lw-xp">+{xpShown} XP</span>
      </div>
      <div className="lw-bgrid">
        {BADGE_LIST.map((def) => (
          <BadgeCell
            key={def.id}
            def={def}
            earned={EARNED_BADGES.has(def.id)}
            pop={def.id === "ethics"}
            popped={popped}
            reduced={reduced}
            size={size}
          />
        ))}
        {burst && (
          <span className="lw-confetti" aria-hidden>
            {CONFETTI.map((c, i) => (
              <motion.span
                key={i}
                className="lw-conf"
                style={{ background: c.color }}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: c.x, y: c.y, rotate: c.rotate, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            ))}
          </span>
        )}
      </div>
      <div className="lw-foot">
        <Link className="lw-pill" href={`/lesson/${allLessons[0].id}`}>
          Start lesson 1 ›
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Window                                                              */
/* ------------------------------------------------------------------ */

const SCREENS = [ReadScreen, AnswerScreen, ReviewScreen, BadgeScreen] as const;

export function LessonWindow({ step, playing, reduced, compact = false, fit = "fill", onNext }: LessonWindowProps) {
  const Screen = SCREENS[step];
  const classes = ["lw-window", fit === "auto" ? "lw-auto" : "lw-fill", compact ? "lw-compact" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="lw-bar">
        <span className="lw-bar-title">Lesson 1 · What counts as AI?</span>
        <span className="lw-prog" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className="lw-seg" data-on={i <= step} />
          ))}
        </span>
      </div>
      <div className="lw-body">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="lw-screen"
            initial={{ opacity: 0, x: reduced ? 0 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : -12 }}
            transition={{ duration: reduced ? 0.15 : 0.28, ease: "easeOut" }}
          >
            <Screen playing={playing} reduced={reduced} compact={compact} onNext={onNext} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
