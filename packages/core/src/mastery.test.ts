import { test } from "node:test";
import assert from "node:assert/strict";
import { allLessons } from "./content.ts";
import { BKT, GRACE_DAYS, HALF_LIFE_DAYS, MASTERED, bktRun, bktUpdate, decayed, guessRate, masteryLabel } from "./mastery.ts";
import {
  completeLesson,
  completePractice,
  completeReview,
  createProgress,
  masteryOf,
  mergeProgress,
  parseProgress,
  practiceQueue,
  recommendNext,
} from "./engine.ts";

const d = (s: string) => new Date(`${s}T12:00:00`);
const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

/** Small seeded generator so property tests are repeatable. */
function rng(seed: number) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
}

test("BKT update matches the formula worked by hand", () => {
  // Right answer on a 4-option question from P(L)=0.2:
  // posterior = 0.2·0.9 / (0.2·0.9 + 0.8·0.25) = 0.18 / 0.38 = 0.47368…
  // then learning: 0.47368 + 0.52632·0.15 = 0.55263…
  close(bktUpdate(0.2, true, 0.25), 0.18 / 0.38 + (1 - 0.18 / 0.38) * 0.15);
  // Wrong answer: posterior = 0.2·0.1 / (0.2·0.1 + 0.8·0.75) = 0.02 / 0.62
  close(bktUpdate(0.2, false, 0.25), 0.02 / 0.62 + (1 - 0.02 / 0.62) * 0.15);
});

test("BKT properties hold for 2,000 random cases", () => {
  const r = rng(42);
  for (let i = 0; i < 2000; i++) {
    const p = 0.001 + r() * 0.998;
    const g = 0.05 + r() * 0.5;
    const up = bktUpdate(p, true, g);
    const down = bktUpdate(p, false, g);
    assert.ok(up > 0 && up < 1 && down > 0 && down < 1, "stays a probability");
    assert.ok(up >= down, "a right answer never lowers the estimate below a wrong one");
    assert.ok(up >= p - 1e-12, "a right answer never lowers the estimate");
  }
});

test("an easy-to-guess question is weaker evidence than a hard-to-guess one", () => {
  const tf = bktUpdate(0.2, true, 0.5);
  const order = bktUpdate(0.2, true, 0.05);
  assert.ok(order > tf, `order ${order} should beat true/false ${tf}`);
});

test("guess rates per question type", () => {
  const byKind = new Map(allLessons.flatMap((l) => l.exercises).map((e) => [e.kind, e]));
  assert.equal(guessRate(byKind.get("truefalse")!), 0.5);
  assert.equal(guessRate(byKind.get("order")!), 0.05);
  const choice = byKind.get("choice")!;
  assert.equal(guessRate(choice), 1 / (choice as { options: string[] }).options.length);
});

test("enough right answers reach mastery; one slip is forgiven, three wrong in a row are not", () => {
  const right = Array.from({ length: 8 }, () => ({ correct: true, guess: 0.25 }));
  const p = bktRun(BKT.init, right);
  assert.ok(p >= MASTERED, `${p}`);
  assert.equal(masteryLabel(p), "Mastered");
  const oneSlip = bktUpdate(p, false, 0.25);
  assert.ok(oneSlip < p, "a wrong answer always lowers the estimate");
  assert.ok(oneSlip >= MASTERED, "but after 8 right answers one wrong answer reads as a slip");
  const wrong = Array.from({ length: 3 }, () => ({ correct: false, guess: 0.25 }));
  assert.ok(bktRun(p, wrong) < MASTERED, "three wrong in a row drop it below mastered");
  assert.equal(masteryLabel(undefined), "Not started");
});

test("lessons update mastery: perfect beats shaky", () => {
  const lesson = allLessons[0];
  const perfect = lesson.exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: false }));
  const shaky = lesson.exercises.map((e, i) => ({ exerciseId: e.id, correct: true, retried: i % 2 === 0 }));
  const a = completeLesson(createProgress(), lesson, perfect, d("2026-11-20")).state;
  const b = completeLesson(createProgress(), lesson, shaky, d("2026-11-20")).state;
  assert.ok(a.mastery[lesson.id] > b.mastery[lesson.id]);
  assert.ok(b.mastery[lesson.id] > 0 && b.mastery[lesson.id] < 1);
});

