import Link from "next/link";
import { faq, firstLessonHref, first, lessonLength, steps, units } from "./content";
import { HomeIndex } from "./home-index";
import { HomeQuestion } from "./home-question";

/** The page body below the hero: a sticky index on the left, the ledger on the right. */
export function HomeLedger() {
  return (
    <div className="home-sky-body">
      <HomeIndex />

      <div className="home-sky-main">
        <section id="home-course" className="home-sky-section">
          <h2>The course</h2>
          {units.map((u) => (
            <article key={u.id} className="home-sky-unit">
              <div>
                <p className="home-sky-unit-n">Unit {u.n}</p>
                <h3>{u.title}</h3>
                <p className="home-sky-unit-desc">{u.description}</p>
              </div>
              <ol className="home-sky-lessons" aria-label={`Lessons in unit ${u.n}`}>
                {u.lessons.map((l, i) => (
                  <li key={l.id}>
                    <Link href={`/lesson/${l.id}`}>
                      <span className="home-sky-l-n" aria-hidden>
                        {u.n}.{i + 1}
                      </span>
                      <span className="home-sky-l-title">{l.title}</span>
                      <span className="home-sky-l-min">{l.minutes} min</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>

        <section id="home-how" className="home-sky-section">
          <h2>How a lesson works</h2>
          <ol className="home-sky-steps">
            {steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="home-try" className="home-sky-section">
          <h2>Try a question</h2>
          <HomeQuestion />
        </section>

        <section id="home-qa" className="home-sky-section">
          <h2>Questions</h2>
          <dl className="home-sky-faq">
            {faq.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="home-sky-close" aria-label="Start">
          <p>
            Free, with no account. Lesson 1 takes {first.minutes} minutes; lessons run {lessonLength.replace("-minute", " minutes")}.
          </p>
          <Link href={firstLessonHref} className="home-sky-btn">
            Start lesson 1
          </Link>
        </section>
      </div>
    </div>
  );
}
