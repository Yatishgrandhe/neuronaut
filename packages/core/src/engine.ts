import { allLessons, modules } from "./content.ts";
import { BKT, MASTERED, bktUpdate, decayed, guessRate } from "./mastery.ts";
import { seededShuffle } from "./check.ts";
import type {
  BadgeDef,
  ExerciseResult,
  Lesson,
  ProgressEvent,
  ProgressState,
  ReviewItem,
} from "./types.ts";

/* ---------------------------- XP & levels ---------------------------- */

export const XP = {
  correctFirstTry: 10,
  correctAfterRetry: 5,
  lessonComplete: 15,
  perfectBonus: 10,
  reviewCorrect: 5,
} as const;

/** Level n starts at 50·n·(n−1) XP: 0, 100, 300, 600, 1000… */
export function levelForXp(xp: number): number {
  let level = 1;
  while (50 * (level + 1) * level <= xp) level++;
  return level;
}

export function levelProgress(xp: number): { level: number; into: number; span: number } {
  const level = levelForXp(xp);
  const start = 50 * level * (level - 1);
  const next = 50 * (level + 1) * level;
  return { level, into: xp - start, span: next - start };
}

/* ------------------------------- dates ------------------------------- */

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ms = Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad);
  return Math.round(ms / 86_400_000);
}

function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

/* ------------------------------- state ------------------------------- */

export const MAX_FREEZES = 2;

export function createProgress(now: Date = new Date()): ProgressState {
  return {
    version: 2,
    xp: 0,
    lessons: {},
    streak: { current: 0, longest: 0, lastActiveDay: null, freezes: 1 },
    review: {},
    reviewDone: {},
    badges: {},
    history: {},
    weeklyGoal: 100,
    mastery: {},
    masterySeen: {},
    stats: { reviewCorrect: 0, practiceAnswered: 0 },
    updatedAt: now.toISOString(),
  };
}

const LEGACY_TALLY = "__reviewCorrect";
const isDay = (k: string) => /^\d{4}-\d{2}-\d{2}$/.test(k);
const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

/**
 * Accept unknown JSON (storage, import file) and return a valid state. Never throws.
 * Version 1 saves kept the review tally inside `badges` under "__reviewCorrect" and had no
 * mastery; they are migrated. Values of the wrong type are dropped, not trusted.
 */
export function parseProgress(raw: unknown): ProgressState {
  const base = createProgress();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, any>;
  if (r.version !== 1 && r.version !== 2) return base;
  const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, any>) : {});

  const badges: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj(r.badges))) if (k !== LEGACY_TALLY && typeof v === "string") badges[k] = v;
  const lessons: ProgressState["lessons"] = {};
  for (const [k, v] of Object.entries(obj(r.lessons)))
    if (allLessons.some((l) => l.id === k) && typeof v?.completedAt === "string")
      lessons[k] = { completedAt: v.completedAt, bestAccuracy: num(v.bestAccuracy), attempts: num(v.attempts, 1) };
  const review: ProgressState["review"] = {};
  for (const [k, v] of Object.entries(obj(r.review)))
    if (typeof v?.due === "string" && isDay(v.due)) review[k] = { key: k, box: Math.min(5, Math.max(1, num(v.box, 1))), due: v.due };
  const reviewDone: ProgressState["reviewDone"] = {};
  for (const [k, v] of Object.entries(obj(r.reviewDone))) if (typeof v === "string" && isDay(v) && !(k in review)) reviewDone[k] = v;
  const history: ProgressState["history"] = {};
  for (const [k, v] of Object.entries(obj(r.history))) if (isDay(k)) history[k] = num(v);
  const mastery: ProgressState["mastery"] = {};
  for (const [k, v] of Object.entries(obj(r.mastery))) if (typeof v === "number" && v >= 0 && v <= 1) mastery[k] = v;
  const masterySeen: ProgressState["masterySeen"] = {};
  for (const [k, v] of Object.entries(obj(r.masterySeen))) if (typeof v === "string" && isDay(v) && k in mastery) masterySeen[k] = v;
  const st = obj(r.streak);
  const stats = obj(r.stats);

  return {
    version: 2,
    xp: Math.max(0, num(r.xp)),
    lessons,
    streak: {
      current: num(st.current),
      longest: num(st.longest),
      lastActiveDay: typeof st.lastActiveDay === "string" && isDay(st.lastActiveDay) ? st.lastActiveDay : null,
      freezes: Math.min(MAX_FREEZES, Math.max(0, num(st.freezes, 1))),
    },
    review,
    reviewDone,
    badges,
    history,
    weeklyGoal: num(r.weeklyGoal, base.weeklyGoal) || base.weeklyGoal,
    mastery,
    masterySeen,
    stats: {
      reviewCorrect: num(stats.reviewCorrect, Number(obj(r.badges)[LEGACY_TALLY] ?? 0) || 0),
      practiceAnswered: num(stats.practiceAnswered),
    },
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : base.updatedAt,
  };
}

