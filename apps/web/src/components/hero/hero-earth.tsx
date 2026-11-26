"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const WordPlanet = dynamic(() => import("./word-planet"), { ssr: false, loading: () => null });

function canTurn() {
  // The poster script needs the live planet even in headless (software) Chrome.
  if (/[?&](paint-surface|force-planet)\b/.test(location.search)) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator.hardwareConcurrency ?? 8) <= 2) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    // Software-only WebGL (no GPU) would draw every frame on the CPU: keep the still instead.
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = `${gl.getParameter(gl.RENDERER)} ${info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : ""}`;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

/**
 * The planet on the horizon: a still of the word planet first (server-rendered, instant),
 * then the live planet turning slowly once fonts are in. Pauses off-screen and in hidden tabs.
 */
export function HeroEarth() {
  const wrap = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  // The still is already on screen, so the live planet's files (WebAssembly + surface image)
  // wait until the page has loaded and the browser is idle: they never compete with first paint.
  useEffect(() => {
    if (!canTurn()) return;
    let off = false;
    let idle = 0;
    const start = () => {
      const go = () => document.fonts.ready.then(() => !off && setLive(true));
      idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(go, { timeout: 2500 }) : window.setTimeout(go, 1200) as number;
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      off = true;
      window.removeEventListener("load", start);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let inView = true;
    let shown = !document.hidden;
    const update = () => setVisible(inView && shown);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    });
    io.observe(el);
    const onVis = () => {
      shown = !document.hidden;
      update();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrap} className="he" data-ready={ready} aria-hidden>
      <span className="he-air" />
      <picture className="he-still">
        {/* Phones always get the 900px still (95 KB): on a 3x screen the srcset would otherwise pick the
            226 KB 1700px file, which made it the slowest thing on the page (LCP 5.5 s on slow 4G). */}
        <source type="image/webp" media="(max-width: 767px)" srcSet="/hero/word-planet-900.webp" />
        <source type="image/webp" srcSet="/hero/word-planet-1300.webp 1300w, /hero/word-planet-1700.webp 1700w" sizes="1700px" />
        <img src="/hero/word-planet-1300.webp" alt="" width={1700} height={1276} decoding="async" fetchPriority="high" />
      </picture>
      {live && (
        <div className="he-gl">
          <WordPlanet active={visible} onReady={() => setReady(true)} onFail={() => setLive(false)} />
        </div>
      )}
    </div>
  );
}