test("practice only draws from finished lessons and favours the weakest", () => {
  assert.deepEqual(practiceQueue(createProgress(), "2026-11-20"), [], "nothing finished, nothing to practise");
  let s = createProgress();
  const [l1, l2] = allLessons;
  const all = (l: typeof l1, ok: boolean) => l.exercises.map((e) => ({ exerciseId: e.id, correct: ok, retried: !ok }));
  s = completeLesson(s, l1, all(l1, true), d("2026-11-20")).state; // strong
  s = completeLesson(s, l2, all(l2, false), d("2026-11-20")).state; // weak
  const counts = { [l1.id]: 0, [l2.id]: 0 };
  // Same day, different sets: the seed also uses how many practice questions were answered.
  for (let i = 0; i < 40; i++) {
    for (const q of practiceQueue({ ...s, stats: { ...s.stats, practiceAnswered: i * 5 } }, "2026-11-20")) counts[q.lessonId]++;
  }
  assert.ok(counts[l2.id] > counts[l1.id] * 2, JSON.stringify(counts));
  const q = practiceQueue(s, "2026-11-20");
  assert.equal(new Set(q.map((x) => x.key)).size, q.length, "no duplicate questions in one set");
  assert.deepEqual(q, practiceQueue(s, "2026-11-20"), "same day, same set");
});

test("practice raises mastery, gives small XP, and sends misses to review", () => {
  const l = allLessons[0];
  let s = completeLesson(createProgress(), l, l.exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: true })), d("2026-11-20")).state;
  const before = s.mastery[l.id];
  const keys = l.exercises.map((e) => `${l.id}:${e.id}`);
  const r = completePractice(s, [{ key: keys[0], correct: true }, { key: keys[1], correct: false }], d("2026-11-21"));
  assert.equal(r.before[l.id], before);
  assert.equal(r.state.xp - s.xp, 3);
  assert.ok(r.state.review[keys[1]], "the miss is scheduled for review");
  assert.equal(r.state.stats.practiceAnswered, 2);
});

test("recommendation order: review, shaky lesson, next lesson, done", () => {
  const l = allLessons[0];
  const ok = l.exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: false }));
  const bad = l.exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: true }));
  assert.equal(recommendNext(createProgress(), "2026-11-20").kind, "lesson");
  const missed = completeLesson(createProgress(), l, bad, d("2026-11-20")).state;
  assert.equal(recommendNext(missed, "2026-11-20").kind, "review");
  const fine = completeLesson(createProgress(), l, ok, d("2026-11-20")).state;
  const rec = recommendNext(fine, "2026-11-20");
  assert.equal(rec.kind, "lesson");
  assert.equal(rec.kind === "lesson" && rec.lesson.id, allLessons[1].id);
});

test("merge keeps review items from both sides (regression: newer side used to win)", () => {
  const l = allLessons[0];
  const miss = l.exercises.map((e, i) => ({ exerciseId: e.id, correct: true, retried: i === 0 }));
  const older = completeLesson(createProgress(), l, miss, d("2026-11-20")).state;
  const newer = { ...createProgress(d("2026-11-25")), updatedAt: d("2026-11-25").toISOString() };
  const merged = mergeProgress(older, newer);
  const key = `${l.id}:${l.exercises[0].id}`;
  assert.ok(merged.review[key], "review item from the older device survives");
  assert.equal(merged.mastery[l.id], older.mastery[l.id]);
  assert.ok(merged.lessons[l.id]);
});

test("merge keeps the more cautious review copy", () => {
  const key = `${allLessons[0].id}:${allLessons[0].exercises[0].id}`;
  const a = { ...createProgress(), review: { [key]: { key, box: 3, due: "2026-11-30" } }, updatedAt: "2026-11-26T00:00:00Z" };
  const b = { ...createProgress(), review: { [key]: { key, box: 1, due: "2026-11-21" } }, updatedAt: "2026-11-20T00:00:00Z" };
  assert.deepEqual(mergeProgress(a, b).review[key], { key, box: 1, due: "2026-11-21" });
});