/* ------------------------------ streaks ------------------------------ */

/**
 * Forgiving streak: a missed day is covered by a freeze automatically.
 * Every 7-day milestone earns a freeze (max 2). No guilt, no paywall.
 */
function touchStreak(s: ProgressState, today: string, events: ProgressEvent[]): void {
  const st = s.streak;
  if (st.lastActiveDay === today) return;

  let usedFreeze = false;
  if (st.lastActiveDay === null) {
    st.current = 1;
  } else {
    const gap = daysBetween(st.lastActiveDay, today);
    if (gap === 1) st.current += 1;
    else if (gap > 1 && gap - 1 <= st.freezes) {
      st.freezes -= gap - 1;
      st.current += 1;
      usedFreeze = true;
    } else st.current = 1;
  }
  st.lastActiveDay = today;
  st.longest = Math.max(st.longest, st.current);
  events.push({ type: "streak", current: st.current, usedFreeze });

  if (st.current % 7 === 0 && st.freezes < MAX_FREEZES) {
    st.freezes += 1;
    events.push({ type: "freeze-earned", total: st.freezes });
  }
}

/** Streak as the learner should see it today (0 if it has lapsed past freezes). */
export function visibleStreak(s: ProgressState, today: string = dayKey()): number {
  const last = s.streak.lastActiveDay;
  if (!last) return 0;
  const gap = daysBetween(last, today);
  if (gap <= 1) return s.streak.current;
  return gap - 1 <= s.streak.freezes ? s.streak.current : 0;
}

/* ---------------------------- spaced review --------------------------- */

/** Leitner boxes 1–5: days until the item is due again. Correct in box 5 = mastered. */
const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16];

function scheduleReview(s: ProgressState, key: string, correct: boolean, today: string): void {
  const prev = s.review[key];
  if (!prev && correct) return; // only track items that were missed at least once
  const box = correct ? (prev?.box ?? 1) + 1 : 1;
  if (box > BOX_INTERVAL_DAYS.length) {
    delete s.review[key]; // mastered
    s.reviewDone[key] = today;
    return;
  }
  if (!correct) delete s.reviewDone[key]; // missed again after mastering: it's back in the queue
  const item: ReviewItem = { key, box, due: addDays(today, BOX_INTERVAL_DAYS[box - 1]) };
  s.review[key] = item;
}

export function dueReviewKeys(s: ProgressState, today: string = dayKey()): string[] {
  return Object.values(s.review)
    .filter((r) => r.due <= today)
    .sort((a, b) => a.box - b.box || a.due.localeCompare(b.due))
    .map((r) => r.key);
}

export function resolveReviewKey(key: string) {
  const [lessonId, exerciseId] = key.split(":");
  const lesson = allLessons.find((l) => l.id === lessonId);
  const exercise = lesson?.exercises.find((e) => e.id === exerciseId);
  return lesson && exercise ? { lesson, exercise } : undefined;
}

