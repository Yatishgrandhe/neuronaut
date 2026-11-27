"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { sample, VARIANTS, type VariantId } from "./data";

/** Bottom bar to flip between variants. Keys 1 to 5 switch too. */
export function LabBar({ current }: { current: VariantId }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const v = VARIANTS[Number(e.key) - 1];
      if (v) router.push(`/lab?v=${v.id}`, { scroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const cur = VARIANTS.find((v) => v.id === current)!;
  // Portal to <body>: the route fade wrapper is transformed, which would trap position: fixed.
  if (!mounted) return null;
  return createPortal(
    <nav className="lab-bar" aria-label="Home page variants">
      <p className="lab-note">
        <strong>{cur.name}.</strong> {cur.note}
      </p>
      <ol>
        {VARIANTS.map((v, i) => (
          <li key={v.id}>
            <Link href={`/lab?v=${v.id}`} aria-current={v.id === current ? "page" : undefined}>
              <kbd>{i + 1}</kbd> {v.name}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/">Current</Link>
        </li>
      </ol>
    </nav>,
    document.body,
  );
}

/** The first real question from lesson 1, answerable in place. Each variant styles it. */
export function SampleQuestion({ className }: { className: string }) {
  const [pick, setPick] = useState<number | null>(null);
  const done = pick !== null;
  return (
    <div className={className}>
      <p className="sq-label">A question from lesson 1</p>
      <p className="sq-prompt">{sample.prompt}</p>
      <ul className="sq-options">
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
      <p className="sq-feedback" aria-live="polite">
        {done ? (
          <>
            <strong>{pick === sample.answer ? "Right." : "Not quite."}</strong> {sample.explain}{" "}
            <button type="button" className="sq-again" onClick={() => setPick(null)}>
              Try again
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
