"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { looksLikeDecline, type PipTurn } from "./use-pip-chat";

export const WALK_THROUGH = "Walk me through step 1";

/** Pip's answer text plus, once it has finished, one quiet line: label, sources, copy, retry. */
export function PipAnswer({
  turn,
  last,
  onRetry,
  onAsk,
}: {
  turn: PipTurn;
  last: boolean;
  onRetry: () => void;
  onAsk: (q: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(turn.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <div className="pa">
      <div className="pa-text">
        {turn.content ? (
          turn.content.split(/\n{2,}/).map((p, j) => <p key={j}>{p}</p>)
        ) : (
          <p className="pa-wait">Pip is reading the lessons…</p>
        )}
      </div>
      {turn.done && turn.content ? (
        <>
          {last && looksLikeDecline(turn.content) ? (
            <button type="button" className="pa-next" onClick={() => onAsk(WALK_THROUGH)}>
              {WALK_THROUGH}
            </button>
          ) : null}
          <p className="pa-meta">
            <span>AI-written by Claude · can be wrong, check the lesson</span>
            {turn.lessons?.length ? (
              <span>
                From lesson:{" "}
                {turn.lessons.slice(0, 2).map((l, i) => (
                  <span key={l.id}>
                    {i > 0 ? ", " : ""}
                    <Link href={`/lesson/${l.id}`}>{l.title}</Link>
                  </span>
                ))}
              </span>
            ) : null}
            <span className="pa-tools">
              <button type="button" onClick={copy} aria-label={copied ? "Copied" : "Copy answer"}>
                {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              {last ? (
                <button type="button" onClick={onRetry} aria-label="Ask again for a different answer">
                  <RotateCcw size={16} aria-hidden />
                  <span>Retry</span>
                </button>
              ) : null}
            </span>
          </p>
          {copied ? (
            <span className="visually-hidden" role="status">
              Answer copied
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
