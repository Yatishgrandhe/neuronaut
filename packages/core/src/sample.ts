/**
 * Sample progress for demos: built by running the real engine over the past six days, so
 * every number on the dashboard (XP, streak, mastery, review queue, badges) is produced by the
 * same code a real learner goes through. Nothing is typed in by hand.
 */
import { allLessons } from "./content.ts";
import { completeLesson, completeReview, createProgress, dayKey, dueReviewKeys } from "./engine.ts";
import type { ProgressState } from "./types.ts";

export function sampleProgress(now: Date = new Date()): ProgressState {
  const day = (back: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - back);
    d.setHours(17, 0, 0, 0);
    return d;
  };
  // Lessons per day, and which answers needed a second try (by exercise index).
  const plan: { back: number; lesson: number; retried: number[] }[] = [
    { back: 6, lesson: 0, retried: [] },
    { back: 5, lesson: 1, retried: [2] },
    { back: 4, lesson: 2, retried: [0, 3] },
    { back: 2, lesson: 3, retried: [1] },
    { back: 1, lesson: 4, retried: [0, 2, 4] },
    { back: 0, lesson: 5, retried: [3] },
  ];
  let s = createProgress(day(7));
  for (const p of plan) {
    const lesson = allLessons[p.lesson];
    const results = lesson.exercises.map((e, i) => ({ exerciseId: e.id, correct: true, retried: p.retried.includes(i) }));
    s = completeLesson(s, lesson, results, day(p.back)).state;
    // Do some of the reviews that were due that day, but not all, so some are left for the demo.
    const due = dueReviewKeys(s, dayKey(day(p.back))).slice(0, 1);
    if (p.back > 1 && due.length) s = completeReview(s, due.map((key) => ({ key, correct: true })), day(p.back)).state;
  }
  return s;
}
