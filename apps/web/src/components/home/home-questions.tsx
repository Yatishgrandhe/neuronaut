import Link from "next/link";
import { allLessons, getLesson } from "@neuronaut/core";

const integrity = getLesson("e1-integrity");

const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is using this cheating?",
    a: (
      <>
        No. Neuronaut teaches you about AI; it doesn&rsquo;t do your schoolwork. Pip gives hints and explanations, not answers to
        graded work. Whether you may use AI on an assignment is up to your teacher, and the{" "}
        {integrity ? <Link href={`/lesson/${integrity.id}`}>{integrity.title}</Link> : "integrity"} lesson shows how to ask.
      </>
    ),
  },
  {
    q: "What does Pip see?",
    a: (
      <>
        Only what you type into Ask Pip, the earlier messages in that chat, and the lesson passages that match. They go to
        Anthropic&rsquo;s Claude to write the answer. Your lessons and progress never leave your device.{" "}
        <Link href="/privacy">Privacy details</Link>.
      </>
    ),
  },
  {
    q: "Can my teacher use it in class?",
    a: (
      <>
        Yes. It&rsquo;s free, needs no accounts, and each of the {allLessons.length} lessons fits in about five minutes, so it works
        as a warm-up or an exit ticket. Every lesson lists its <Link href="/sources">sources</Link>.
      </>
    ),
  },
];

export function HomeQuestions({ firstLessonId }: { firstLessonId: string }) {
  return (
    <section className="hq" aria-labelledby="hq-h">
      <div className="wrap hq-grid">
        <h2 id="hq-h" className="t-h2 hq-h">
          Questions people actually ask
        </h2>
        <dl className="hq-list">
          {QA.map((x) => (
            <div key={x.q} className="hq-item">
              <dt>{x.q}</dt>
              <dd>{x.a}</dd>
            </div>
          ))}
        </dl>
        <div className="hq-end">
          <p>
            <Link href="/how-we-built-it">More about how we built it</Link>
          </p>
          <Link href={`/lesson/${firstLessonId}`} className="hq-cta">
            Try the first question
          </Link>
        </div>
      </div>
    </section>
  );
}
