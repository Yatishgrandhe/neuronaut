import { test } from "node:test";
import assert from "node:assert/strict";
import { allLessons } from "./content.ts";
import { PASSAGES, searchLessons, tokenize } from "./search.ts";

test("every lesson passage is searchable", () => {
  assert.equal(PASSAGES.length, allLessons.reduce((n, l) => n + l.cards.length + l.exercises.length, 0));
});

test("each idea card's own title finds its lesson first (retrieval hit rate)", () => {
  let hits = 0, total = 0;
  const misses: string[] = [];
  for (const l of allLessons)
    for (const c of l.cards) {
      total++;
      const top = searchLessons(c.title, 1)[0];
      if (top?.lessonId === l.id) hits++;
      else misses.push(`${c.title} -> ${top?.lessonId}`);
    }
  // Card titles are short, so a few can fairly match a sibling lesson. Require 80% top-1 and
  // 100% in the top 4 (what Pip actually reads).
  assert.ok(hits / total >= 0.8, `top-1 ${hits}/${total}: ${misses.join("; ")}`);
  for (const l of allLessons)
    for (const c of l.cards) assert.ok(searchLessons(c.title, 4).some((p) => p.lessonId === l.id), c.title);
});

test("student-style questions reach the right lesson", () => {
  const cases: [string, string][] = [
    ["why do chatbots make up fake sources and citations", "verification"],
    ["is it cheating to use AI for my homework", "integrity"],
    ["how should I cite ChatGPT in my essay", "citing"],
    ["what is a token", "chatbot"],
  ];
  for (const [q, want] of cases) {
    const top = searchLessons(q, 4).map((p) => `${p.lessonId} ${p.lesson}`.toLowerCase());
    assert.ok(top.some((t) => t.includes(want)), `${q} -> ${top.join(" | ")}`);
  }
});

test("stemming joins word forms", () => {
  assert.deepEqual(tokenize("sources source"), tokenize("source sources"));
  assert.equal(tokenize("citing")[0], tokenize("cite")[0]);
  assert.equal(tokenize("citations")[0], tokenize("citation")[0]);
});

test("search is deterministic, ignores stopwords, and returns nothing for gibberish", () => {
  assert.deepEqual(searchLessons("what is a token"), searchLessons("what is a token"));
  assert.deepEqual(tokenize("What is the AI?"), []);
  assert.deepEqual(searchLessons("zzqx flurble"), []);
});

test("the current lesson is preferred when it matches", () => {
  const l = allLessons[5];
  const q = l.cards[0].title;
  assert.equal(searchLessons(q, 1, l.id)[0].lessonId, l.id);
});