/* ------------------------------- badges ------------------------------ */

export const BADGES: BadgeDef[] = [
  { id: "first-step", name: "First Step", description: "Finish your first lesson.", glyph: "spark" },
  { id: "foundations", name: "Pattern Finder", description: "Complete How AI Works.", glyph: "path" },
  { id: "toolkit", name: "Prompt Smith", description: "Complete Using AI Well.", glyph: "lens" },
  { id: "ethics", name: "Fair Player", description: "Complete AI Ethics & Integrity.", glyph: "shield" },
  { id: "graduate", name: "Neuronaut Graduate", description: "Complete all three modules.", glyph: "cap" },
  { id: "flawless", name: "Flawless", description: "Finish a lesson with every answer right on the first try.", glyph: "star" },
  { id: "streak-3", name: "Warming Up", description: "Learn three days in a row.", glyph: "flame" },
  { id: "streak-7", name: "On a Roll", description: "Learn seven days in a row.", glyph: "flame" },
  { id: "reviewer", name: "Second Look", description: "Correct 10 review questions.", glyph: "loop" },
];

function award(s: ProgressState, id: string, now: string, events: ProgressEvent[]): void {
  if (s.badges[id]) return;
  const def = BADGES.find((b) => b.id === id);
  if (!def) return;
  s.badges[id] = now;
  events.push({ type: "badge", badge: def });
}

function checkBadges(s: ProgressState, now: string, events: ProgressEvent[], reviewCorrectTotal: number): void {
  if (Object.keys(s.lessons).length >= 1) award(s, "first-step", now, events);
  let allDone = true;
  for (const m of modules) {
    const done = m.lessons.every((l) => s.lessons[l.id]);
    if (done) award(s, m.id, now, events);
    else allDone = false;
  }
  if (allDone) award(s, "graduate", now, events);
  if (s.streak.current >= 3) award(s, "streak-3", now, events);
  if (s.streak.current >= 7) award(s, "streak-7", now, events);
  if (reviewCorrectTotal >= 10) award(s, "reviewer", now, events);
}

/* ------------------------------ actions ------------------------------ */

function addXp(s: ProgressState, amount: number, reason: string, today: string, events: ProgressEvent[]) {
  if (amount <= 0) return;
  const before = levelForXp(s.xp);
  s.xp += amount;
  s.history[today] = (s.history[today] ?? 0) + amount;
  events.push({ type: "xp", amount, reason });
  const after = levelForXp(s.xp);
  if (after > before) events.push({ type: "level", level: after });
}

function trimHistory(s: ProgressState, today: string) {
  const cutoff = addDays(today, -60);
  for (const k of Object.keys(s.history)) if (k < cutoff) delete s.history[k];
}

/** Feeds one answer into the lesson's BKT estimate. First-try right counts as right. */
function observe(s: ProgressState, lessonId: string, exerciseId: string, correct: boolean, today: string): void {
  const ex = allLessons.find((l) => l.id === lessonId)?.exercises.find((e) => e.id === exerciseId);
  if (!ex) return;
  // Apply forgetting first, then the new evidence.
  s.mastery[lessonId] = bktUpdate(masteryOf(s, lessonId, today), correct, guessRate(ex));
  s.masterySeen[lessonId] = today;
}

/** A lesson's mastery estimate today, after forgetting. BKT.init if never practised. */
export function masteryOf(s: ProgressState, lessonId: string, today: string = dayKey()): number {
  const p = s.mastery[lessonId];
  if (p === undefined) return BKT.init;
  const seen = s.masterySeen[lessonId];
  return seen ? decayed(p, daysBetween(seen, today)) : p;
}

