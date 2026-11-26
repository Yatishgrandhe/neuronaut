"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUp, Square } from "lucide-react";
import { Pip } from "@/components/brand";
import { PipAnswer } from "@/components/pip-answer";
import { PIP_NOTICE, usePipChat, usePipConsent } from "@/components/use-pip-chat";

const STARTERS = ["Can AI write my essay?", "How do I check if a source is real?", "What is a token?"];

/**
 * Ask Pip, live, on the home page. The input sits above the answer, so a streaming answer grows
 * downward and never moves the reader's scroll position or covers the input.
 */
export function HomeAsk() {
  const { consented, accept } = usePipConsent();
  const { turns, error, send, stop, retry, busy } = usePipChat();
  const [draft, setDraft] = useState("");
  const lastUser = [...turns].reverse().find((t) => t.role === "user");
  const answer = turns.at(-1)?.role === "assistant" ? turns.at(-1) : undefined;

  const ask = (q: string) => {
    if (!q.trim() || busy) return;
    if (!consented) accept(); // Pressing send under the always-visible notice is the OK.
    setDraft("");
    void send(q);
  };

  return (
    <section className="ha" aria-labelledby="ha-h">
      <div className="wrap ha-grid">
        <header className="ha-head">
          <Pip mood="happy" size={64} />
          <h2 id="ha-h" className="t-h2">
            Ask Pip. It explains, it won&rsquo;t write your homework.
          </h2>
          <p className="t-lead">
            Pip is an AI tutor that answers from our lessons. Ask it to explain, quiz you, or check your thinking. Ask it to
            write graded work and it will show you how to start instead.
          </p>
        </header>

        <div className="ha-panel">
          <form
            className="ha-form"
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
            }}
          >
            <label htmlFor="ha-q" className="ha-label">
              Your question
            </label>
            <div className="ha-row">
              <input
                id="ha-q"
                type="text"
                maxLength={1000}
                autoComplete="off"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. Why do chatbots make up sources?"
                aria-describedby="ha-note"
              />
              {busy ? (
                <button type="button" className="ha-send" onClick={stop}>
                  <Square size={14} fill="currentColor" aria-hidden /> Stop
                </button>
              ) : (
                <button type="submit" className="ha-send" disabled={!draft.trim()} aria-describedby={draft.trim() ? undefined : "ha-empty"}>
                  <ArrowUp size={18} strokeWidth={2.6} aria-hidden /> Ask
                </button>
              )}
            </div>
            <p id="ha-note" className="ha-note">
              {PIP_NOTICE}
              {!consented ? " Sending your first question means you're OK with that." : null}
            </p>
            <span id="ha-empty" className="visually-hidden">
              Type a question to ask Pip.
            </span>
          </form>

          {turns.length === 0 ? (
            <ul className="ha-starters" aria-label="Questions to try">
              {STARTERS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => ask(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="ha-out" aria-live="polite" aria-busy={busy}>
              {lastUser ? <p className="ha-you">You asked: {lastUser.content}</p> : null}
              {answer ? <PipAnswer turn={answer} last onRetry={retry} onAsk={ask} /> : null}
              {answer?.done ? (
                <Link href="/ask" className="ha-continue">
                  Continue in Ask Pip <ArrowRight size={16} aria-hidden />
                </Link>
              ) : null}
            </div>
          )}

          {error ? (
            <div className="ha-error" role="alert">
              <p>{error.message}</p>
              {error.kind === "config" ? (
                <p>The lessons and practice all work without it.</p>
              ) : (
                <button type="button" className="ha-retry" onClick={retry}>
                  Try again
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
