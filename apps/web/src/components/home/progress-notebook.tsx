"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { BADGES, MAX_FREEZES } from "@neuronaut/core";
import { SectionHeader } from "../ui/SectionHeader";
import { Annotation } from "../ui/Annotation";
import { Card } from "../ui/Card";
import { BadgeGlyph } from "../badge";
import "../../app/home-end.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const DONE = [true, true, true, true, true, true, false];
const XP_FINAL = 340;
const LEVEL_FRACTION = 0.6;
const RING_R = 30;
const RING_C = 2 * Math.PI * RING_R;
/** Badge shelf: first three earned, the last two locked. */
const SHELF = BADGES.slice(0, 5).map((b, i) => ({ ...b, earned: i < 3 }));

/** Counts from 0 to `target` with expo-out once `active`; jumps straight to the target under reduced motion. */
function useCountUp(target: number, active: boolean, reduced: boolean | null) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || reduced) return;
    const dur = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, target]);
  return reduced ? target : value;
}

function ProgressMock() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const xp = useCountUp(XP_FINAL, inView, reduced);

  return (
    <Card variant="product" className="pn-card" as="article">
      <div ref={ref} className="pn-mock">
        <header className="pn-top">
          <p className="pn-greet">Nice work, keep it going.</p>
          <p className="pn-xp">
            <span className="pn-xp-num" aria-label={`${XP_FINAL} XP`}>
              {xp}
            </span>{" "}
            XP
          </p>
        </header>

        <div className="pn-streak" role="img" aria-label="7-day streak: 6 days done">
          {DAYS.map((d, i) => (
            <div key={i} className="pn-day">
              <motion.span
                className="pn-dot"
                data-done={DONE[i]}
                initial={reduced || !DONE[i] ? false : { scale: 0.7, opacity: 0.4 }}
                animate={inView && DONE[i] ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.35, ease: EASE, delay: 0.15 + i * 0.1 }}
              >
                {DONE[i] && (
                  <motion.span
                    className="pn-flame"
                    initial={reduced || !DONE[i] ? false : { opacity: 0 }}
                    animate={inView ? { opacity: 1 } : undefined}
                    transition={{ duration: 0.2, delay: 0.25 + i * 0.1 }}
                  >
                    <Flame size={14} strokeWidth={2.2} aria-hidden="true" />
                  </motion.span>
                )}
              </motion.span>
              <span className="pn-day-l" aria-hidden="true">
                {d}
              </span>
            </div>
          ))}
        </div>

        <div className="pn-level">
          <div className="pn-ring-wrap pn-ring-only">
            <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true" focusable="false">
              <circle cx="40" cy="40" r={RING_R} fill="none" stroke="var(--paper-2)" strokeWidth="7" />
              <motion.circle
                cx="40"
                cy="40"
                r={RING_R}
                fill="none"
                stroke="var(--m1)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                transform="rotate(-90 40 40)"
                initial={{ strokeDashoffset: RING_C }}
                animate={{ strokeDashoffset: inView ? RING_C * (1 - LEVEL_FRACTION) : RING_C }}
                transition={{ duration: reduced ? 0 : 1.2, ease: EASE, delay: reduced ? 0 : 0.4 }}
              />
            </svg>
            <span className="pn-ring-num">3</span>
          </div>
          <div>
            <p className="pn-level-t">Level 3</p>
            <p className="pn-level-s">60% of the way to Level 4</p>
          </div>
        </div>

        <p className="pn-due">
          <span>Due for review</span>
          <span className="pn-due-n">3 questions</span>
        </p>

        <ul className="pn-shelf" aria-label="Badges (two locked)">
          {SHELF.map((b) => (
            <li key={b.id} className="pn-badge" data-earned={b.earned}>
              <BadgeGlyph glyph={b.glyph} earned={b.earned} size={48} />
              <span className="pn-badge-name">{b.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function ProgressNotebook() {
  return (
    <section className="pn" id="progress" aria-labelledby="pn-h">
      <div className="wrap">
        <SectionHeader
          id="pn-h"
          align="left"
          title={
            <>
              Small streaks. <span className="pn-real">Real<Annotation type="circle" className="pn-circle" /></span> skills.
            </>
          }
        />

        <div className="pn-grid">
          <figure className="pn-dash">
            <ProgressMock />
            <figcaption className="t-caption pn-cap">Example progress</figcaption>
          </figure>

          <div className="pn-notes">
            <NoteCard tone="pn-note-a" title="No account needed.">
              Your progress saves on your device. You can download a backup from the Progress page.
            </NoteCard>
            <NoteCard tone="pn-note-b" title="Streak freezes.">
              Miss a day without losing your streak. You start with one and earn another every 7-day streak, up to {MAX_FREEZES}.
            </NoteCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function NoteCard({ tone, title, children }: { tone: string; title: string; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="pn-note-wrap"
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <article className={`pn-note ${tone}`}>
        <h3 className="pn-note-t">{title}</h3>
        <p className="pn-note-body">{children}</p>
      </article>
    </motion.div>
  );
}
