"use client";

import { useEffect, useMemo, useState } from "react";
import { seededShuffle, type Answer, type Exercise } from "@neuronaut/core";

/**
 * Renders one exercise and reports the learner's current answer (or null if
 * incomplete). `locked` freezes input while feedback is showing.
 */
export function ExerciseView({
  exercise,
  seed,
  locked,
  reveal = false,
  onChange,
}: {
  exercise: Exercise;
  seed: string;
  locked: boolean;
  /** After a miss: mark the correct option in place. */
  reveal?: boolean;
  onChange: (a: Answer | null) => void;
}) {
  switch (exercise.kind) {
    case "choice":
      return <Choice ex={exercise} locked={locked} reveal={reveal} onChange={onChange} seed={seed} />;
    case "truefalse":
      return <TrueFalse ex={exercise} locked={locked} reveal={reveal} onChange={onChange} />;
    case "order":
      return <Order ex={exercise} locked={locked} onChange={onChange} seed={seed} />;
    case "match":
      return <Match ex={exercise} locked={locked} onChange={onChange} seed={seed} />;
  }
}

export function exercisePrompt(ex: Exercise): string {
  return ex.kind === "truefalse" ? "True or false?" : ex.prompt;
}

/* ------------------------------ choice ------------------------------ */

function Choice({ ex, locked, reveal, onChange, seed }: { ex: Extract<Exercise, { kind: "choice" }>; locked: boolean; reveal: boolean; onChange: (a: Answer | null) => void; seed: string }) {
  const order = useMemo(() => seededShuffle(ex.options.map((_, i) => i), seed), [ex, seed]);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked || e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= order.length) {
        setPicked(order[n - 1]);
        onChange({ kind: "choice", index: order[n - 1] });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, order, onChange]);

  return (
    <>
      {ex.passage && <blockquote className="passage">{ex.passage}</blockquote>}
      <div className="options" role="radiogroup" aria-label={ex.prompt}>
        {order.map((i, pos) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={picked === i}
            className="option"
            data-correct={reveal && i === ex.answer ? true : undefined}
            disabled={locked}
            onClick={() => {
              setPicked(i);
              onChange({ kind: "choice", index: i });
            }}
          >
            <kbd className="option-key num">{pos + 1}</kbd>
            <span>{ex.options[i]}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------------------- true / false --------------------------- */

function TrueFalse({ ex, locked, reveal, onChange }: { ex: Extract<Exercise, { kind: "truefalse" }>; locked: boolean; reveal: boolean; onChange: (a: Answer | null) => void }) {
  const [picked, setPicked] = useState<boolean | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked || e.target instanceof HTMLInputElement) return;
      const v = e.key === "1" || e.key.toLowerCase() === "t" ? true : e.key === "2" || e.key.toLowerCase() === "f" ? false : null;
      if (v === null) return;
      setPicked(v);
      onChange({ kind: "truefalse", value: v });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, onChange]);

  return (
    <>
      <p className="statement">{ex.statement}</p>
      <div className="tf" role="radiogroup" aria-label="True or false">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            role="radio"
            aria-checked={picked === v}
            className="option tf-option"
            data-correct={reveal && v === ex.answer ? true : undefined}
            disabled={locked}
            onClick={() => {
              setPicked(v);
              onChange({ kind: "truefalse", value: v });
            }}
          >
            <kbd className="option-key num">{v ? 1 : 2}</kbd>
            <span>{v ? "True" : "False"}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------- order ------------------------------- */

function Order({ ex, locked, onChange, seed }: { ex: Extract<Exercise, { kind: "order" }>; locked: boolean; onChange: (a: Answer | null) => void; seed: string }) {
  const bank = useMemo(() => seededShuffle(ex.tiles.map((_, i) => i), seed), [ex, seed]);
  const [seq, setSeq] = useState<number[]>([]);

  const update = (next: number[]) => {
    setSeq(next);
    onChange(next.length ? { kind: "order", sequence: next } : null);
  };

  return (
    <div className="order">
      <ol className="order-line" aria-label="Your answer, in order">
        {seq.length === 0 && <li className="order-hint">Tap tiles below in the right order</li>}
        {seq.map((t, pos) => (
          <li key={t}>
            <button type="button" className="tile tile-placed" disabled={locked} onClick={() => update(seq.filter((x) => x !== t))} aria-label={`Remove “${ex.tiles[t]}”, position ${pos + 1}`}>
              {ex.tiles[t]}
            </button>
          </li>
        ))}
      </ol>
      <ul className="order-bank" aria-label="Tiles">
        {bank.map((t) => {
          const used = seq.includes(t);
          return (
            <li key={t}>
              <button type="button" className="tile" data-used={used} disabled={locked || used} onClick={() => update([...seq, t])}>
                {ex.tiles[t]}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------- match ------------------------------- */

const PAIR_COLORS = ["var(--blue)", "var(--spark)", "var(--leaf)", "var(--sun)"];

function Match({ ex, locked, onChange, seed }: { ex: Extract<Exercise, { kind: "match" }>; locked: boolean; onChange: (a: Answer | null) => void; seed: string }) {
  const lefts = useMemo(() => seededShuffle(ex.pairs.map((_, i) => i), seed + "L"), [ex, seed]);
  const rights = useMemo(() => seededShuffle(ex.pairs.map((_, i) => i), seed + "R"), [ex, seed]);
  const [active, setActive] = useState<number | null>(null);
  const [pairs, setPairs] = useState<[number, number][]>([]);

  const pairOf = (side: 0 | 1, idx: number) => pairs.findIndex((p) => p[side] === idx);

  const pickRight = (r: number) => {
    if (active === null) return;
    const next = pairs.filter((p) => p[0] !== active && p[1] !== r);
    next.push([active, r]);
    setPairs(next);
    setActive(null);
    onChange(next.length === ex.pairs.length ? { kind: "match", pairs: next } : null);
  };

  return (
    <div className="match">
      <p className="match-help">{active === null ? "Pick an item on the left, then its match on the right." : "Now pick its match on the right."}</p>
      <div className="match-cols">
        <ul aria-label="Items">
          {lefts.map((l) => {
            const pi = pairOf(0, l);
            return (
              <li key={l}>
                <button
                  type="button"
                  className="tile match-tile"
                  aria-pressed={active === l}
                  disabled={locked}
                  style={pi >= 0 ? ({ "--pair": PAIR_COLORS[pi % 4] } as React.CSSProperties) : undefined}
                  data-paired={pi >= 0}
                  onClick={() => setActive(active === l ? null : l)}
                >
                  {ex.pairs[l][0]}
                </button>
              </li>
            );
          })}
        </ul>
        <ul aria-label="Matches">
          {rights.map((r) => {
            const pi = pairOf(1, r);
            return (
              <li key={r}>
                <button
                  type="button"
                  className="tile match-tile"
                  disabled={locked || active === null}
                  style={pi >= 0 ? ({ "--pair": PAIR_COLORS[pi % 4] } as React.CSSProperties) : undefined}
                  data-paired={pi >= 0}
                  onClick={() => pickRight(r)}
                >
                  {ex.pairs[r][1]}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
