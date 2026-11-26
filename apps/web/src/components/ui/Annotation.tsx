"use client";

import { motion, useReducedMotion } from "framer-motion";

export type AnnotationType = "underline" | "circle" | "arrow" | "check" | "strike" | "question";

/* Hand-drawn paths, slightly irregular so they read as a pen, not a vector icon. */
const PATHS: Record<AnnotationType, { viewBox: string; d: string[] }> = {
  underline: { viewBox: "0 0 200 14", d: ["M2 9 C 50 3, 120 3, 198 8"] },
  circle: { viewBox: "0 0 200 80", d: ["M104 6 C 40 2, 6 22, 8 42 C 10 66, 70 78, 120 74 C 172 70, 196 52, 190 32 C 184 12, 140 4, 92 8"] },
  arrow: { viewBox: "0 0 120 60", d: ["M4 8 C 30 6, 70 14, 104 46", "M86 46 L 106 48 L 100 28"] },
  check: { viewBox: "0 0 60 50", d: ["M6 26 C 12 30, 18 38, 22 44 C 30 26, 42 12, 56 4"] },
  strike: { viewBox: "0 0 200 20", d: ["M2 12 C 60 6, 130 14, 198 8"] },
  question: { viewBox: "0 0 40 60", d: ["M10 18 C 10 6, 32 4, 32 18 C 32 28, 20 28, 20 40", "M20 52 L 20.5 53"] },
};

/**
 * A teacher's-pen mark that draws itself (stroke-dashoffset) when it scrolls into view,
 * or when `play` turns true. Fills its box; position it with className/style. Decorative.
 */
export function Annotation({
  type,
  color = "var(--accent)",
  delay = 0.2,
  note,
  notePosition = "right",
  className = "",
  style,
  strokeWidth = 4,
  play,
}: {
  type: AnnotationType;
  color?: string;
  delay?: number;
  note?: string;
  notePosition?: "top" | "right" | "bottom" | "left";
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
  play?: boolean;
}) {
  const reduced = useReducedMotion();
  const p = PATHS[type];
  const drawn = { pathLength: 1, opacity: 1 };
  const hidden = { pathLength: 0, opacity: 0 };
  const shownLabel = { opacity: 1, y: 0 };
  const hiddenLabel = { opacity: 0, y: 4 };
  const controlled = play !== undefined;
  const on = Boolean(play || reduced);
  const viewport = { once: true, amount: 0.6 };

  return (
    <span className={`anno anno-${type} anno-note-${notePosition} ${className}`} style={style} aria-hidden>
      <svg viewBox={p.viewBox} preserveAspectRatio="none" fill="none" focusable="false">
        {p.d.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={reduced ? drawn : hidden}
            animate={controlled ? (on ? drawn : hidden) : undefined}
            whileInView={controlled ? undefined : drawn}
            viewport={controlled ? undefined : viewport}
            transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : delay + i * 0.35 }}
          />
        ))}
      </svg>
      {note && (
        <motion.span
          className="anno-label note"
          style={{ color }}
          initial={reduced ? shownLabel : hiddenLabel}
          animate={controlled ? (on ? shownLabel : hiddenLabel) : undefined}
          whileInView={controlled ? undefined : shownLabel}
          viewport={controlled ? undefined : viewport}
          transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : delay + 0.45 }}
        >
          {note}
        </motion.span>
      )}
    </span>
  );
}
