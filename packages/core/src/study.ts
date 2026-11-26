import { allLessons } from "./content.ts";
import { seededShuffle } from "./check.ts";

/** A flashcard built from lesson content. */
export interface StudyCard {
  id: string;
  lessonId: string;
  lesson: string;
  kind: "idea" | "claim";
  front: string;
  back: string;
}

/**
 * Flashcards for concept learning, not vocabulary: each idea card becomes title → explanation,
 * and each true-or-false claim becomes claim → verdict and why (a scenario → principle card).
 */
export function flashcards(lessonIds?: readonly string[]): StudyCard[] {
  const only = lessonIds ? new Set(lessonIds) : null;
  return allLessons
    .filter((l) => !only || only.has(l.id))
    .flatMap((l) => [
      ...l.cards.map((c, i) => ({ id: `${l.id}:card${i}`, lessonId: l.id, lesson: l.title, kind: "idea" as const, front: c.title, back: c.body })),
      ...l.exercises.flatMap((e) =>
        e.kind === "truefalse"
          ? [{ id: `${l.id}:${e.id}`, lessonId: l.id, lesson: l.title, kind: "claim" as const, front: e.statement, back: `${e.answer ? "True" : "False"}. ${e.explain}` }]
          : [],
      ),
    ]);
}

export interface MatchPair {
  id: string;
  lessonId: string;
  left: string;
  right: string;
}

export const MATCH_SIZE = 6;

/** Every term-meaning pair in the course's matching questions. */
export function allPairs(lessonIds?: readonly string[]): MatchPair[] {
  const only = lessonIds ? new Set(lessonIds) : null;
  return allLessons
    .filter((l) => !only || only.has(l.id))
    .flatMap((l) => l.exercises.flatMap((e) => (e.kind === "match" ? e.pairs.map(([left, right], i) => ({ id: `${l.id}:${e.id}:${i}`, lessonId: l.id, left, right })) : [])));
}

/**
 * One round of the Match game: up to `size` pairs whose left and right sides are all different,
 * so every tile has exactly one partner on the board. Same seed, same round.
 */
export function matchRound(seed: string, size = MATCH_SIZE, lessonIds?: readonly string[]): MatchPair[] {
  const lefts = new Set<string>();
  const rights = new Set<string>();
  const out: MatchPair[] = [];
  for (const p of seededShuffle(allPairs(lessonIds), seed)) {
    if (out.length >= size) break;
    if (lefts.has(p.left) || rights.has(p.right)) continue;
    lefts.add(p.left);
    rights.add(p.right);
    out.push(p);
  }
  return out;
}
