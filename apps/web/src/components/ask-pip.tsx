"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUp, ShieldCheck, Square } from "lucide-react";
import { getLesson } from "@neuronaut/core";
import { Pip } from "./brand";
import { PipAnswer } from "./pip-answer";
import { PIP_NOTICE, usePipChat, usePipConsent } from "./use-pip-chat";

const SUGGESTIONS = [
  "How can I tell if a citation from a chatbot is real?",
  "Why do chatbots sound confident when they're wrong?",
  "Is it okay to use AI to brainstorm for an essay?",
  "What's the difference between AI and machine learning?",
];

export function AskPip() {
  const params = useSearchParams();
  const lesson = getLesson(params.get("lesson") ?? "");
  const { consented, accept } = usePipConsent();
  const { turns, error, send, stop, retry, busy } = usePipChat({ lessonId: lesson?.id });
  const [draft, setDraft] = useState(() => (params.get("q") ?? "").slice(0, 1000));
  const endRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  // Follow the answer only while the reader is already at the bottom; never pull them back down.
  useEffect(() => {
    const onScroll = () => {
      pinned.current = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (pinned.current) endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  const submit = (text: string) => {
    if (!text.trim() || busy) return;
    setDraft("");
    pinned.current = true;
    void send(text);
  };

  if (!consented) {
    return (
      <div className="wrap-narrow tutor-consent">
        <Pip mood="happy" size={104} />
        <h1>Ask Pip</h1>
        <p className="lede">
          Pip is an AI tutor that answers questions about the lessons. Before you start, here&rsquo;s how it works:
        </p>
        <ul className="consent-list">
          <li>
            Your question, the earlier messages in the chat, and matching lesson text are sent to <strong>Claude</strong>, an AI
            model made by Anthropic, to write Pip&rsquo;s answers. Neuronaut doesn&rsquo;t store them.
          </li>
          <li>Don&rsquo;t share personal information like your full name, address, school or passwords.</li>
          <li>Pip can make mistakes. Check important facts, just like the Verification Lab teaches.</li>
          <li>Pip explains and shows you how, but won&rsquo;t write graded work. Follow your class&rsquo;s AI rules.</li>
          <li>Ask Pip is for ages 13 and up.</li>
        </ul>
        <button type="button" className="btn btn-spark btn-lg" onClick={accept}>
          I understand, start chatting
        </button>
        <p className="consent-note">
          <ShieldCheck size={16} aria-hidden /> See our <a href="/privacy">privacy page</a> for details.
        </p>
      </div>
    );
  }

  return (
    <div className="tutor">
      <div className="wrap-narrow tutor-log" aria-live="polite" aria-busy={busy}>
        {turns.length === 0 ? (
          <div className="tutor-empty">
            <Pip mood="idle" size={88} className="pip-float" />
            <h1>What do you want to know?</h1>
            {lesson && <p className="tutor-context">Asking about: {lesson.title}</p>}
            <ul className="suggestions">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => submit(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <h1 className="visually-hidden">Ask Pip</h1>
            {turns.map((t, i) => (
              <div key={i} className={`msg msg-${t.role}`}>
                {t.role === "assistant" && <Pip mood={busy && i === turns.length - 1 ? "think" : "happy"} size={36} />}
                <div className="msg-bubble">
                  {t.role === "assistant" ? (
                    <PipAnswer turn={t} last={i === turns.length - 1} onRetry={retry} onAsk={submit} />
                  ) : (
                    <p>{t.content}</p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        {error && (
          <div className="tutor-error" role="alert">
            <p>{error.message}</p>
            {error.kind !== "config" ? (
              <button type="button" className="btn-secondary" onClick={retry}>
                Try again
              </button>
            ) : null}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="tutor-bar"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
      >
        <div className="wrap-narrow tutor-bar-row">
          <label className="visually-hidden" htmlFor="ask">
            Ask Pip a question
          </label>
          <textarea
            id="ask"
            rows={1}
            maxLength={1000}
            placeholder="Ask about AI, prompts, or using it honestly…"
            value={draft}
            aria-describedby="ask-note"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
          />
          {busy ? (
            <button type="button" className="send" aria-label="Stop Pip's answer" onClick={stop}>
              <Square size={16} fill="currentColor" aria-hidden />
            </button>
          ) : (
            <button type="submit" className="send" aria-label="Send" disabled={!draft.trim()} title={draft.trim() ? undefined : "Type a question first"}>
              <ArrowUp size={20} strokeWidth={2.6} aria-hidden />
            </button>
          )}
        </div>
        <p id="ask-note" className="wrap-narrow tutor-note">
          {PIP_NOTICE}
        </p>
      </form>
    </div>
  );
}
