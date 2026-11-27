// Home page content, built from the course in @neuronaut/core.
import { allLessons, modules } from "@neuronaut/core";

export const first = allLessons[0];
export const firstLessonHref = `/lesson/${first.id}`;

const lengths = allLessons.map((l) => l.minutes);
const minMin = Math.min(...lengths);
const maxMin = Math.max(...lengths);
/** "5–7-minute" when lessons vary in length, "5-minute" when they all match. */
export const lessonLength = minMin === maxMin ? `${minMin}-minute` : `${minMin}–${maxMin}-minute`;

export const units = modules.map((m, i) => ({
  n: i + 1,
  id: m.id,
  title: m.title,
  description: m.description,
  lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, minutes: l.minutes })),
}));

const ex = first.exercises.find((e) => e.kind === "choice");
export const sample =
  ex && ex.kind === "choice"
    ? { prompt: ex.prompt, options: ex.options, answer: ex.answer, explain: ex.explain }
    : { prompt: "", options: [] as string[], answer: 0, explain: "" };

export const steps = [
  { title: "Read one idea", body: "Each lesson opens with a short card or two. One idea at a time." },
  { title: "Answer a question", body: "Check your answer. Miss it and you see why, then it comes back at the end." },
  { title: "Keep it", body: "Questions you got wrong return on the day you're about to forget them." },
];

export const faq = [
  {
    q: "Is using this cheating?",
    a: "No. Neuronaut teaches you about AI; it doesn't do your schoolwork. Pip gives hints and explanations, not answers to graded work.",
  },
  {
    q: "What does Pip see?",
    a: "Only what you type into Ask Pip and the lesson passages that match. Your lessons and progress never leave your device.",
  },
  {
    q: "Can my teacher use it in class?",
    a: `Yes. It's free, needs no accounts, and each of the ${allLessons.length} lessons fits in about five minutes.`,
  },
];
