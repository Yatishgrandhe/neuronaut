"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type PipPose = "idle" | "wave" | "think" | "point" | "cheer" | "happy";

export interface PipHandle {
  /** Small happy bounce, e.g. after a correct answer. */
  react: () => void;
  /** Head tilt, e.g. after a wrong answer. */
  tilt: () => void;
}

interface PipProps {
  pose?: PipPose;
  /** Legacy alias for `pose`. */
  mood?: PipPose;
  size?: number;
  lookAtCursor?: boolean;
  className?: string;
  /** Pip is decorative by default; pass a label when he carries meaning. */
  label?: string;
}

const INK = "#1d1d1f";
const ARM = "#c2410c";

/**
 * Pip, Neuronaut's guide: a round orange robot with an antenna.
 * Blinks every 3–6s, can look toward the cursor, and bounces or tilts on demand.
 */
export const Pip = forwardRef<PipHandle, PipProps>(function Pip(
  { pose: poseProp, mood, size = 96, lookAtCursor = false, className = "", label },
  ref,
) {
  const pose = poseProp ?? mood ?? "idle";
  const svg = useRef<SVGSVGElement>(null);
  const [blink, setBlink] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [anim, setAnim] = useState<{ kind: "bounce" | "tilt"; n: number } | null>(null);

  useImperativeHandle(ref, () => ({
    react: () => setAnim((a) => ({ kind: "bounce", n: (a?.n ?? 0) + 1 })),
    tilt: () => setAnim((a) => ({ kind: "tilt", n: (a?.n ?? 0) + 1 })),
  }));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t = 0;
    let u = 0;
    const schedule = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        u = window.setTimeout(() => setBlink(false), 140);
        schedule();
      }, 3000 + Math.random() * 3000);
    };
    schedule();
    return () => {
      clearTimeout(t);
      clearTimeout(u);
    };
  }, []);

  useEffect(() => {
    if (!lookAtCursor) return;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = svg.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.max(1, Math.hypot(dx, dy));
      setLook({ x: (dx / d) * 2.6, y: (dy / d) * 2.2 });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [lookAtCursor]);

  const smile = pose === "cheer" || pose === "happy" || pose === "wave";
  const eyeY = pose === "think" ? 48 : 51;
  const lx = pose === "think" ? -2 : look.x;
  const ly = pose === "think" ? -2 : look.y;

  const eyes = smile ? (
    <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
      <path d="M37 52q5-7 10 0" />
      <path d="M57 52q5-7 10 0" />
    </g>
  ) : (
    <g style={{ transform: `scaleY(${blink ? 0.1 : 1})`, transformOrigin: "52px 50px", transition: "transform 90ms" }}>
      <ellipse cx={42 + lx} cy={eyeY + ly} rx="4.5" ry="6" fill={INK} />
      <ellipse cx={62 + lx} cy={eyeY + ly} rx="4.5" ry="6" fill={INK} />
      <circle cx={43.5 + lx} cy={eyeY - 2.5 + ly} r="1.6" fill="#fff" />
      <circle cx={63.5 + lx} cy={eyeY - 2.5 + ly} r="1.6" fill="#fff" />
    </g>
  );

  const mouth =
    pose === "think" ? (
      <path d="M47 67q5-3 10 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
    ) : pose === "cheer" ? (
      <path d="M43 62q9 13 18 0z" fill={INK} />
    ) : (
      <path d="M45 63q7 7 14 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
    );

  const arms =
    pose === "wave" ? (
      <>
        <path className="pip-wave-arm" d="M86 56 q10 -10 8 -24" />
        <path d="M18 64 q-8 6 -8 14" />
      </>
    ) : pose === "cheer" ? (
      <>
        <path d="M86 52 q10 -12 6 -26" />
        <path d="M18 52 q-10 -12 -6 -26" />
      </>
    ) : pose === "point" ? (
      <>
        <path d="M87 60 h17" />
        <path d="M18 64 q-8 6 -8 14" />
      </>
    ) : pose === "think" ? (
      <>
        <path d="M78 80 q-6 -2 -14 -10" />
        <path d="M18 64 q-8 6 -8 14" />
      </>
    ) : null;

  return (
    <svg
      ref={svg}
      key={anim ? `${anim.kind}-${anim.n}` : "still"}
      className={`pip pip-${pose}${anim ? ` pip-anim-${anim.kind}` : ""} ${className}`}
      width={size}
      height={size}
      viewBox="-8 -4 120 112"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <g className="pip-body">
        {arms && (
          <g stroke={ARM} strokeWidth="7" strokeLinecap="round" fill="none">
            {arms}
          </g>
        )}
        <path d="M52 22V10" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <circle className="pip-signal" cx="52" cy="8" r="5" fill="#f2b100" />
        <circle cx="52" cy="58" r="36" fill="#e8501f" />
        <path d="M24 50a30 30 0 0 1 22-24" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" />
        <circle cx="33" cy="64" r="5" fill="#ff9a76" />
        <circle cx="71" cy="64" r="5" fill="#ff9a76" />
        {eyes}
        {mouth}
      </g>
    </svg>
  );
});