export function completeLesson(
  prev: ProgressState,
  lesson: Lesson,
  results: ExerciseResult[],
  now: Date = new Date(),
): { state: ProgressState; events: ProgressEvent[]; accuracy: number } {
  const s: ProgressState = structuredClone(prev);
  const today = dayKey(now);
  const iso = now.toISOString();
  const events: ProgressEvent[] = [];

  touchStreak(s, today, events);

  const firstTry = results.filter((r) => r.correct && !r.retried).length;
  const retried = results.filter((r) => r.correct && r.retried).length;
  const accuracy = results.length ? firstTry / results.length : 0;
  const firstCompletion = !s.lessons[lesson.id];

  // Repeat runs still earn XP, at half rate, so practice is never wasted.
  const factor = firstCompletion ? 1 : 0.5;
  addXp(s, Math.round((firstTry * XP.correctFirstTry + retried * XP.correctAfterRetry) * factor), "answers", today, events);
  addXp(s, Math.round(XP.lessonComplete * factor), "lesson", today, events);
  if (accuracy === 1) {
    addXp(s, Math.round(XP.perfectBonus * factor), "perfect", today, events);
    award(s, "flawless", iso, events);
  }

  for (const r of results) {
    scheduleReview(s, `${lesson.id}:${r.exerciseId}`, r.correct && !r.retried, today);
    observe(s, lesson.id, r.exerciseId, r.correct && !r.retried, today);
  }

  const rec = s.lessons[lesson.id];
  s.lessons[lesson.id] = {
    completedAt: rec?.completedAt ?? iso,
    bestAccuracy: Math.max(rec?.bestAccuracy ?? 0, accuracy),
    attempts: (rec?.attempts ?? 0) + 1,
  };

  checkBadges(s, iso, events, s.stats.reviewCorrect);
  trimHistory(s, today);
  s.updatedAt = iso;
  return { state: s, events, accuracy };
}

export function completeReview(
  prev: ProgressState,
  results: { key: string; correct: boolean }[],
  now: Date = new Date(),
): { state: ProgressState; events: ProgressEvent[] } {
  const s: ProgressState = structuredClone(prev);
  const today = dayKey(now);
  const iso = now.toISOString();
  const events: ProgressEvent[] = [];
  touchStreak(s, today, events);
  const correct = results.filter((r) => r.correct).length;
  addXp(s, correct * XP.reviewCorrect, "review", today, events);
  for (const r of results) {
    scheduleReview(s, r.key, r.correct, today);
    const [lessonId, exerciseId] = r.key.split(":");
    observe(s, lessonId, exerciseId, r.correct, today);
  }
  s.stats.reviewCorrect += correct;
  checkBadges(s, iso, events, s.stats.reviewCorrect);
  trimHistory(s, today);
  s.updatedAt = iso;
  return { state: s, events };
}

/* --------------------------- adaptive practice ------------------------ */

export const PRACTICE_SIZE = 5;
/** Practice XP is lower than lesson XP, so grinding practice never beats new lessons. */
export const PRACTICE_XP = 3;

/**
 * Picks practice questions from the lessons the learner knows least.
 *
 * Only finished lessons are eligible (practice never spoils a lesson). Each lesson gets a
 * weight of 1 − P(known), so a lesson at 0.4 is picked three times as often as one at 0.8;
 * mastered lessons (≥ 0.95) are left out unless everything is mastered. Lessons are drawn
 * with a seeded generator, so the same day gives the same set (and tests are exact), and
 * within a lesson questions rotate so a learner does not see the same one twice in a row.
 */
