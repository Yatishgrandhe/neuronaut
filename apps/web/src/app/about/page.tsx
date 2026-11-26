import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { modules, photoCredit, photos, type PhotoKey } from "@neuronaut/core";
import { Photo } from "@/components/photo";
import { Mark, Pip } from "@/components/brand";

export const metadata: Metadata = {
  title: "About & sources",
  description: "Why Neuronaut exists, how it's designed, where the content comes from, and photo credits.",
};

export default function AboutPage() {
  const keys = Object.keys(photos) as PhotoKey[];
  return (
    <div className="about">
      <header className="wrap about-hero">
        <div>
          <h1>Why Neuronaut exists</h1>
          <p className="lede">
            Students are already using AI. Most were never taught how it works, when it&rsquo;s wrong, or how to use it
            honestly. Neuronaut teaches those three things in short, game-like lessons so AI literacy feels like progress, not
            a lecture.
          </p>
        </div>
        <figure className="about-photo">
          <Photo name="classroom" width={720} height={540} priority />
        </figure>
      </header>

      <section className="wrap about-section" aria-labelledby="design-h">
        <h2 id="design-h">How it&rsquo;s designed</h2>
        <div className="about-cols">
          <Card as="article">
            <h3 className="t-h3">Learning science first</h3>
            <p>Short lessons, retrieval practice with immediate explanations, and spaced review of missed questions. These are
            well-studied ways to make learning last.</p>
          </Card>
          <Card as="article">
            <h3 className="t-h3">Motivation without pressure</h3>
            <p>XP, levels, streaks and badges make progress visible. Streak freezes cover missed days, mistakes never cost
            lives, and there are no public leaderboards.</p>
          </Card>
          <Card as="article">
            <h3 className="t-h3">Private by default</h3>
            <p>No account, no ads, no trackers. Progress lives in your browser. Ask Pip sends only your questions to Claude, and
            only after you agree.</p>
          </Card>
        </div>
      </section>

      <section className="wrap about-section brand-section" aria-labelledby="brand-h">
        <h2 id="brand-h">The mark and the mascot</h2>
        <div className="brand-row">
          <div className="brand-tile">
            <Mark size={120} />
          </div>
          <p>
            The Neuronaut mark is an <strong>N</strong> drawn as a neural pathway. It climbs from a starting node, through
            practice, to a glowing goal. Pip, our guide, is one of those nodes come to life. Pip cheers when you&rsquo;re
            right and thinks with you when you&rsquo;re not.
          </p>
          <div className="brand-tile">
            <Pip mood="happy" size={120} />
          </div>
        </div>
      </section>

      <section className="wrap about-section" aria-labelledby="src-h">
        <h2 id="src-h">Curriculum sources</h2>
        <p className="about-intro">
          All lesson text and questions were written for Neuronaut. We aligned them with these frameworks and guides; we
          link to them rather than copy them.
        </p>
        <div className="about-cols">
          {modules.map((m) => (
            <div key={m.id}>
              <h3>{m.title}</h3>
              <ul className="src-list">
                {m.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url}>
                      {s.label} <ExternalLink size={14} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap about-section" id="tsa" aria-labelledby="tsa-h">
        <h2 id="tsa-h">TSA documentation</h2>
        <ul className="src-list">
          <li>
            <Link href="/copyright-checklist">Copyright checklist</Link> (<a href="/docs/student-copyright-checklist.pdf">PDF</a>)
          </li>
          <li>
            <Link href="/work-log">Work log</Link> (<a href="/docs/student-work-log.pdf">PDF</a>)
          </li>
          <li>
            <Link href="/sources">Sources</Link>, <Link href="/how-we-built-it">How we built it</Link> and{" "}
            <Link href="/design-decisions">Design decisions</Link>
          </li>
        </ul>
        <p className="about-intro">
          Typefaces: Gelasio (Eben Sorkin) and Caveat (Impallari Type), both under the SIL Open Font License, self-hosted.
          Icons: Lucide (ISC License). Every asset and licence is on the copyright checklist.
        </p>
      </section>

      <section className="wrap about-section" id="credits" aria-labelledby="cr-h">
        <h2 id="cr-h">Photo credits</h2>
        <p className="about-intro">
          Photographs are from <a href="https://unsplash.com/?utm_source=neuronaut&utm_medium=referral">Unsplash</a> and used
          under the <a href="https://unsplash.com/license">Unsplash License</a>. Thank you to every photographer.
        </p>
        <ul className="credit-grid">
          {keys.map((k) => {
            const p = photos[k];
            const c = photoCredit(p);
            return (
              <li key={k}>
                <Photo name={k} width={160} height={120} sizes="120px" />
                <p>
                  <a href={c.photoUrl}>{p.alt}</a>
                  <br />
                  by <a href={c.photographerUrl}>@{p.by}</a>
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
