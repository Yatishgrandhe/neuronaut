import Link from "next/link";
import { Pip } from "@/components/Pip";
import { faq, first, headline, lessonCount, lessonLength, steps, sub, units } from "./data";
import { SampleQuestion } from "./lab-client";
import { SkyHero, SkyNav } from "./sky-shared";

const start = `/lesson/${first.id}`;
const pad = (n: number) => String(n).padStart(2, "0");

function Nav({ cls, cta = "Start lesson 1" }: { cls: string; cta?: string }) {
  return (
    <header className={`${cls}-nav`}>
      <Link href="/" className={`${cls}-mark`}>
        Neuronaut
      </Link>
      <nav aria-label="Main">
        <Link href="/learn">Learn</Link>
        <Link href="/practice">Practice</Link>
        <Link href="/ask">Ask Pip</Link>
        <Link href="/about">About</Link>
      </nav>
      <Link href={start} className={`${cls}-navcta`}>
        {cta}
      </Link>
    </header>
  );
}

function Faq({ cls }: { cls: string }) {
  return (
    <dl className={`${cls}-faq`}>
      {faq.map((f) => (
        <div key={f.q}>
          <dt>{f.q}</dt>
          <dd>{f.a}</dd>
        </div>
      ))}
    </dl>
  );
}

