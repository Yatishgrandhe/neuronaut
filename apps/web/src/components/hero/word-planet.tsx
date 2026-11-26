"use client";

import { useEffect, useRef } from "react";
import { allLessons } from "@neuronaut/core";
import init, { Planet, SurfacePainter } from "./planet-wasm/word_planet.js";

/**
 * Load an image, then try to decode it off the main thread before WebGL uploads it.
 * decode() can reject in background tabs; the loaded image still uploads fine then.
 */
async function loadImage(src: string) {
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
  await img.decode().catch(() => {});
  return img;
}

/**
 * The word planet, drawn by the Rust engine in planet/ (compiled to WebAssembly).
 * The word surface is painted once, ahead of time, by the same engine (scripts/make-planet-assets.mjs
 * opens the page with ?paint-surface) and ships as an image, so visitors' devices only upload one
 * texture and draw the sphere. This component owns the canvas, its size, and the frame loop, so
 * the planet stops drawing whenever the hero is off-screen or the tab is hidden.
 */
export default function WordPlanet({ active, onReady, onFail }: { active: boolean; onReady: () => void; onFail: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const planet = useRef<Planet | null>(null);
  const activeRef = useRef(active);
  const raf = useRef(0);
  const cb = useRef({ onReady, onFail });

  useEffect(() => {
    cb.current = { onReady, onFail };
  });

  const loop = useRef<(t: number) => void>(() => {});
  useEffect(() => {
    loop.current = (t: number) => {
      planet.current?.frame(t);
      if (activeRef.current) raf.current = requestAnimationFrame(loop.current);
    };
  }, []);

  useEffect(() => {
    activeRef.current = active;
    cancelAnimationFrame(raf.current);
    if (active && planet.current) raf.current = requestAnimationFrame(loop.current);
  }, [active]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let off = false;
    let ro: ResizeObserver | null = null;
    const small = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    const paintWidth = Number(new URLSearchParams(location.search).get("paint-surface")) || 0;

    (async () => {
      try {
        await init();
        if (off) return;

        // Build-time only: paint the surface with Rust and expose it to the poster script.
        if (paintWidth) {
          const font = getComputedStyle(document.documentElement).getPropertyValue("--font-gelasio").trim() || "Georgia, serif";
          const painter = new SurfacePainter(JSON.stringify(allLessons), font, paintWidth);
          while (!painter.step(50)) await new Promise((r) => setTimeout(r, 0));
          (window as Window & { __surface?: string }).__surface = painter.canvas().toDataURL("image/png");
          painter.free();
          return;
        }

        const img = await loadImage(small ? "/hero/word-surface-2048.webp" : "/hero/word-surface-3072.webp");
        if (off) return;
        const p = new Planet(el, img);
        planet.current = p;
        const size = () => {
          const b = el.getBoundingClientRect();
          p.resize(b.width, b.height, dpr);
          p.frame(performance.now());
        };
        size();
        ro = new ResizeObserver(size);
        ro.observe(el);
        requestAnimationFrame(() => requestAnimationFrame(() => cb.current.onReady()));
        if (activeRef.current) raf.current = requestAnimationFrame(loop.current);
      } catch (e) {
        console.warn("Word planet unavailable, showing the still:", e);
        cb.current.onFail();
      }
    })();

    return () => {
      off = true;
      cancelAnimationFrame(raf.current);
      ro?.disconnect();
      planet.current?.free();
      planet.current = null;
    };
  }, []);

  return <canvas ref={canvas} className="he-canvas" aria-hidden />;
}
