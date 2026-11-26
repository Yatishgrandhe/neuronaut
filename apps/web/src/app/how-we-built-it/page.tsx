import type { Metadata } from "next";
import Link from "next/link";
import { allLessons, modules, totalExercises } from "@neuronaut/core";
import { TEAM_GAP } from "@/lib/records";

export const metadata: Metadata = {
  title: "How we built it",
  description: "How Neuronaut was researched, designed and built, which parts AI helped with, and where the word planet came from.",
};

/** Who did what. null = the team must fill it in (TODO(team)). */
const PARTS: { part: string; student: string | null; ai: string }[] = [
  { part: "Research and event rules", student: null, ai: "Claude Code ran research passes and drafted the plan." },
  { part: "Lesson text and questions", student: null, ai: "To be confirmed by the team." },
  { part: "Word planet renderer (Rust/WebAssembly)", student: null, ai: "To be confirmed by the team." },
  { part: "Site code and design", student: null, ai: "Built with Claude Code." },
  { part: "Design review", student: null, ai: "Haiku agents role-played five reviewers over 8 rounds." },
];

export default function HowWeBuiltItPage() {
  return (
    <article className="wrap doc">
      <header className="doc-head">
        <h1>How we built it</h1>
        <p className="lede">
          Neuronaut is a TSA Webmaster project: {modules.length} modules, {allLessons.length} lessons and {totalExercises()}{" "}
          practice questions about how AI works, how to use it well, and how to use it honestly. This page says how it was made
          and where AI helped, because a site about honest AI use should be honest about its own.
        </p>
      </header>

      <h2>Process</h2>
      <ol>
        <li>Read the event rules and wrote down what judges must find: three modules, progress tracking, separate pages, sources, this checklist and a work log.</li>
        <li>Mapped lessons to published AI-literacy frameworks (listed on <Link href="/sources">Sources</Link>), then wrote our own lessons.</li>
        <li>Designed the look, built the site, and tested it against an accessibility and anti-template checklist.</li>
        <li>Ran a simulated review with five reviewer roles and fixed what they found, including two broken document links.</li>
        <li>Every dated step is on the <Link href="/work-log">work log</Link>.</li>
      </ol>

      <h2>Who did what</h2>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th scope="col">Part</th>
              <th scope="col">What students did</th>
              <th scope="col">What AI did</th>
            </tr>
          </thead>
          <tbody>
            {PARTS.map((p) => (
              <tr key={p.part}>
                <td data-label="Part">{p.part}</td>
                <td data-label="Students">{p.student ?? <span className="doc-gap">{TEAM_GAP}</span>}</td>
                <td data-label="AI">{p.ai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Where the word planet came from</h2>
      <p>
        The hero planet is ours, not a downloaded model. It is a small Rust program compiled to WebAssembly that draws the words
        from our lessons, split into tokens the way a language model reads them, onto a turning sphere with WebGL2. A still image
        of it loads first, so the page is fast; the live planet only starts on devices that can draw it smoothly, and never when
        reduced motion is on.
      </p>
      <p>
        This project folder has no version-control history yet, so the dates come from the files themselves: the renderer
        (<code>apps/web/planet/src/lib.rs</code>) and its build file were last changed on Nov 20, 2026 between 8:43 and 8:51 pm,
        and the still images were rendered at 8:45–8:46 pm the same day.
      </p>

      <h2>Is the AI-written content checked?</h2>
      <p>
        Every lesson and practice question on the site is fixed text, the same for everyone, and the team reviews all{" "}
        {allLessons.length} lessons before submission. The only text an AI writes live is Ask Pip&rsquo;s answers. Each one is
        labelled as AI-written, and it can be wrong.
      </p>

      <h2>Who made this?</h2>
      <p>
        A high school TSA team, for the 2026-27 Webmaster event. <span className="doc-gap">Team names: {TEAM_GAP.toLowerCase()}.</span>
      </p>

      <h2>Our AI-use reflection</h2>
      <p className="doc-gap">{TEAM_GAP}. This part must be written by the students themselves.</p>

      <p>
        Design reasons are on <Link href="/design-decisions">Design decisions</Link>. Licences are on the{" "}
        <Link href="/copyright-checklist">copyright checklist</Link>.
      </p>
    </article>
  );
}
