import { Fragment } from "react";
import Link from "next/link";
import { SampleQuestion } from "./lab-client";
import { faq, first, lessonCount, steps, units } from "./data";
import { SkyHero, SkyNav } from "./sky-shared";

/** Minutes to a mission clock stamp, "T+HH:MM". */
function clock(minutes: number) {
  const m = Math.round(minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `T+${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Walk the course once. Each lesson's stamp is the time elapsed before it starts. */
function plan() {
  let elapsed = 0;
  const phases = units.map((u) => ({
    ...u,
    lessons: u.lessons.map((l) => {
      const at = elapsed;
      elapsed += l.minutes;
      return { ...l, at };
    }),
  }));
  return { phases, total: elapsed };
}

/** Night sky, the course as a mission timeline: one log, with elapsed-time stamps from the real lesson minutes. */
export function SkyLog() {
  const { phases, total } = plan();
  return (
    <div className="lv lv-sk lv-sk-log">
      <SkyNav />
      <SkyHero />
      <main className="skg-main">
        <section className="skg-section" aria-labelledby="skg-flight">
          <h2 id="skg-flight">Flight plan</h2>
          <ol className="skg-log">
            {phases.map((p) => (
              <Fragment key={p.id}>
                <li className="skg-phase">
                  <h3>
                    Phase {p.n}: {p.title}
                  </h3>
                  <p className="skg-tagline">{p.tagline}</p>
                </li>
                {p.lessons.map((l) => (
                  <li key={l.id} className="skg-entry">
                    <p className="skg-stamp">{clock(l.at)}</p>
                    <p className="skg-entry-title">
                      <Link href={`/lesson/${l.id}`}>{l.title}</Link>
                    </p>
                    <p className="skg-len">{l.minutes} min</p>
                  </li>
                ))}
              </Fragment>
            ))}
            <li className="skg-end">
              <p className="skg-stamp">{clock(total)}</p>
              <p className="skg-end-title">Total course time</p>
              <p className="skg-len">
                {lessonCount} lessons, {total} minutes
              </p>
            </li>
          </ol>
        </section>

        <section className="skg-section" aria-labelledby="skg-how">
          <h2 id="skg-how">How a lesson works</h2>
          <ol className="skg-notes">
            {steps.map((s, i) => (
              <li key={s.title}>
                <p className="skg-note-n">Note {i + 1}</p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="skg-section" aria-labelledby="skg-try">
          <h2 id="skg-try">Try a question</h2>
          <SampleQuestion className="sq sk-sq" />
        </section>

        <section className="skg-section" aria-labelledby="skg-qa">
          <h2 id="skg-qa">Questions</h2>
          <dl className="sk-faq">
            {faq.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="skg-finish">
          <Link href={`/lesson/${first.id}`} className="skg-start">
            Start lesson 1
          </Link>
        </p>
      </main>
    </div>
  );
}
