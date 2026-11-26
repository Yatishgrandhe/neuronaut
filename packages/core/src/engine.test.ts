import { test } from "node:test";
import assert from "node:assert/strict";
import { allLessons, modules } from "./content.ts";
import { checkAnswer } from "./check.ts";
import {
  completeLesson,
  completeReview,
  createProgress,
  dueReviewKeys,
  isLessonUnlocked,
  levelForXp,
  levelProgress,
  MAX_FREEZES,
  recentDays,
  visibleStreak,
  weekXp,
} from "./engine.ts";

const d = (s: string) => new Date(`${s}T12:00:00`);
const lesson = allLessons[0];
const allRight = lesson.exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: false }));

test("content is well formed", () => {
  assert.equal(modules.length, 3);
  const ids = new Set<string>();
  for (const l of allLessons) {
    assert.ok(!ids.has(l.id), `duplicate ${l.id}`);
    ids.add(l.id);
    assert.ok(l.exercises.length >= 4);
    for (const e of l.exercises) {
      if (e.kind === "choice") assert.ok(e.answer < e.options.length, `${l.id}:${e.id}`);
      if (e.kind === "order") assert.ok(e.answer.every((i) => i < e.tiles.length), `${l.id}:${e.id}`);
    }
  }
});

test("levels", () => {
  assert.equal(levelForXp(0), 1);
  assert.equal(levelForXp(99), 1);
  assert.equal(levelForXp(100), 2);
  assert.equal(levelForXp(300), 3);
});

test("perfect lesson awards XP, badges, streak", () => {
  const { state, events, accuracy } = completeLesson(createProgress(), lesson, allRight, d("2026-11-20"));
  assert.equal(accuracy, 1);
  assert.equal(state.xp, 5 * 10 + 15 + 10);
  assert.ok(state.badges["first-step"]);
  assert.ok(state.badges["flawless"]);
  assert.equal(state.streak.current, 1);
  assert.ok(events.some((e) => e.type === "badge"));
});

test("streak freeze covers one missed day", () => {
  let s = completeLesson(createProgress(), lesson, allRight, d("2026-11-20")).state;
  s = completeLesson(s, lesson, allRight, d("2026-11-22")).state; // missed 21st
  assert.equal(s.streak.current, 2);
  assert.equal(s.streak.freezes, 0);
  s = completeLesson(s, lesson, allRight, d("2026-11-25")).state; // missed 23rd, 24th
  assert.equal(s.streak.current, 1);
  assert.equal(visibleStreak(s, "2026-11-25"), 1);
});

test("missed items enter review and leave after correct answers", () => {
  const results = lesson.exercises.map((e, i) => ({ exerciseId: e.id, correct: i !== 0, retried: i === 0 }));
  let s = completeLesson(createProgress(), lesson, results, d("2026-11-20")).state;
  const due = dueReviewKeys(s, "2026-11-20");
  assert.deepEqual(due, [`${lesson.id}:${lesson.exercises[0].id}`]);
  s = completeReview(s, [{ key: due[0], correct: true }], d("2026-11-20")).state;
  assert.equal(dueReviewKeys(s, "2026-11-20").length, 0);
  assert.equal(dueReviewKeys(s, "2026-11-23").length, 1);
});

test("lessons unlock in order within a module", () => {
  const s = createProgress();
  assert.ok(isLessonUnlocked(s, modules[0].lessons[0].id));
  assert.ok(!isLessonUnlocked(s, modules[0].lessons[1].id));
  assert.ok(isLessonUnlocked(s, modules[1].lessons[0].id));
});

test("answer checking", () => {
  for (const l of allLessons)
    for (const e of l.exercises) {
      if (e.kind === "choice") assert.ok(checkAnswer(e, { kind: "choice", index: e.answer }));
      if (e.kind === "truefalse") assert.ok(checkAnswer(e, { kind: "truefalse", value: e.answer }));
      if (e.kind === "order") assert.ok(checkAnswer(e, { kind: "order", sequence: e.answer }));
      if (e.kind === "match") assert.ok(checkAnswer(e, { kind: "match", pairs: e.pairs.map((_, i) => [i, i]) }));
    }
});

test("wrong answers are rejected for every question type", () => {
  for (const l of allLessons)
    for (const e of l.exercises) {
      if (e.kind === "choice") assert.ok(!checkAnswer(e, { kind: "choice", index: (e.answer + 1) % e.options.length }));
      if (e.kind === "truefalse") assert.ok(!checkAnswer(e, { kind: "truefalse", value: !e.answer }));
      if (e.kind === "order" && e.answer.length > 1) assert.ok(!checkAnswer(e, { kind: "order", sequence: [...e.answer].reverse() }));
      if (e.kind === "match" && e.pairs.length > 1) assert.ok(!checkAnswer(e, { kind: "match", pairs: e.pairs.map((_, i) => [i, (i + 1) % e.pairs.length]) }));
      assert.ok(!checkAnswer(e, { kind: "truefalse", value: true }) || e.kind === "truefalse", "wrong answer kind is never right");
    }
});

test("repeat runs earn half XP; level progress adds up", () => {
  const first = completeLesson(createProgress(), lesson, allRight, d("2026-11-20")).state;
  const again = completeLesson(first, lesson, allRight, d("2026-11-20")).state;
  assert.equal(again.xp - first.xp, Math.round((5 * 10 + 15 + 10) / 2));
  assert.equal(again.lessons[lesson.id].attempts, 2);
  const { level, into, span } = levelProgress(250);
  assert.deepEqual([level, into, span], [2, 150, 200]);
});

test("a seven-day streak earns a freeze, capped at two", () => {
  let s = createProgress();
  for (let i = 0; i < 21; i++) {
    const day = new Date(Date.UTC(2026, 10, 1 + i, 12));
    s = completeLesson(s, lesson, allRight, new Date(`${day.toISOString().slice(0, 10)}T12:00:00`)).state;
  }
  assert.equal(s.streak.current, 21);
  assert.equal(s.streak.freezes, MAX_FREEZES);
  assert.ok(s.badges["streak-7"]);
});

test("week XP counts from Monday only", () => {
  let s = completeLesson(createProgress(), lesson, allRight, d("2026-11-22")).state; // Sunday
  s = completeLesson(s, allLessons[1], allLessons[1].exercises.map((e) => ({ exerciseId: e.id, correct: true, retried: false })), d("2026-11-23")).state; // Monday
  assert.equal(weekXp(s, d("2026-11-23")), s.history["2026-11-23"]);
  assert.equal(recentDays(s, 7, d("2026-11-23")).length, 7);
});

test("the review queue never contains a mastered item", () => {
  const results = lesson.exercises.map((e, i) => ({ exerciseId: e.id, correct: true, retried: i === 0 }));
  let s = completeLesson(createProgress(), lesson, results, d("2026-11-01")).state;
  const key = `${lesson.id}:${lesson.exercises[0].id}`;
  const days = ["2026-11-01", "2026-11-02", "2026-11-05", "2026-11-12", "2026-11-28"];
  for (const day of days) {
    assert.ok(dueReviewKeys(s, day).includes(key), `due on ${day}`);
    s = completeReview(s, [{ key, correct: true }], d(day)).state;
  }
  assert.equal(s.review[key], undefined, "five right answers in a row = mastered");
});
