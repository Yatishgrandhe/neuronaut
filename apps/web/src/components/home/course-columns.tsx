"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { isLessonUnlocked, moduleProgress, modules, type Module } from "@neuronaut/core";
import { useProgress } from "@/components/progress";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Annotation } from "@/components/ui/Annotation";
import { Pip } from "@/components/Pip";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Short card blurbs (two lines). The module pages keep the full description. */
const BLURB: Record<string, string> = {
  foundations: "What AI is, how it learns, and what happens inside a chatbot.",
  toolkit: "Better prompts, smarter follow-ups, and catching fake sources.",
  ethics: "Integrity, citing AI, bias, privacy, and deepfakes.",
};

const MODULE_COLOR: Record<Module["color"], string> = {
  ink: "var(--m1)",
  spark: "var(--m2)",
  leaf: "var(--m3)",
};

/* ---------- Illustrations (code only, decorative) ---------- */

const CANDIDATES = [
  { word: "Paris", pct: 92 },
  { word: "Lyon", pct: 5 },
  { word: "pizza", pct: 1 },
];

function NextWordIll() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const show = inView || Boolean(reduced);
  return (
    <div ref={ref} className="cc-ill" aria-hidden="true">
      <p className="cc-sentence">
        The capital of France is <span className="cc-blank">___</span>
      </p>
      <ul className="cc-cands">
        {CANDIDATES.map((c, i) => (
          <li key={c.word} className="cc-cand">
            <span className="cc-cand-word" data-top={i === 0 ? "true" : "false"}>
              {c.word}
            </span>
            <span className="cc-bar">
              <motion.span
                className="cc-bar-fill"
                data-top={i === 0 ? "true" : "false"}
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: show ? c.pct / 100 : 0 }}
                transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.2 + i * 0.1, ease: EASE }}
              />
            </span>
            <span className="cc-cand-pct">{c.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PromptIll() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const show = inView || Boolean(reduced);
  return (
    <div ref={ref} className="cc-ill" aria-hidden="true">
      <div className="cc-weak">
        <span className="cc-weak-text">explain photosynthesis</span>
        <Annotation type="strike" className="cc-strike" play={show} />
      </div>
      <motion.p
        className="cc-good"
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
        transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.9, ease: EASE }}
      >
        Act as a biology tutor. I&apos;m in 9th grade. Explain photosynthesis in a 3-row table, then quiz me.
      </motion.p>
    </div>
  );
}

function CiteIll() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const show = inView || Boolean(reduced);
  return (
    <div ref={ref} className="cc-ill cc-ill-cite" aria-hidden="true">
      <p className="cc-note-text">
        <b>AI use:</b> I used a chatbot to brainstorm 3 thesis ideas. I picked one and wrote every paragraph myself.
      </p>
      <Annotation type="check" className="cc-check" color="var(--good)" play={show} />
    </div>
  );
}

const ILLUSTRATIONS = [NextWordIll, PromptIll, CiteIll];

/* ---------- Module card ---------- */

function ModuleCard({
  m,
  index,
  state,
  ready,
}: {
  m: Module;
  index: number;
  state: ReturnType<typeof useProgress>["state"];
  ready: boolean;
}) {
  const { done, total } = moduleProgress(state, m.id);
  const ratio = total ? done / total : 0;
  const Illustration = ILLUSTRATIONS[index] ?? NextWordIll;
  const titleId = `cc-m-${m.id}`;

  return (
    <Card variant="plain" as="article" className="cc-card" aria-labelledby={titleId}>
      {index === 0 && (
        <div className="cc-pip" aria-hidden="true">
          <Pip pose="point" size={72} />
        </div>
      )}

      <div className="cc-head">
        <p className="cc-tag">
          <span className="cc-dot" style={{ background: MODULE_COLOR[m.color] }} aria-hidden="true" />
          Module {index + 1}
        </p>
        <h3 id={titleId} className="t-h3">
          {m.title}
        </h3>
        <p className="cc-desc">{BLURB[m.id] ?? m.description}</p>
      </div>

      <Illustration />

      <ol className="cc-list">
        {m.lessons.map((lesson, i) => {
          const isDone = Boolean(state.lessons[lesson.id]);
          const unlocked = isLessonUnlocked(state, lesson.id);
          const status = isDone ? "done" : unlocked ? "next" : "locked";
          const Icon = isDone ? Check : unlocked ? ArrowRight : Lock;
          const srLabel = isDone ? "completed" : unlocked ? "next lesson" : "locked";
          return (
            <li key={lesson.id}>
              <Link href={`/lesson/${lesson.id}`} className="cc-row" data-state={status}>
                <span className="cc-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="cc-title">{lesson.title}</span>
                <span className="cc-min">{lesson.minutes} min</span>
                <span className={`cc-state${ready ? "" : " skel"}`}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="cc-sr">, {srLabel}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="cc-foot">
        <div className="cc-meter" aria-hidden="true">
          <span className="cc-meter-fill" style={{ transform: `scaleX(${ratio})`, background: MODULE_COLOR[m.color] }} />
        </div>
        <div className="cc-foot-row">
          <p className={`cc-count${ready ? "" : " skel"}`}>
            {done} of {total}
          </p>
          <Link className="btn-secondary" href={`/learn/${m.id}`}>
            Start module
          </Link>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Section ---------- */

export function CourseColumns() {
  const { state, ready } = useProgress();
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = modules.length;

  // Distance between two neighbouring cards (card width + gap), used for paging and the active dot.
  const stepOf = useCallback((): number => {
    const el = trackRef.current;
    if (!el || el.children.length < 2) return 0;
    return (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft;
  }, []);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    const step = stepOf();
    if (!el || !step) return;
    setActive(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  }, [stepOf, count]);

  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      const step = stepOf();
      const target = Math.min(count - 1, Math.max(0, i));
      if (!el || !step) return;
      el.scrollTo({ left: target * step, behavior: reduced ? "auto" : "smooth" });
      setActive(target);
    },
    [stepOf, count, reduced],
  );

  return (
    <div className="wrap cc-root">
      <SectionHeader
        id="course-h"
        align="split"
        title="Three modules. Twelve lessons."
        lead="Go in order or start anywhere. Each lesson takes about five minutes."
        action={
          <Link className="btn-secondary" href="/learn">
            Browse all lessons
          </Link>
        }
      />

      <div className="cc-stage">
        <div className="cc-track" ref={trackRef} onScroll={onScroll}>
          {modules.map((m, i) => (
            <motion.div
              key={m.id}
              className="cc-slot"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduced ? 0.3 : 0.6, delay: reduced ? 0 : i * 0.07, ease: EASE }}
            >
              <ModuleCard m={m} index={i} state={state} ready={ready} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="cc-nav">
        <button
          type="button"
          className="cc-arrow"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous module"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div className="cc-dots">
          {modules.map((m, i) => (
            <button
              key={m.id}
              type="button"
              className="cc-dot-btn"
              onClick={() => goTo(i)}
              aria-label={`Show module ${i + 1}: ${m.title}`}
              aria-current={active === i ? "true" : undefined}
            >
              <span className="cc-dot-i" data-on={active === i ? "true" : "false"} aria-hidden="true" />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="cc-arrow"
          onClick={() => goTo(active + 1)}
          disabled={active >= count - 1}
          aria-label="Next module"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
