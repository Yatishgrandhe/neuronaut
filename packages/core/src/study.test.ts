import { test } from "node:test";
import assert from "node:assert/strict";
import { allLessons } from "./content.ts";
import { MATCH_SIZE, allPairs, flashcards, matchRound } from "./study.ts";

test("flashcards: one per idea card and one per true-or-false claim", () => {
  const ideas = allLessons.reduce((n, l) => n + l.cards.length, 0);
  const claims = allLessons.reduce((n, l) => n + l.exercises.filter((e) => e.kind === "truefalse").length, 0);
  const deck = flashcards();
  assert.equal(deck.length, ideas + claims);
  assert.equal(new Set(deck.map((c) => c.id)).size, deck.length, "ids are unique");
  assert.ok(deck.every((c) => c.front.trim() && c.back.trim()));
});

test("flashcards: a lesson filter keeps only those lessons", () => {
  const id = allLessons[0].id;
  const deck = flashcards([id]);
  assert.ok(deck.length > 0);
  assert.ok(deck.every((c) => c.lessonId === id));
  assert.equal(flashcards([]).length, 0);
});

test("match round: full size, and every tile has exactly one partner", () => {
  for (let s = 0; s < 200; s++) {
    const round = matchRound(`seed-${s}`);
    assert.equal(round.length, MATCH_SIZE);
    assert.equal(new Set(round.map((p) => p.left)).size, round.length);
    assert.equal(new Set(round.map((p) => p.right)).size, round.length, "no duplicate meanings like two 'Tutor' tiles");
  }
});

test("match round: same seed, same round; a small pool gives a smaller round", () => {
  assert.deepEqual(matchRound("a"), matchRound("a"));
  const one = allPairs().find(Boolean)!.lessonId;
  const round = matchRound("x", MATCH_SIZE, [one]);
  assert.ok(round.length > 0 && round.length <= MATCH_SIZE);
  assert.ok(round.every((p) => p.lessonId === one));
});
