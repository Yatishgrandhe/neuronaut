"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AnimationEvent as ReactAnimationEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { Pip } from "@/components/Pip";
import { LessonWindow } from "@/components/home/lesson-screens";
import { LessonCarousel } from "@/components/home/lesson-carousel";
import { LESSON_STEPS, STEP_MS, type StepIndex } from "@/components/home/lesson-steps";
import "@/app/home-how.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const COUNT = LESSON_STEPS.length;
/** Share of the section that must be on screen before autoplay runs. */
const IN_VIEW_RATIO = 0.35;

type Sel = { i: StepIndex; run: number };

const wrapIndex = (n: number): StepIndex => ((((n % COUNT) + COUNT) % COUNT) as StepIndex);

/** Tab the arrow / Home / End keys move to, or null for other keys. */
function keyTarget(key: string, from: StepIndex): StepIndex | null {
  switch (key) {
    case "ArrowUp":
    case "ArrowLeft":
      return wrapIndex(from - 1);
    case "ArrowDown":
    case "ArrowRight":
      return wrapIndex(from + 1);
    case "Home":
      return wrapIndex(0);
    case "End":
      return wrapIndex(COUNT - 1);
    default:
      return null;
  }
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function useDocumentVisible(): boolean {
  return useSyncExternalStore(
    (notify) => {
      document.addEventListener("visibilitychange", notify);
      return () => document.removeEventListener("visibilitychange", notify);
    },
    () => document.visibilityState !== "hidden",
    () => true,
  );
}

/** "How a lesson works": four tabs that autoplay through a live lesson preview. */
export function HowLesson() {
  const reduced = useReducedMotion() === true;
  const shortLaptop = useMediaQuery("(min-width: 1024px) and (max-height: 760px)");
  const visible = useDocumentVisible();

  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [sel, setSel] = useState<Sel>({ i: 0, run: 0 });

  // Autoplay only while the section is actually on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInView(entry.intersectionRatio >= IN_VIEW_RATIO);
      },
      { threshold: [0, IN_VIEW_RATIO] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Hovering pauses the tab timer (so you can read), not the step's own demo: after you click a
  // button inside the window your pointer is still over it, and the next step must still play.
  const demoRunning = !userPaused && inView && visible;
  const running = demoRunning && !hovered;
  const step = LESSON_STEPS[sel.i];

  /** Activates a tab. `run` changes on every activation so the progress bar and window restart. */
  const activate = (i: StepIndex) => setSel((s) => ({ i, run: s.run + 1 }));

  // The CSS progress bar drives the timing; when it ends, the next tab activates.
  const onFillEnd = (e: ReactAnimationEvent<HTMLSpanElement>) => {
    if (e.target !== e.currentTarget || e.animationName !== "hl-fill") return;
    setSel((s) => ({ i: wrapIndex(s.i + 1), run: s.run + 1 }));
  };

  const onTabKey = (e: ReactKeyboardEvent<HTMLButtonElement>, from: StepIndex) => {
    const to = keyTarget(e.key, from);
    if (to === null) return;
    e.preventDefault();
    activate(to);
    tabRefs.current[to]?.focus();
  };

  return (
    <section ref={sectionRef} className="hl" aria-labelledby="hl-h">
      <div className="wrap">
        <div className="hl-head">
          <h2 id="hl-h" className="t-h2 hl-h2">
            How a lesson works.
          </h2>
          <p className="hl-lead">About five minutes. Mistakes don&apos;t cost you anything.</p>
        </div>

        <div className="hl-panel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <div className="hl-nav">
            <div className="hl-tablist" role="tablist" aria-orientation="vertical" aria-label="Lesson steps">
              {LESSON_STEPS.map((s, k) => {
                const idx = k as StepIndex;
                const on = sel.i === idx;
                return (
                  <button
                    key={s.num}
                    ref={(el) => {
                      tabRefs.current[idx] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`hl-tab-${idx}`}
                    aria-selected={on}
                    aria-controls="hl-stage"
                    tabIndex={on ? 0 : -1}
                    className="hl-tab"
                    onClick={() => activate(idx)}
                    onKeyDown={(e) => onTabKey(e, idx)}
                  >
                    <span className="hl-tab-num">{s.num}</span>
                    <span className="hl-tab-title">{s.title}</span>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.span
                          key="body"
                          className="hl-tab-body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
                        >
                          {s.body}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {on && !reduced && (
                      <span className="hl-bar" aria-hidden="true">
                        <span
                          key={sel.run}
                          className="hl-fill"
                          style={{
                            animationDuration: `${STEP_MS}ms`,
                            animationPlayState: running ? "running" : "paused",
                          }}
                          onAnimationEnd={onFillEnd}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {!reduced && (
              <button
                type="button"
                className="hl-ctrl"
                aria-label={userPaused ? "Play autoplay" : "Pause autoplay"}
                aria-pressed={userPaused}
                onClick={() => setUserPaused((p) => !p)}
              >
                {userPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
            )}
          </div>

          <div
            id="hl-stage"
            role="tabpanel"
            aria-labelledby={`hl-tab-${sel.i}`}
            className="hl-stage"
            tabIndex={0}
          >
            <motion.div
              key={sel.run}
              className="hl-window"
              initial={reduced ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0.15 : 0 }}
            >
              <LessonWindow step={sel.i} playing={demoRunning} reduced={reduced} compact={shortLaptop} fit="fill" onNext={() => sel.i < 3 && activate((sel.i + 1) as StepIndex)} />
            </motion.div>
            <span className="hl-pip" aria-hidden="true">
              <Pip pose={step.pip} size={56} />
            </span>
          </div>

          <p className="hl-desc" aria-live="polite">
            {step.body}
          </p>
        </div>

        <LessonCarousel />
      </div>
    </section>
  );
}
