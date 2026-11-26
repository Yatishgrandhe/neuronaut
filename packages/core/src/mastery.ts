/**
 * Skill mastery with Bayesian Knowledge Tracing (BKT; Corbett & Anderson, 1995).
 *
 * Each lesson is one skill. For every skill we keep P(known): the probability that the learner
 * has learned it. Every answer updates that estimate in two steps:
 *
 *  1. Evidence (Bayes' rule). A right answer could come from knowing it (1 − slip) or guessing
 *     (guess); a wrong answer could come from a slip or from not knowing it.
 *       right: P(L|right) = P(L)(1−S) / [P(L)(1−S) + (1−P(L))G]
 *       wrong: P(L|wrong) = P(L)S     / [P(L)S     + (1−P(L))(1−G)]
 *  2. Learning. Seeing the explanation is a chance to learn it:
 *       P(L) ← P(L|obs) + (1 − P(L|obs)) · T
 *
 * Guess depends on the question type: a true/false guess is right half the time, a
 * four-option multiple choice a quarter of the time, and putting tiles in order or matching
 * pairs by luck is rare. That is why a right true/false answer moves the estimate less than a
 * right ordering answer.
 *
 * Classic BKT assumes nothing is ever forgotten. We add a forgetting curve: after a grace
 * period of GRACE_DAYS with no practice, the stored estimate decays toward the starting value
 * with a half-life of HALF_LIFE_DAYS. The grace period matches the review schedule's early gaps
 * (1 and 3 days), so a skill mastered today is still "Mastered" tomorrow, while a lesson aced
 * three weeks ago is not and comes back in Practice. All functions are pure.
 */
import type { Exercise } from "./types.ts";

export const BKT = {
  /** P(L0): chance the learner already knows a skill before the lesson. */
  init: 0.2,
  /** T: chance of learning the skill from one answer plus its explanation. */
  learn: 0.15,
  /** S: chance of a wrong answer despite knowing it. */
  slip: 0.1,
} as const;

/** G: chance of a right answer by guessing, by question type. */
export function guessRate(ex: Exercise): number {
  switch (ex.kind) {
    case "truefalse":
      return 0.5;
    case "choice":
      return 1 / Math.max(2, ex.options.length);
    case "order":
    case "match":
      return 0.05;
  }
}

/** Days for the part of the estimate above the starting value to halve without practice. */
export const HALF_LIFE_DAYS = 21;

/** Days after practice before forgetting starts. */
export const GRACE_DAYS = 3;

/** The estimate `days` after it was last updated: decays toward BKT.init, never below it. */
export function decayed(p: number, days: number): number {
  const d = days - GRACE_DAYS;
  if (d <= 0 || p <= BKT.init) return p;
  return BKT.init + (p - BKT.init) * Math.pow(0.5, d / HALF_LIFE_DAYS);
}

/** A skill counts as mastered at or above this estimate (the usual BKT cut-off). */
export const MASTERED = 0.95;

/** One BKT step: the new P(known) after one answer. `correct` means right on the first try. */
export function bktUpdate(pKnown: number, correct: boolean, guess: number, p = BKT): number {
  const { slip, learn } = p;
  const posterior = correct
    ? (pKnown * (1 - slip)) / (pKnown * (1 - slip) + (1 - pKnown) * guess)
    : (pKnown * slip) / (pKnown * slip + (1 - pKnown) * (1 - guess));
  const next = posterior + (1 - posterior) * learn;
  // Keep clear of 0 and 1 so one lucky or unlucky answer can always be outweighed later.
  return Math.min(0.999, Math.max(0.001, next));
}

/** Runs a whole sequence of answers through BKT, starting from `start`. */
export function bktRun(start: number, answers: { correct: boolean; guess: number }[]): number {
  return answers.reduce((p, a) => bktUpdate(p, a.correct, a.guess), start);
}

/** Words a learner sees instead of a raw probability. */
export function masteryLabel(p: number | undefined): "Not started" | "Learning" | "Getting there" | "Mastered" {
  if (p === undefined) return "Not started";
  if (p >= MASTERED) return "Mastered";
  if (p >= 0.7) return "Getting there";
  return "Learning";
}
