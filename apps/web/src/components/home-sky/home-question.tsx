"use client";

import { useState } from "react";
import { sample } from "./content";

/** The first real question from lesson 1, answerable in place. */
export function HomeQuestion() {
  const [pick, setPick] = useState<number | null>(null);
  const done = pick !== null;
  return (
    <div className="home-sky-sq">
      <p className="home-sky-sq-label">A question from lesson 1</p>
      <p className="home-sky-sq-prompt">{sample.prompt}</p>
      <ul className="home-sky-sq-options">
        {sample.options.map((o, i) => (
          <li key={o}>
            <button
              type="button"
              disabled={done}
              data-state={done ? (i === sample.answer ? "right" : i === pick ? "wrong" : "idle") : "idle"}
              onClick={() => setPick(i)}
            >
              {o}
            </button>
          </li>
        ))}
      </ul>
      <p className="home-sky-sq-feedback" aria-live="polite">
        {done ? (
          <>
            <strong>{pick === sample.answer ? "Right." : "Not quite."}</strong> {sample.explain}{" "}
            <button type="button" className="home-sky-sq-again" onClick={() => setPick(null)}>
              Try again
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