test("version 1 saves migrate: review tally moves out of badges", () => {
  const v1 = {
    version: 1,
    xp: 120,
    lessons: { [allLessons[0].id]: { completedAt: "2026-11-20T12:00:00Z", bestAccuracy: 1, attempts: 1 } },
    streak: { current: 2, longest: 2, lastActiveDay: "2026-11-21", freezes: 1 },
    review: {},
    badges: { "first-step": "2026-11-20T12:00:00Z", __reviewCorrect: "7" },
    history: { "2026-11-20": 80, "2026-11-21": 40 },
    weeklyGoal: 100,
    updatedAt: "2026-11-21T12:00:00Z",
  };
  const s = parseProgress(v1);
  assert.equal(s.version, 2);
  assert.equal(s.stats.reviewCorrect, 7);
  assert.equal("__reviewCorrect" in s.badges, false);
  assert.equal(s.xp, 120);
  assert.deepEqual(s.mastery, {});
});

test("bad imports never crash and never smuggle in junk", () => {
  for (const junk of [null, 42, "x", [], { version: 9 }, { version: 2, xp: "lots", lessons: [1], review: { a: { due: "soon" } }, history: { yesterday: 5 } }]) {
    const s = parseProgress(junk);
    assert.equal(s.version, 2);
    assert.equal(typeof s.xp, "number");
    assert.deepEqual(s.review, {});
    assert.deepEqual(s.history, {});
  }
  const unknownLesson = parseProgress({ version: 2, lessons: { "not-a-lesson": { completedAt: "x" } } });
  assert.deepEqual(unknownLesson.lessons, {});
});

test("review tally counts toward the Second Look badge", () => {
  const l = allLessons[0];
  let s = completeLesson(createProgress(), l, l.exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: true })), d("2026-11-20")).state;
  const keys = Object.keys(s.review);
  for (let i = 0; i < 2; i++) s = completeReview(s, keys.map((key) => ({ key, correct: true })), d(`2026-11-2${1 + i}`)).state;
  assert.equal(s.stats.reviewCorrect, keys.length * 2);
  assert.equal(Boolean(s.badges.reviewer), keys.length * 2 >= 10);
});

test("a skill just mastered is still Mastered the next day and three days later", () => {
  const l = allLessons[0];
  const perfect = l.exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: false }));
  const s = completeLesson(createProgress(), l, perfect, d("2026-11-20")).state;
  for (const day of ["2026-11-20", "2026-11-21", "2026-11-23"]) assert.equal(masteryLabel(masteryOf(s, l.id, day)), "Mastered", day);
});

test("a right practice answer on a due review question counts as reviewing it; a not-yet-due one keeps its date", () => {
  const l = allLessons[0];
  const results = l.exercises.map((e, i) => ({ exerciseId: e.id, correct: true, retried: i === 0 }));
  const s = completeLesson(createProgress(), l, results, d("2026-11-20")).state;
  const key = `${l.id}:${l.exercises[0].id}`;
  assert.deepEqual(s.review[key], { key, box: 1, due: "2026-11-20" });
  const due = completePractice(s, [{ key, correct: true }], d("2026-11-20")).state;
  assert.deepEqual(due.review[key], { key, box: 2, due: "2026-11-21" }, "due item advances a box");
  const early = completePractice(due, [{ key, correct: true }], d("2026-11-20")).state;
  assert.deepEqual(early.review[key], due.review[key], "practising before it's due doesn't skip the gap");
});

test("forgetting: the estimate halves toward the start every half-life, never below it", () => {
  close(decayed(0.9, GRACE_DAYS + HALF_LIFE_DAYS), BKT.init + (0.9 - BKT.init) / 2);
  close(decayed(0.9, GRACE_DAYS + 2 * HALF_LIFE_DAYS), BKT.init + (0.9 - BKT.init) / 4);
  assert.equal(decayed(0.9, 0), 0.9);
  assert.equal(decayed(0.9, GRACE_DAYS), 0.9, "no forgetting inside the grace period");
  assert.equal(decayed(0.1, 100), 0.1, "never pulled up toward the start either");
  const r = rng(7);
  for (let i = 0; i < 500; i++) {
    const p = r(), a = r() * 60, b = a + r() * 60;
    assert.ok(decayed(p, b) <= decayed(p, a) + 1e-12, "more days never means more mastery");
  }
});

test("a lesson aced weeks ago drops out of Mastered and back into practice", () => {
  const l = allLessons[0];
  const perfect = l.exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: false }));
  const s = completeLesson(createProgress(), l, perfect, d("2026-11-01")).state;
  assert.equal(masteryLabel(masteryOf(s, l.id, "2026-11-01")), "Mastered");
  assert.ok(masteryOf(s, l.id, "2026-11-29") < MASTERED);
  assert.ok(practiceQueue(s, "2026-11-29").length > 0);
});
