"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Timer } from "lucide-react";
import { matchRound, seededShuffle } from "@neuronaut/core";
import "../app/study.css";

interface Tile {
  key: string;
  pair: string;
  text: string;
  side: "term" | "meaning";
}

const fmt = (ms: number) => {
  const s = ms / 1000;
  return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
const BEST_KEY = "neuronaut.matchBest";
/** Read the clock (only ever called from event handlers and effects). */
const clock = () => performance.now();

/**
 * The Match game in the Quizlet pattern: tap a term, then its meaning. Matched pairs clear.
 * The clock is optional and there is no penalty for a wrong pair, so it rewards knowing, not rushing.
 */
export function MatchGame() {
  const [game, setGame] = useState(0);
  const [seed, setSeed] = useState<string | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setSeed(`${Date.now()}-${game}`));
    return () => cancelAnimationFrame(id);
  }, [game]);

  const tiles = useMemo<Tile[]>(() => {
    if (!seed) return [];
    const pairs = matchRound(seed);
    return seededShuffle(
      pairs.flatMap((p) => [
        { key: `${p.id}:t`, pair: p.id, text: p.left, side: "term" as const },
        { key: `${p.id}:m`, pair: p.id, text: p.right, side: "meaning" as const },
      ]),
      seed,
    );
  }, [seed]);

  const [picked, setPicked] = useState<string | null>(null);
  const [cleared, setCleared] = useState<Set<string>>(new Set());
  const [miss, setMiss] = useState<string[]>([]);
  const [showClock, setShowClock] = useState(true);
  const [now, setNow] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const start = useRef<number | null>(null);
  const [finalMs, setFinalMs] = useState<number | null>(null);
  const pairs = tiles.length / 2;
  const won = pairs > 0 && cleared.size === pairs;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const b = Number(localStorage.getItem(BEST_KEY));
      setBest(b > 0 ? b : null);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (won || start.current === null) return;
    const t = setInterval(() => setNow(clock() - (start.current ?? 0)), 100);
    return () => clearInterval(t);
  }, [won, picked, cleared]);

  const tap = (t: Tile) => {
    if (cleared.has(t.pair)) return;
    if (start.current === null) start.current = clock();
    if (!picked) return setPicked(t.key);
    if (picked === t.key) return setPicked(null);
    const a = tiles.find((x) => x.key === picked)!;
    if (a.side === t.side) return setPicked(t.key);
    if (a.pair === t.pair) {
      const next = new Set(cleared).add(t.pair);
      setCleared(next);
      setPicked(null);
      if (next.size === pairs) {
        const ms = clock() - (start.current ?? 0);
        setFinalMs(ms);
        if (!best || ms < best) {
          localStorage.setItem(BEST_KEY, String(Math.round(ms)));
          setBest(ms);
        }
      }
    } else {
      setMiss([a.key, t.key]);
      setPicked(null);
      setTimeout(() => setMiss([]), 450);
    }
  };

  const reset = () => {
    setGame((g) => g + 1);
    setPicked(null);
    setCleared(new Set());
    setMiss([]);
    setNow(0);
    setFinalMs(null);
    start.current = null;
  };

  return (
    <div className="wrap study study-wide">
      <header className="study-head">
        <Link href="/learn" className="back-link">
          <ArrowLeft size={18} aria-hidden /> Learning path
        </Link>
        <h1>Match</h1>
        <p className="lede">Tap a term, then the meaning that goes with it. Matched pairs disappear.</p>
        <div className="match-bar">
          <label className="check-row">
            <input type="checkbox" checked={showClock} onChange={(e) => setShowClock(e.target.checked)} /> Show the clock
          </label>
          {showClock ? (
            <span className="match-clock num" aria-hidden>
              <Timer size={18} /> {fmt(finalMs ?? now)}
            </span>
          ) : null}
        </div>
      </header>

      {won ? (
        <section className="study-done" role="status">
          <h2>All {pairs} pairs matched</h2>
          {showClock && finalMs !== null ? (
            <p className="num">
              Time: {fmt(finalMs)}
              {best !== null ? `. Your best: ${fmt(best)}` : ""}
            </p>
          ) : null}
          <div className="study-actions">
            <button type="button" className="btn btn-spark btn-lg" onClick={reset}>
              <RotateCcw size={20} aria-hidden /> New round
            </button>
            <Link className="btn btn-ghost btn-lg" href="/practice/flashcards">
              Flashcards
            </Link>
          </div>
        </section>
      ) : (
        <>
          <ul className="match-grid" aria-label="Tiles">
            {tiles.map((t) => {
              const gone = cleared.has(t.pair);
              return (
                <li key={t.key}>
                  <button
                    type="button"
                    className="match-card"
                    data-side={t.side}
                    data-gone={gone || undefined}
                    data-miss={miss.includes(t.key) || undefined}
                    aria-pressed={picked === t.key}
                    disabled={gone}
                    onClick={() => tap(t)}
                  >
                    <span className="visually-hidden">{t.side === "term" ? "Term: " : "Meaning: "}</span>
                    {t.text}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="study-keys" aria-live="polite">
            {cleared.size} of {pairs} matched
          </p>
        </>
      )}
    </div>
  );
}
