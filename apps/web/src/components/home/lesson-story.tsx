"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { allLessons } from "@neuronaut/core";

const W = 1140;
const H = 960;

const STEPS = [
  {
    title: "Read two short ideas",
    body: "Every lesson opens with two cards that explain one idea in plain words. No video, no slides.",
    alt: "Lesson 1's first idea card, titled 'AI is a family of techniques', with a Next idea button.",
  },
  {
    title: "Answer five questions",
    body: "Multiple choice, true or false, put in order, and matching. Pick an answer, then press Check.",
    alt: "The question 'Which of these is an example of narrow AI?' with four options and 'A spam filter that sorts your email' selected.",
  },
  {
    title: "See why, right away",
    body: "Get it right and the lesson tells you why. Miss it and you get a hint and another try. No lives to lose.",
    alt: "A green 'Nice work!' banner explaining that a spam filter learned patterns from examples, with a Continue button.",
  },
  {
    title: "Get the missed ones back",
    body: "Questions you miss come back on the Review page over the next 16 days, until they stick.",
    alt: "The Review page showing '1 question ready for review' and a Start review button.",
  },
];

const src = (i: number) => `/home/step-${i + 1}.webp`;

/** Sticky walk-through on wide screens; a plain stacked list on phones and with reduced motion. */
export function LessonStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="ls" aria-labelledby="ls-h">
      <div className="wrap">
        <h2 id="ls-h" className="t-h2 ls-h">
          One lesson, step by step
        </h2>
        <p className="t-lead ls-lead">
          This is lesson 1, exactly as you&rsquo;ll see it. It takes about {allLessons[0].minutes} minutes.
        </p>
        <div className="ls-grid">
          <ol className="ls-steps">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-i={i}
                className="ls-step"
                data-active={active === i}
              >
                <span className="ls-num" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="ls-title">{s.title}</h3>
                <p className="ls-body">{s.body}</p>
                {/* Stacked layout (phones, reduced motion): each step carries its own screenshot. */}
                <img className="ls-inline" src={src(i)} alt={s.alt} width={W} height={H} loading="lazy" decoding="async" />
              </li>
            ))}
          </ol>
          <figure className="ls-stage">
            {STEPS.map((s, i) => (
              <img
                key={s.title}
                src={src(i)}
                alt={active === i ? s.alt : ""}
                aria-hidden={active === i ? undefined : true}
                width={W}
                height={H}
                loading="lazy"
                decoding="async"
                data-on={active === i}
              />
            ))}
            <figcaption>
              Step {active + 1} of {STEPS.length}: {STEPS[active].title}
            </figcaption>
          </figure>
        </div>
        <p className="ls-try">
          <Link href={`/lesson/${allLessons[0].id}`}>Open lesson 1 yourself</Link>
        </p>
      </div>
    </section>
  );
}
