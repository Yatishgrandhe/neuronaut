/**
 * Lesson search for Ask Pip: BM25 ranking over our own lesson text. No embeddings service and
 * no network: the same input always gives the same passages, so it can be tested exactly.
 *
 * BM25 score of a passage for a query = Σ over query words of
 *   idf(word) · tf·(k1+1) / (tf + k1·(1 − b + b·len/avgLen))
 * where tf is how often the word appears in the passage, len is the passage length, and idf
 * rewards rare words. k1 = 1.2 and b = 0.75 are the standard values.
 */
import { allLessons, modules } from "./content.ts";

export interface Passage {
  text: string;
  lessonId: string;
  lesson: string;
  module: string;
  kind: "idea" | "practice";
}

const K1 = 1.2;
const B = 0.75;
/** Added to passages from the lesson the student is on, so answers prefer that lesson. */
export const LESSON_BOOST = 1.5;

const STOP = new Set(
  "a an and are as at be but by can do for from how i in is it its me my of on or so that the this to was what when which who why will with you your".split(" "),
);
/** A light stemmer, so "sources" matches "source" and "citing" matches "cite". */
export function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("es") && /(ss|sh|ch|x)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}
const trim = (w: string) => (w.endsWith("e") && w.length > 3 ? w.slice(0, -1) : w);
export const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => trim(stem(w)));

export const PASSAGES: Passage[] = allLessons.flatMap((lesson) => {
  const mod = modules.find((m) => m.id === lesson.moduleId)!;
  const meta = { lessonId: lesson.id, lesson: lesson.title, module: mod.title };
  return [
    ...lesson.cards.map((c) => ({ ...meta, kind: "idea" as const, text: `${c.title}. ${c.body}` })),
    ...lesson.exercises.map((e) => ({
      ...meta,
      kind: "practice" as const,
      text: `${e.kind === "truefalse" ? e.statement : e.prompt} ${e.explain}`,
    })),
  ];
});

const tokens = PASSAGES.map((p) => tokenize(p.text));
const df = new Map<string, number>();
for (const toks of tokens) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
const avgLen = tokens.reduce((n, t) => n + t.length, 0) / tokens.length;

/** The top `k` passages for `query`, best first. Passages that share no word are left out. */
export function searchLessons(query: string, k = 4, boostLessonId?: string): Passage[] {
  const q = tokenize(query);
  const N = PASSAGES.length;
  return PASSAGES.map((p, i) => {
    const toks = tokens[i];
    let score = 0;
    for (const term of q) {
      const tf = toks.filter((t) => t === term).length;
      if (!tf) continue;
      const n = df.get(term) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += (idf * tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (toks.length / avgLen)));
    }
    if (score > 0 && boostLessonId && p.lessonId === boostLessonId) score += LESSON_BOOST;
    return { p, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.p);
}
