"use client";

import Link from "next/link";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Pip } from "@/components/Pip";
import { Annotation } from "@/components/ui/Annotation";

type Msg = { from: "me" | "pip"; text: string };

const SCRIPT: Msg[] = [
  { from: "me", text: "can you just write my essay on the causes of WW1" },
  { from: "pip", text: "I won't write it, but I'll help you write a great one. What do you think the biggest cause was?" },
  { from: "me", text: "the assassination?" },
  {
    from: "pip",
    text: "Good start, that was the trigger. But why did one assassination pull in all of Europe? Think about who had promised to defend whom.",
  },
];

const SUGGESTIONS = ["Explain neural networks simply", "Quiz me on prompting", "Is this source real?"];

/**
 * "Ask Pip": a scripted sample conversation, not a live chat. The whole conversation is on the
 * page from the start (no empty box for fast scrollers); the "nice try" strike draws itself
 * once the window comes into view.
 */
export function AskPipSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, amount: 0.3 });
  const count = SCRIPT.length;

  return (
    <section className="ap" id="ask-pip" aria-labelledby="ap-h">
      <div className="wrap">
        <header className="ap-head">
          <h2 id="ap-h" className="t-h2 ap-h">
            A tutor that won&apos;t do your homework for you.
          </h2>
          <p className="t-lead ap-lead">Pip explains, quizzes you and pushes back. It won&apos;t write your essay.</p>
        </header>

        <div className="ap-stage" ref={stageRef}>
          <div className="ap-window">
            <span className="ap-pip" aria-hidden>
              <Pip pose="wave" size={72} />
            </span>

            <div className="ap-bar">
              <span className="ap-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span className="ap-bar-name">Ask Pip · sample conversation</span>
            </div>

            <div className="ap-log" role="log" aria-label="Sample conversation with Pip">
              {SCRIPT.slice(0, count).map((m, k) => {
                const bubble = (
                  <p className={`ap-bubble ${m.from === "me" ? "ap-bubble-me" : "ap-bubble-pip"}`}>{m.text}</p>
                );
                return (
                  <div
                    key={k}
                    className={`ap-row ${m.from === "me" ? "ap-row-me" : "ap-row-pip"}${k === 0 ? " ap-row-first" : ""}`}
                  >
                    {k === 0 ? (
                      <div className="ap-wrap">
                        {bubble}
                        <Annotation
                          type="strike"
                          color="#1d1d1f"
                          note="nice try"
                          notePosition="left"
                          play={inView}
                          delay={0.4}
                          className="ap-strike"
                        />
                      </div>
                    ) : (
                      bubble
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          <ul className="ap-chips" aria-label="Try asking">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <Link className="ap-chip" href={`/ask?q=${encodeURIComponent(s)}`}>
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ap-cta">
          <Link className="btn btn-primary btn-lg" href="/ask">
            Ask Pip
          </Link>
        </div>
      </div>
    </section>
  );
}
