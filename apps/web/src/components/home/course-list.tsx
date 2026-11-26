"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { allLessons, modules, moduleProgress, nextLesson, totalExercises, type Lesson, type ProgressState } from "@neuronaut/core";
import { useProgress } from "@/components/progress";

/** What each module gets you, in a student's words. */
const OUTCOME: Record<string, string> = {
  foundations: "Know what is really happening when a chatbot answers you.",
  toolkit: "Get better answers out of AI, and catch the made-up ones.",
  ethics: "Use AI for school without crossing the line.",
};

const mins = (ls: Lesson[]) => ls.reduce((n, l) => n + l.minutes, 0);

function rowStatus(s: ProgressState, moduleId: string) {
  const mod = modules.find((m) => m.id === moduleId)!;
  const { done, total } = moduleProgress(s, moduleId);
  const left = mod.lessons.filter((l) => !s.lessons[l.id]);
  const next = left[0];
  if (done === 0) return { label: `${total} lessons · ${mins(mod.lessons)} min`, next: mod.lessons[0], verb: "Start" };
  if (!next) return { label: `Done · all ${total} lessons`, next: mod.lessons[0], verb: "Review" };
  return { label: `${done} of ${total} done · ${mins(left)} min left`, next, verb: "Resume" };
}

export function CourseList() {
  const { state, ready } = useProgress();
  const started = ready && Object.keys(state.lessons).length > 0;
  const resume = ready ? nextLesson(state) : undefined;

  return (
    <section className="cl" aria-labelledby="cl-h">
      <div className="wrap cl-grid">
        <header className="cl-head">
          <h2 id="cl-h" className="t-h2">
            {started ? "Pick up where you left off" : "Your course"}
          </h2>
          {started && resume ? (
            <Link href={`/lesson/${resume.id}`} className="cl-resume">
              Resume: {resume.title} · {resume.minutes} min <ArrowRight size={18} aria-hidden />
            </Link>
          ) : (
            <p className="t-lead">Three modules, in order. Your progress saves on this device, no account needed.</p>
          )}
        </header>

        <ol className="cl-list" aria-busy={!ready}>
          {modules.map((m, i) => {
            const st = ready ? rowStatus(state, m.id) : null;
            return (
              <li key={m.id} className="cl-row">
                <span className="cl-num" aria-hidden>
                  {i + 1}
                </span>
                <div className="cl-body">
                  <h3 className="cl-title">
                    <Link href={`/learn/${m.id}`}>{m.title}</Link>
                  </h3>
                  <p className="cl-out">{OUTCOME[m.id] ?? m.tagline}</p>
                </div>
                <div className="cl-state">
                  {st ? (
                    <>
                      <span className="cl-label">{st.label}</span>
                      <Link href={`/lesson/${st.next.id}`} className="cl-go">
                        {st.verb}
                        <span className="visually-hidden">: {m.title}</span>
                      </Link>
                    </>
                  ) : (
                    <span className="cl-skel" aria-hidden />
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <p className="cl-facts">
          {modules.length} modules · {allLessons.length} lessons · {totalExercises()} practice questions ·{" "}
          <Link href="/sources">every source cited</Link>
        </p>
      </div>
    </section>
  );
}
