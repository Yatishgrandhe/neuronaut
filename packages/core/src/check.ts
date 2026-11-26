import type { Exercise } from "./types.ts";

/** Learner's response to an exercise, in a platform-neutral shape. */
export type Answer =
  | { kind: "choice"; index: number }
  | { kind: "truefalse"; value: boolean }
  | { kind: "order"; sequence: number[] }
  | { kind: "match"; pairs: [left: number, right: number][] };

export function checkAnswer(ex: Exercise, a: Answer): boolean {
  switch (ex.kind) {
    case "choice":
      return a.kind === "choice" && a.index === ex.answer;
    case "truefalse":
      return a.kind === "truefalse" && a.value === ex.answer;
    case "order":
      return (
        a.kind === "order" &&
        a.sequence.length === ex.answer.length &&
        a.sequence.every((v, i) => ex.tiles[v] === ex.tiles[ex.answer[i]])
      );
    case "match":
      return (
        a.kind === "match" &&
        a.pairs.length === ex.pairs.length &&
        a.pairs.every(([l, r]) => l === r)
      );
  }
}

/** Deterministic shuffle so server and client render the same order. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const j = ((h ^= h >>> 16) >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
