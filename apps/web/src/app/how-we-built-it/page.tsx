import type { Metadata } from "next";
import Link from "next/link";
import { BKT, GRACE_DAYS, HALF_LIFE_DAYS, MASTERED, PRACTICE_SIZE, XP, allLessons, modules, totalExercises } from "@neuronaut/core";

export const metadata: Metadata = {
  title: "How we built it",
  description:
    "The learning problem Neuronaut solves, how its mastery model, spaced review and adaptive practice work, how it is tested, and where AI helped.",
};

/** Who did what. `student: null` = the team must fill it in (TODO(team)). */
const PARTS: { part: string; student: string | null; ai: string }[] = [
  { part: "Research and event rules", student: null, ai: "Claude Code ran research passes and drafted the plan." },
  { part: "Lesson text and questions", student: null, ai: "Team to confirm." },
  { part: "Learning engine (mastery, review, practice)", student: null, ai: "Written with Claude Code; the team reviewed and tested it." },
  { part: "Word planet renderer (Rust/WebAssembly)", student: null, ai: "Team to confirm." },
  { part: "Site code and design", student: null, ai: "Built with Claude Code." },
  { part: "Design review", student: null, ai: "AI role-play (not real judges): Haiku agents acted as five reviewers." },
];

const TESTS = 31;

