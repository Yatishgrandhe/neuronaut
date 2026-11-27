import Link from "next/link";
import { faq, first, lessonCount, steps, units } from "./data";
import { SampleQuestion } from "./lab-client";
import { SkyHero, SkyNav } from "./sky-shared";

const WORDS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const start = `/lesson/${first.id}`;

/** Night sky, each unit a full-screen chapter. */
export function SkyChapters() {
  return (
    <div className="lv lv-sk lv-sk-chapters">
      <SkyNav />
      <SkyHero />
      <main className="skc-main">
        {units.map((u, i) => (
          <section key={u.id} className={`skc-chapter${i % 2 ? " skc-alt" : ""}`}>
            <div className="skc-inner">
              <h2 className="skc-num">Chapter {WORDS[u.n - 1] ?? u.n}</h2>
              <h3 className="skc-title">{u.title}</h3>
              <p className="skc-tagline">{u.tagline}</p>
              <p className="skc-desc">{u.description}</p>
              <p className="skc-count">{u.lessons.length} lessons</p>
              <ol className="skc-lessons" aria-label={`Lessons in ${u.title}`}>
                {u.lessons.map((l) => (
                  <li key={l.id}>
                    <Link href={`/lesson/${l.id}`}>{l.title}</Link>
                    <span className="skc-min">{l.minutes} min</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ))}

        <section className="skc-after">
          <div className="skc-inner">
            <h2 className="skc-h2">How a lesson works</h2>
            <ol className="sk-steps">
              {steps.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="skc-after">
          <div className="skc-inner">
            <h2 className="skc-h2">Try a question</h2>
            <SampleQuestion className="sq sk-sq" />
          </div>
        </section>

        <section className="skc-after">
          <div className="skc-inner">
            <h2 className="skc-h2">Questions</h2>
            <dl className="sk-faq">
              {faq.map((f) => (
                <div key={f.q}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="skc-close">
          <div className="skc-inner">
            <p className="skc-closeline">
              {lessonCount} lessons. Free, and it needs no accounts.
            </p>
            <Link href={start} className="sk-btn skc-start">
              Start lesson 1
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
