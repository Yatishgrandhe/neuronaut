import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Design decisions",
  description: "Why Neuronaut looks and works the way it does: palette, type, layout, the hero, and accessibility.",
};

const DECISIONS: { topic: string; choice: string; why: string }[] = [
  {
    topic: "Idea",
    choice: "A fact-checker’s notebook: warm paper, ink, and an orange teacher’s-pen annotation layer.",
    why: "The course is about checking AI, so the site looks like a page someone is checking. It also keeps us away from the purple-gradient look most AI sites share.",
  },
  {
    topic: "Color",
    choice: "Near-black ink on white and warm paper, one orange accent (#c2410c) for the main button, links and margin notes. A matching dark theme.",
    why: "One accent means the next step is always obvious. Orange on white passes 4.5:1 contrast for text. Green and red are only used for right and wrong, always with an icon or words.",
  },
  {
    topic: "Type",
    choice: "Gelasio for headings and reading, the system sans for small controls, Caveat only for the handwritten margin notes.",
    why: "A readable serif suits long lessons; the handwriting is the “teacher’s pen” and is used sparingly so it stays special.",
  },
  {
    topic: "Hero",
    choice: "Our own word planet rising under a NASA photo of the Milky Way from the ISS, with the essay question answered right there.",
    why: "It shows the core idea of the course (AI reads text as tokens) instead of decoration, and it is original work. A still image loads first so the page stays fast.",
  },
  {
    topic: "Layout",
    choice: "Five home sections, each a different layout: split hero, a ruled course list, a step-by-step lesson walk-through, a live Ask Pip panel, and a short list of real questions.",
    why: "Varied layouts give the page a rhythm, and every section answers a question a visitor actually has. We avoided made-up testimonials, logo bars and pricing because Neuronaut is free and new.",
  },
  {
    topic: "Motivation",
    choice: "XP, levels, streaks with freezes, and badges, but no lives, no public leaderboards and no guilt messages.",
    why: "Progress you can see helps people come back; pressure and public ranking can make learners anxious.",
  },
  {
    topic: "Privacy",
    choice: "No account. Progress stays in your browser. Ask Pip asks first, and says on screen what it sends.",
    why: "Students shouldn’t have to hand over personal data to learn. The only thing that leaves the device is what you type into Ask Pip.",
  },
  {
    topic: "Accessibility",
    choice: "Visible focus everywhere, 44 px touch targets, real headings and labels, reduced-motion support, and layouts that work at 320 px and 200% zoom.",
    why: "We aim for WCAG 2.2 AA so every student can use it, including on a phone or a school Chromebook.",
  },
];

export default function DesignDecisionsPage() {
  return (
    <article className="wrap doc">
      <header className="doc-head">
        <h1>Design decisions</h1>
        <p className="lede">
          The choices behind Neuronaut and the reason for each. More on the process is on{" "}
          <Link href="/how-we-built-it">How we built it</Link>.
        </p>
      </header>
      <dl className="doc-dl">
        {DECISIONS.map((d) => (
          <div key={d.topic} style={{ display: "contents" }}>
            <dt>{d.topic}</dt>
            <dd>
              <p>{d.choice}</p>
              <p className="doc-why">
                <strong>Why:</strong> {d.why}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
