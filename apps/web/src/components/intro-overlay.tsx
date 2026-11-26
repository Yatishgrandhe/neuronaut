"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { N_DOT, N_NODES } from "./brand";

/**
 * Inline <head> script: decide before first paint whether the intro runs (once per session).
 * Adds nn-intro-run while it runs (CSS hides the nav and blurs the page) and nn-intro-m on phones.
 */
export const INTRO_HEAD_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem("nn_intro")||matchMedia("(prefers-reduced-motion: reduce)").matches||location.pathname!=="/"){d.classList.add("nn-no-intro")}else{sessionStorage.setItem("nn_intro","1");d.classList.add("nn-intro-run");if(matchMedia("(max-width: 767px)").matches)d.classList.add("nn-intro-m")}}catch(e){document.documentElement.classList.add("nn-no-intro")}`;

const EASE_X = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_Y = "cubic-bezier(0.33, 0, 0.2, 1)";
const SKIP_MS = 300;

/**
 * Branded intro over paper: the N draws itself, the orange dot pops, the wordmark slides in,
 * then the logo flies into the nav logo (manual FLIP) while the background fades and the page settles.
 * Timings for the CSS phases live in chrome.css (--intro-hand / --intro-land); this file runs the hand-off.
 * The draw is pure CSS (plays before hydration); JS only does the hand-off, the landing and skipping.
 */
export function IntroOverlay() {
  const root = useRef<HTMLDivElement>(null);
  const moveX = useRef<HTMLDivElement>(null);
  const moveY = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("nn-intro-run")) return;
    const mobile = html.classList.contains("nn-intro-m");
    const HAND = mobile ? 1250 : 1350; // hand-off starts (matches --intro-hand)
    const LAND = mobile ? 2100 : 2350; // hand-off ends (matches --intro-land)
    const timers: number[] = [];
    let handed = false;
    let landed = false;
    let skipping = false;

    /** Fly the logo box onto the nav wordmark: outer = X, middle = Y, inner = scale (origin top left). */
    const handoff = (ms: number) => {
      handed = true;
      const x = moveX.current;
      const y = moveY.current;
      const l = logo.current;
      const from = l?.getBoundingClientRect();
      const to = document.querySelector("#nav-logo .wordmark")?.getBoundingClientRect();
      if (!x || !y || !l || !from || !to || from.height === 0 || to.height === 0) return;
      const timing = { duration: ms, fill: "forwards" } as const;
      x.animate([{ transform: "translateX(0px)" }, { transform: `translateX(${to.left - from.left}px)` }], { ...timing, easing: EASE_X });
      y.animate([{ transform: "translateY(0px)" }, { transform: `translateY(${to.top - from.top}px)` }], { ...timing, easing: EASE_Y });
      l.animate([{ transform: "scale(1)" }, { transform: `scale(${to.height / from.height})` }], { ...timing, easing: EASE_X });
    };

    /** Remove the overlay and hand the page to the real nav in one frame. */
    const land = (skipped: boolean) => {
      if (landed) return;
      landed = true;
      timers.forEach(clearTimeout);
      flushSync(() => {
        html.classList.remove("nn-intro-run");
        html.classList.add("nn-intro-landed");
        if (skipped) html.classList.add("nn-intro-skip");
        setDone(true);
      });
    };

    /** Jump to the end over SKIP_MS: speed up whatever is running, then land. */
    const skip = () => {
      if (landed || skipping) return;
      skipping = true;
      timers.forEach(clearTimeout);
      const main = document.querySelector("main#main");
      for (const a of document.getAnimations()) {
        const target = (a.effect as KeyframeEffect | null)?.target;
        if (!target || target === root.current) continue; // leave the failsafe alone
        if (!root.current?.contains(target) && target !== main) continue;
        const remaining = Number(a.effect?.getComputedTiming().endTime ?? 0) - Number(a.currentTime ?? 0);
        if (remaining > SKIP_MS) a.playbackRate = remaining / SKIP_MS;
      }
      if (!handed) handoff(SKIP_MS);
      timers.push(window.setTimeout(() => land(true), SKIP_MS));
    };

    timers.push(window.setTimeout(() => handoff(LAND - HAND), HAND));
    timers.push(window.setTimeout(() => land(false), LAND));

    const events = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, skip, { once: true, passive: true }));
    return () => {
      timers.forEach(clearTimeout);
      events.forEach((e) => window.removeEventListener(e, skip));
    };
  }, []);

  if (done) return null;
  const [a, b, c, d] = N_NODES;
  const segs = [
    [a, b],
    [b, c],
    [c, d],
  ];
  return (
    <div ref={root} className="intro" aria-hidden>
      <div className="intro-bg" />
      <div ref={moveX} className="intro-x">
        <div ref={moveY} className="intro-y">
          <div ref={logo} className="intro-logo">
            <svg className="intro-mark" viewBox="0 0 64 64" focusable="false">
              {segs.map(([p, q], i) => (
                <line key={i} className="intro-line" style={{ "--i": i } as React.CSSProperties} x1={p.x} y1={p.y} x2={q.x} y2={q.y} pathLength={1} />
              ))}
              {N_NODES.map((n, i) => (
                <circle key={i} className="intro-node" style={{ "--i": i } as React.CSSProperties} cx={n.x} cy={n.y} r="6.5" />
              ))}
              <circle className="intro-dot" cx={N_DOT.x} cy={N_DOT.y} r="7.5" />
            </svg>
            <span className="intro-word">Neuronaut</span>
          </div>
        </div>
      </div>
    </div>
  );
}
