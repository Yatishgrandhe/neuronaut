"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { faq, first, lessonLength, steps, units } from "./data";
import { SampleQuestion } from "./lab-client";
import { SkyHero, SkyNav } from "./sky-shared";

const start = `/lesson/${first.id}`;

const SECTIONS = [
  { id: "skl-course", label: "The course" },
  { id: "skl-how", label: "How a lesson works" },
  { id: "skl-try", label: "Try a question" },
  { id: "skl-qa", label: "Questions" },
];
const SECTION_IDS = SECTIONS.map((s) => s.id);

/**
 * Tracks which section is under a thin band near the top of the viewport.
 * The band only changes state when a section edge crosses it, so one observer is enough.
 */
function useActiveSection(fallback: string) {
  const [active, setActive] = useState(fallback);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const hits = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) hits.add(e.target.id);
          else hits.delete(e.target.id);
        }
        const current = SECTION_IDS.filter((id) => hits.has(id));
        if (current.length) setActive(current[current.length - 1]);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return active;
}

/** Night sky, body as a ledger with a sticky index. The index follows the section you are reading. */
export function SkyLedger() {
  const active = useActiveSection(SECTION_IDS[0]);
  return (
    <div className="lv lv-sk lv-sk-ledger">
      <SkyNav />
      <SkyHero />

      <div className="skl-body">
        <nav className="skl-index" aria-label="On this page">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>
              {s.label}
            </a>
          ))}
        </nav>

        <div className="skl-main">
          <section id="skl-course">
            <h2>The course</h2>
            {units.map((u) => (
              <article key={u.id} className="skl-unit">
                <div className="skl-unit-head">
                  <p className="skl-unit-n">Unit {u.n}</p>
                  <h3>{u.title}</h3>
                  <p className="skl-unit-desc">{u.description}</p>
                </div>
                <ol className="skl-lessons" aria-label={`Lessons in unit ${u.n}`}>
                  {u.lessons.map((l, i) => (
                    <li key={l.id}>
                      <Link href={`/lesson/${l.id}`}>
                        <span className="skl-l-n" aria-hidden>
                          {u.n}.{i + 1}
                        </span>
                        <span className="skl-l-title">{l.title}</span>
                        <span className="skl-l-min">{l.minutes} min</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </section>

          <section id="skl-how">
            <h2>How a lesson works</h2>
            <ol className="skl-steps">
              {steps.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="skl-try">
            <h2>Try a question</h2>
            <SampleQuestion className="sq sk-sq" />
          </section>

          <section id="skl-qa">
            <h2>Questions</h2>
            <dl className="skl-faq">
              {faq.map((f) => (
                <div key={f.q}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="skl-close" aria-label="Start">
            <p>
              Free, with no account. Lesson 1 takes {first.minutes} minutes; lessons run {lessonLength.replace("-minute", " minutes")}.
            </p>
            <Link href={start} className="sk-btn">
              Start lesson 1
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