export default function HowWeBuiltItPage() {
  const hasStudents = PARTS.some((p) => p.student);
  return (
    <article className="wrap doc">
      <header className="doc-head">
        <h1>How we built it</h1>
        <p className="lede">
          Neuronaut teaches high schoolers how AI works, how to use it well, and how to use it honestly: {modules.length} modules,{" "}
          {allLessons.length} lessons and {totalExercises()} practice questions. This page explains the problem we set out to
          solve, how the learning engine decides what you see next, how we tested it, and where AI helped.
        </p>
        <p className="doc-note">
          <strong>Before submission:</strong> the team adds names, who did each part, and the AI-use reflection in their own
          words. Those sections fill in here automatically.
        </p>
      </header>

      <h2>The learning problem</h2>
      <p>
        Students already use AI for school, but most have never been taught what it is doing or when it is wrong. A one-off
        assembly or worksheet doesn&rsquo;t stick: people forget most of a new idea within days unless they come back to it.
        So Neuronaut has two jobs. Teach the ideas in short lessons, and then bring each idea back at the right time until the
        learner really knows it.
      </p>

      <h2>How the pieces fit</h2>
      <dl className="doc-dl">
        <dt>packages/core</dt>
        <dd>
          Pure TypeScript with no browser code: the lessons, answer checking, XP and streaks, the review scheduler, the mastery
          model and practice selection. Every function takes the date as an input, so tests are exact.
        </dd>
        <dt>apps/web</dt>
        <dd>Next.js site. It shows lessons and the dashboard and saves progress in this browser (no account).</dd>
        <dt>Ask Pip</dt>
        <dd>
          The only part that uses a language model. A small search ranks our own lesson passages (BM25), and Claude answers from
          them. It is told to explain, not to write graded work.
        </dd>
      </dl>

      <h2 id="mastery">How Neuronaut decides what you see next</h2>
      <h3>1. Mastery: Bayesian Knowledge Tracing</h3>
      <p>
        Each lesson is one skill. For each one we keep a number between 0 and 1: how likely it is that you know it. It starts at{" "}
        {BKT.init}. After every answer we update it with Bayes&rsquo; rule. A right answer might mean you know it, or you
        guessed; a wrong answer might mean you don&rsquo;t know it, or you slipped (we allow a {BKT.slip * 100}% slip). Then
        we add a {BKT.learn * 100}% chance that you learned it from the explanation you just read.
      </p>
      <p>
        Guessing depends on the question. A true-or-false guess is right half the time, a four-option question a quarter of
        the time, and putting tiles in order by luck almost never. So a right ordering answer raises your estimate more than a
        right true-or-false answer. At {MASTERED * 100}% a skill counts as mastered. One wrong answer after many right ones is
        treated as a slip; three in a row are not.
      </p>
      <h3>2. Forgetting</h3>
      <p>
        Plain Bayesian Knowledge Tracing assumes you never forget. We added a forgetting curve. For the first {GRACE_DAYS} days
        after you practise nothing changes, which matches the review schedule&rsquo;s early gaps. After that, the part of your
        estimate above the starting value halves every {HALF_LIFE_DAYS} days. A lesson you aced a month ago is no longer
        &ldquo;Mastered&rdquo;, so it comes back in Practice.
      </p>
      <h3>3. Practice picks your weakest lessons</h3>
      <p>
        <Link href="/practice">Practice</Link> builds a set of {PRACTICE_SIZE} questions from lessons you have finished. Each
        lesson&rsquo;s chance of being picked is one minus your mastery, so a lesson at 40% comes up three times as often as one
        at 80%. Lessons you&rsquo;ve mastered sit out unless everything is mastered. Practice and Review share one queue. A
        question you miss in practice goes into Review, and a right answer on a question that is due counts as reviewing
        it.
      </p>
      <h3>4. Review: spaced repetition</h3>
      <p>
        A question you miss comes back the same day, then after 1, 3, 7 and 16 days (a Leitner system). Each right answer moves it to the next,
        longer gap; a miss sends it back to the start. Right five times in a row and it leaves Review.
      </p>
      <h3>5. The &ldquo;Next&rdquo; card</h3>
      <p>
        The dashboard puts these together in a fixed order. First come reviews that are due, because spacing only works if you
        review on time. Next comes a finished lesson below 60%, then the next new lesson, and finally practice on whatever is
        weakest.
      </p>
      <h3>Points, levels and streaks</h3>
      <p>
        A first-try answer is worth {XP.correctFirstTry} XP and a second-try answer {XP.correctAfterRetry}. Finishing a lesson
        adds {XP.lessonComplete}, and a perfect lesson adds {XP.perfectBonus} more. Repeating a lesson earns half, and practice
        earns less than new lessons, so grinding never beats learning something new. A missed day uses up a streak freeze
        automatically; you earn one every seven days in a row.
      </p>

      <h2>How we tested it</h2>
      <ul>
        <li>
          {TESTS} automated tests on the engine (<code>pnpm --filter @neuronaut/core test</code>). They check the Bayes formula
          against numbers worked out by hand, and properties over thousands of random cases: estimates stay between 0 and 1, a
          right answer never lowers mastery, and more days never raise it. They also cover streak freezes, review timing,
          importing damaged or old save files, and merging two saves.
        </li>
        <li>
          The tests found two real bugs, both now fixed. Merging two saves dropped the review queue. And when the first save
          was the newer one, the merge ignored the other save completely. One known limit is still there: merging keeps the
          larger XP total rather than adding the two, because a save doesn&rsquo;t record which device earned what.
        </li>
        <li>
          On the production build, Lighthouse scored accessibility, best practices and SEO at 100. We also measured page speed
          on a slowed-down phone (details on the <Link href="/work-log">work log</Link>).
        </li>
      </ul>

      <h2>Who did what</h2>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th scope="col">Part</th>
              {hasStudents ? <th scope="col">What students did</th> : null}
              <th scope="col">What AI did</th>
            </tr>
          </thead>
          <tbody>
            {PARTS.map((p) => (
              <tr key={p.part}>
                <td data-label="Part">{p.part}</td>
                {hasStudents ? <td data-label="Students">{p.student}</td> : null}
                <td data-label="AI">{p.ai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Where the word planet came from</h2>
      <p>
        The hero planet is ours, not a downloaded model. It is a small Rust program, compiled to WebAssembly, that takes the
        words from our lessons, splits them into tokens the way a language model reads them, and draws them on a turning sphere
        with WebGL2. A still image loads first, so the page is fast. The live planet starts only on devices that can draw it
        smoothly, and never when reduced motion is on. The renderer is in <code>apps/web/planet/src/lib.rs</code>.
      </p>

      <h2>Is the content checked?</h2>
      <p>
        Every lesson and practice question is fixed text, the same for everyone, and the team reviews all{" "}
        {allLessons.length} lessons before submission. The only text an AI writes live is Ask Pip&rsquo;s answers. Each one is
        labelled as AI-written, and it can be wrong.
      </p>

      <p>
        Design reasons are on <Link href="/design-decisions">Design decisions</Link>. Licences are on the{" "}
        <Link href="/copyright-checklist">copyright checklist</Link>.
      </p>
    </article>
  );
}