/* 1. Notebook: the current identity pushed further. Ruled paper, serif, margin notes in pencil. */
export function Notebook() {
  return (
    <div className="lv lv-nb">
      <Nav cls="nb" />
      <section className="nb-hero">
        <p className="nb-margin" aria-hidden>
          start here
        </p>
        <h1>
          Short lessons on how AI works, and how to use it <span className="nb-circle">honestly</span>.
        </h1>
        <p className="nb-sub">{sub}</p>
        <div className="nb-actions">
          <Link href={start} className="nb-btn">
            Start lesson 1
          </Link>
          <Link href="/ask" className="nb-link">
            or ask Pip a question
          </Link>
        </div>
        <p className="nb-facts">
          Free. No account. {lessonLength} lessons.
        </p>
      </section>

      <section className="nb-index" aria-labelledby="nb-index-h">
        <h2 id="nb-index-h">Contents</h2>
        {units.map((u) => (
          <div key={u.id} className="nb-unit">
            <h3>
              <span className="nb-num">Unit {u.n}</span> {u.title}
            </h3>
            <ol>
              {u.lessons.map((l, i) => (
                <li key={l.id}>
                  <Link href={`/lesson/${l.id}`}>
                    <span>
                      {u.n}.{i + 1} {l.title}
                    </span>
                    <span className="nb-dots" aria-hidden />
                    <span>{l.minutes} min</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section className="nb-try">
        <p className="nb-margin" aria-hidden>
          try one
        </p>
        <SampleQuestion className="sq nb-sq" />
      </section>

      <section className="nb-qa">
        <h2>Questions people ask</h2>
        <Faq cls="nb" />
      </section>
      <footer className="nb-end">
        <Link href={start} className="nb-btn">
          Start lesson 1
        </Link>
      </footer>
    </div>
  );
}

/* 2. Tokens: the page split into the pieces a model actually reads. */
export function Tokens() {
  const words = headline.match(/\w+|[^\w\s]/g) ?? [];
  return (
    <div className="lv lv-tk">
      <Nav cls="tk" cta="Run lesson 1" />
      <section className="tk-hero">
        <p className="tk-prompt">
          <span aria-hidden>&gt;</span> neuronaut --for high-schoolers
        </p>
        <h1 aria-label={headline}>
          {words.map((w, i) => (
            <span key={i} className="tk-tok" data-hot={w === "honestly" || undefined} aria-hidden>
              <span className="tk-id">{(i * 977 + 314) % 50257}</span>
              {w}
            </span>
          ))}
        </h1>
        <p className="tk-sub">{sub}</p>
        <div className="tk-actions">
          <Link href={start} className="tk-btn">
            Start lesson 1
          </Link>
          <Link href="/ask" className="tk-link">
            ask Pip
          </Link>
        </div>
        <p className="tk-caption">
          A chatbot never sees words, only numbered pieces called tokens (these numbers are made up; real ones depend on the
          model). The lesson &ldquo;Inside a chatbot&rdquo; shows how it works.
        </p>
      </section>

      <section className="tk-units">
        {units.map((u) => (
          <article key={u.id}>
            <p className="tk-path">unit_{u.n}/</p>
            <h2>{u.title}</h2>
            <p>{u.description}</p>
            <ul>
              {u.lessons.map((l) => (
                <li key={l.id}>
                  <Link href={`/lesson/${l.id}`}>{l.title}</Link>
                  <span>{l.minutes}m</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="tk-try">
        <SampleQuestion className="sq tk-sq" />
      </section>
      <section className="tk-qa">
        <Faq cls="tk" />
      </section>
    </div>
  );
}

/* 3. Poster: International Typographic Style. Grid, scale, one colour. */
export function Poster() {
  return (
    <div className="lv lv-ps">
      <Nav cls="ps" />
      <section className="ps-hero">
        <h1>
          How AI works.
          <br />
          How to use it honestly.
        </h1>
        <div className="ps-hero-side">
          <p>{sub}</p>
          <Link href={start} className="ps-btn">
            Start lesson 1
          </Link>
          <p className="ps-facts">
            Free / no account / {lessonCount} lessons / {lessonLength}
          </p>
        </div>
      </section>

      <section className="ps-units">
        {units.map((u) => (
          <article key={u.id}>
            <span className="ps-big" aria-hidden>
              {pad(u.n)}
            </span>
            <div>
              <h2>{u.title}</h2>
              <p className="ps-tag">{u.tagline}</p>
              <ol>
                {u.lessons.map((l) => (
                  <li key={l.id}>
                    <Link href={`/lesson/${l.id}`}>{l.title}</Link>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </section>

      <section className="ps-steps">
        {steps.map((s, i) => (
          <div key={s.title}>
            <span className="ps-step-n">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </section>
      <section className="ps-qa">
        <h2>Questions</h2>
        <Faq cls="ps" />
      </section>
    </div>
  );
}

/* 4. Night sky: the real ISS photograph, a quiet serif, and a ledger index that stays with you. */
export function Sky() {
  return (
    <div className="lv lv-sk">
      <SkyNav />
      <SkyHero />

      <div className="sk-body">
        <nav className="sk-ledger" aria-label="On this page">
          <a href="#sk-units">The course</a>
          <a href="#sk-how">How a lesson works</a>
          <a href="#sk-try">Try a question</a>
          <a href="#sk-qa">Questions</a>
        </nav>
        <div className="sk-main">
          <section id="sk-units">
            <h2>The course</h2>
            {units.map((u) => (
              <article key={u.id} className="sk-unit">
                <p className="sk-unit-n">Unit {u.n}</p>
                <h3>{u.title}</h3>
                <p>{u.description}</p>
                <p className="sk-lessons">
                  {u.lessons.map((l) => (
                    <Link key={l.id} href={`/lesson/${l.id}`}>
                      {l.title}
                    </Link>
                  ))}
                </p>
              </article>
            ))}
          </section>
          <section id="sk-how">
            <h2>How a lesson works</h2>
            <ol className="sk-steps">
              {steps.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </section>
          <section id="sk-try">
            <SampleQuestion className="sq sk-sq" />
          </section>
          <section id="sk-qa">
            <h2>Questions</h2>
            <Faq cls="sk" />
          </section>
        </div>
      </div>
    </div>
  );
}

/* 5. Sticker: chunky, warm, Pip front and centre, and a real question in the hero. */
export function Sticker() {
  return (
    <div className="lv lv-st">
      <Nav cls="st" cta="Play lesson 1" />
      <section className="st-hero">
        <div className="st-hero-text">
          <h1>
            Learn how AI works. <span>Use it honestly.</span>
          </h1>
          <p>{sub}</p>
          <div className="st-actions">
            <Link href={start} className="st-btn">
              Start lesson 1
            </Link>
            <Link href="/ask" className="st-btn st-btn-2">
              Ask Pip
            </Link>
          </div>
        </div>
        <div className="st-card">
          <span className="st-pip" aria-hidden>
            <Pip pose="wave" size={88} />
          </span>
          <SampleQuestion className="sq st-sq" />
        </div>
      </section>

      <section className="st-units">
        {units.map((u) => (
          <article key={u.id} data-unit={u.n}>
            <p className="st-badge">Unit {u.n}</p>
            <h2>{u.title}</h2>
            <p>{u.tagline}</p>
            <p className="st-count">
              {u.lessons.length} lessons
            </p>
            <Link href={`/lesson/${u.lessons[0].id}`}>Start unit {u.n}</Link>
          </article>
        ))}
      </section>

      <section className="st-steps">
        {steps.map((s, i) => (
          <div key={s.title}>
            <span className="st-step-n">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </section>
      <section className="st-qa">
        <Faq cls="st" />
      </section>
    </div>
  );
}
