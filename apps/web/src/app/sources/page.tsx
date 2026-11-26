import type { Metadata } from "next";
import Link from "next/link";
import { modules, photoCredit, photos, type PhotoKey } from "@neuronaut/core";
import { ASSETS, TEAM_GAP } from "@/lib/records";

export const metadata: Metadata = {
  title: "Sources",
  description: "The curriculum frameworks Neuronaut's lessons are aligned with, plus every image, font and library we use.",
};

export default function SourcesPage() {
  const keys = Object.keys(photos) as PhotoKey[];
  return (
    <article className="wrap doc">
      <header className="doc-head">
        <h1>Sources</h1>
        <p className="lede">
          Our lessons are our own writing. We checked them against these frameworks and guides and link to them instead of
          copying them. Licences for every asset are on the <Link href="/copyright-checklist">copyright checklist</Link>.
        </p>
      </header>

      {modules.map((m) => (
        <section key={m.id} aria-labelledby={`src-${m.id}`}>
          <h2 id={`src-${m.id}`}>{m.title}</h2>
          <p>
            Lessons:{" "}
            {m.lessons.map((l, i) => (
              <span key={l.id}>
                {i > 0 ? ", " : ""}
                <Link href={`/lesson/${l.id}`}>{l.title}</Link>
              </span>
            ))}
            .
          </p>
          <ul>
            {m.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url}>{s.label}</a>
                {s.note ? `: ${s.note}` : null}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="src-assets">
        <h2 id="src-assets">Images, fonts and code</h2>
        <ul>
          {ASSETS.filter((a) => a.kind !== "Original work").map((a) => (
            <li key={a.item}>
              {a.source ? <a href={a.source}>{a.item}</a> : a.item}, {a.creator}. {a.license}.
              {!a.source ? <span className="doc-gap"> Source link: {TEAM_GAP.toLowerCase()}.</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="src-photos">
        <h2 id="src-photos">Photographers</h2>
        <ul>
          {keys.map((k) => {
            const p = photos[k];
            const c = photoCredit(p);
            return (
              <li key={k}>
                <a href={c.photoUrl}>{p.alt}</a> by <a href={c.photographerUrl}>@{p.by}</a> on Unsplash
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
