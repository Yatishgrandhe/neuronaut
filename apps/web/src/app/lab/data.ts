// Real content shared by every home-page variant in the lab. Nothing here is invented:
// it all comes from the course in @neuronaut/core or from the live home page's copy.
import { allLessons, modules } from "@neuronaut/core";

export const first = allLessons[0];
const lengths = allLessons.map((l) => l.minutes);
export const lessonLength = `${Math.min(...lengths)}–${Math.max(...lengths)}-minute`;
export const lessonCount = allLessons.length;

export const units = modules.map((m, i) => ({
  n: i + 1,
  id: m.id,
  title: m.title,
  tagline: m.tagline,
  description: m.description,
  lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, minutes: l.minutes })),
}));

const ex = first.exercises.find((e) => e.kind === "choice");
export const sample =
  ex && ex.kind === "choice"
    ? { prompt: ex.prompt, options: ex.options, answer: ex.answer, explain: ex.explain }
    : { prompt: "", options: [] as string[], answer: 0, explain: "" };

export const headline = "Short lessons on how AI works, and how to use it honestly.";
export const sub =
  "For high schoolers: how chatbots work, how to prompt them, and how to use them for school without cheating.";

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

export const VARIANTS = [
  { id: "notebook", name: "Notebook", note: "Paper, ruled lines, a red pencil in the margin" },
  { id: "tokens", name: "Tokens", note: "Dark, monospace, the page read the way an AI reads it" },
  { id: "poster", name: "Poster", note: "Swiss grid, huge numerals, one red" },
  { id: "sky", name: "Night sky", note: "The ISS photo, quiet serif, an index that follows you" },
  { id: "sky-ledger", name: "Sky: Ledger", note: "Night sky, body as a ledger with a sticky index" },
  { id: "sky-chapters", name: "Sky: Chapters", note: "Night sky, each unit a full-screen chapter" },
  { id: "sky-log", name: "Sky: Mission log", note: "Night sky, the course as a mission timeline" },
  { id: "sticker", name: "Sticker", note: "Chunky, warm, a question you can answer in the hero" },
  { id: "hero-galaxy", name: "Hero: Galaxy", note: "React Bits Galaxy starfield behind the hero" },
  { id: "hero-particles", name: "Hero: Particles", note: "React Bits Particles with constellation lines" },
] as const;
export type VariantId = (typeof VARIANTS)[number]["id"];