export function practiceQueue(s: ProgressState, today: string = dayKey(), size = PRACTICE_SIZE): { key: string; lessonId: string }[] {
  const done = allLessons.filter((l) => s.lessons[l.id]);
  if (!done.length) return [];
  let pool = done.filter((l) => masteryOf(s, l.id, today) < MASTERED);
  if (!pool.length) pool = done;
  const weight = (id: string) => Math.max(0.05, 1 - masteryOf(s, id, today));

  let h = 2166136261;
  for (const c of `${today}|${s.stats.practiceAnswered}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };

  const used = new Map<string, number>();
  const out: { key: string; lessonId: string }[] = [];
  const total = pool.reduce((n, l) => n + weight(l.id), 0);
  for (let i = 0; i < size; i++) {
    let r = rand() * total;
    const lesson = pool.find((l) => (r -= weight(l.id)) <= 0) ?? pool[pool.length - 1];
    const order = seededShuffle(lesson.exercises, `${lesson.id}|${today}`);
    const n = used.get(lesson.id) ?? 0;
    used.set(lesson.id, n + 1);
    const ex = order[n % order.length];
    const key = `${lesson.id}:${ex.id}`;
    if (!out.some((o) => o.key === key)) out.push({ key, lessonId: lesson.id });
  }
  return out;
}

export function completePractice(
  prev: ProgressState,
  results: { key: string; correct: boolean }[],
  now: Date = new Date(),
): { state: ProgressState; events: ProgressEvent[]; before: Record<string, number> } {
  const s: ProgressState = structuredClone(prev);
  const today = dayKey(now);
  const events: ProgressEvent[] = [];
  const before: Record<string, number> = {};
  touchStreak(s, today, events);
  for (const r of results) {
    const [lessonId, exerciseId] = r.key.split(":");
    if (!(lessonId in before)) before[lessonId] = masteryOf(s, lessonId, today);
    observe(s, lessonId, exerciseId, r.correct, today);
    // Practice and Review share one queue. A miss joins it, exactly like a lesson miss. A right
    // answer on a question that is *due* counts as reviewing it; one that isn't due yet leaves
    // its date alone, so practice can't skip the spacing.
    const item = s.review[r.key];
    if (!r.correct) scheduleReview(s, r.key, false, today);
    else if (item && item.due <= today) scheduleReview(s, r.key, true, today);
  }
  addXp(s, results.filter((r) => r.correct).length * PRACTICE_XP, "practice", today, events);
  s.stats.practiceAnswered += results.length;
  checkBadges(s, now.toISOString(), events, s.stats.reviewCorrect);
  trimHistory(s, today);
  s.updatedAt = now.toISOString();
  return { state: s, events, before };
}

export type Recommendation =
  | { kind: "review"; count: number }
  | { kind: "lesson"; lesson: Lesson }
  | { kind: "practice"; lesson: Lesson; mastery: number }
  | { kind: "done" };

/**
 * What to do next, in priority order: due reviews (spacing works only if done on time), then
 * a finished lesson whose mastery is below 0.6 (shaky), then the next new lesson, then
 * practice on the weakest unmastered lesson.
 */
export function recommendNext(s: ProgressState, today: string = dayKey()): Recommendation {
  const due = dueReviewKeys(s, today).length;
  if (due) return { kind: "review", count: due };
  const done = allLessons.filter((l) => s.lessons[l.id]);
  const weakest = done
    .map((lesson) => ({ lesson, mastery: masteryOf(s, lesson.id, today) }))
    .sort((a, b) => a.mastery - b.mastery)[0];
  if (weakest && weakest.mastery < 0.6) return { kind: "practice", ...weakest };
  const next = nextLesson(s);
  if (next) return { kind: "lesson", lesson: next };
  if (weakest && weakest.mastery < MASTERED) return { kind: "practice", ...weakest };
  return { kind: "done" };
}

/* ------------------------------ queries ------------------------------ */

export function earnedBadges(s: ProgressState): { badge: BadgeDef; earnedAt: string }[] {
  return BADGES.filter((b) => s.badges[b.id]).map((b) => ({ badge: b, earnedAt: s.badges[b.id] }));
}

export function isLessonUnlocked(s: ProgressState, lessonId: string): boolean {
  for (const m of modules) {
    const i = m.lessons.findIndex((l) => l.id === lessonId);
    if (i === -1) continue;
    return i === 0 || Boolean(s.lessons[m.lessons[i - 1].id]);
  }
  return false;
}

export function moduleProgress(s: ProgressState, moduleId: string): { done: number; total: number } {
  const m = modules.find((x) => x.id === moduleId);
  if (!m) return { done: 0, total: 0 };
  return { done: m.lessons.filter((l) => s.lessons[l.id]).length, total: m.lessons.length };
}

export function nextLesson(s: ProgressState): Lesson | undefined {
  return allLessons.find((l) => !s.lessons[l.id] && isLessonUnlocked(s, l.id));
}

/** XP earned in the current Monday-start week. */
export function weekXp(s: ProgressState, now: Date = new Date()): number {
  const today = dayKey(now);
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  let total = 0;
  for (let i = 0; i <= dow; i++) total += s.history[addDays(today, -i)] ?? 0;
  return total;
}

/** Monday to Sunday of the current week, so the chart and weekXp always agree. */
export function weekDays(s: ProgressState, now: Date = new Date()): { day: string; xp: number; future: boolean }[] {
  const today = dayKey(now);
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - dow);
    const future = day > today;
    return { day, xp: future ? 0 : (s.history[day] ?? 0), future };
  });
}

/** Last n days of XP, oldest first. */
export function recentDays(s: ProgressState, n = 7, now: Date = new Date()): { day: string; xp: number }[] {
  const today = dayKey(now);
  return Array.from({ length: n }, (_, i) => {
    const day = addDays(today, i - (n - 1));
    return { day, xp: s.history[day] ?? 0 };
  });
}

/** Merge two progress states (e.g. local guest + cloud). Keeps the best of each. */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  // Start from the newer save and fold the older one in. (Comparing the clone to the
  // original used to make `other` always `a`, so a newer `a` silently ignored all of `b`.)
  const [newer, other] = a.updatedAt >= b.updatedAt ? [a, b] : [b, a];
  const out: ProgressState = structuredClone(newer);
  out.xp = Math.max(a.xp, b.xp);
  for (const [id, rec] of Object.entries(other.lessons)) {
    const mine = out.lessons[id];
    out.lessons[id] = mine
      ? {
          completedAt: mine.completedAt < rec.completedAt ? mine.completedAt : rec.completedAt,
          bestAccuracy: Math.max(mine.bestAccuracy, rec.bestAccuracy),
          attempts: Math.max(mine.attempts, rec.attempts),
        }
      : rec;
  }
  for (const [id, at] of Object.entries(other.badges)) if (!out.badges[id]) out.badges[id] = at;
  for (const [d, xp] of Object.entries(other.history)) out.history[d] = Math.max(out.history[d] ?? 0, xp);
  // Review: keep every item from both sides. If both have it, keep the more cautious copy
  // (lower box, then earlier due date), so a sync can never skip a question the learner missed.
  for (const [k, item] of Object.entries(other.review)) {
    if (out.reviewDone[k]) continue; // the newer save mastered it: don't bring it back
    const mine = out.review[k];
    if (!mine || item.box < mine.box || (item.box === mine.box && item.due < mine.due)) out.review[k] = { ...item };
  }
  // Mastery: keep whichever side practised the lesson more recently.
  for (const [k, day] of Object.entries(other.reviewDone)) {
    if (out.review[k]) continue; // the newer save missed it again after the older one mastered it
    if (!out.reviewDone[k] || day > out.reviewDone[k]) out.reviewDone[k] = day;
  }
  for (const [id, p] of Object.entries(other.mastery)) {
    const theirs = other.masterySeen[id] ?? "";
    if (out.mastery[id] === undefined || theirs > (out.masterySeen[id] ?? "")) {
      out.mastery[id] = p;
      if (theirs) out.masterySeen[id] = theirs;
    }
  }
  out.stats = {
    reviewCorrect: Math.max(a.stats.reviewCorrect, b.stats.reviewCorrect),
    practiceAnswered: Math.max(a.stats.practiceAnswered, b.stats.practiceAnswered),
  };
  out.streak.longest = Math.max(a.streak.longest, b.streak.longest);
  return out;
}
