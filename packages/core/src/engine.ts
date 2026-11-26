import { allLessons, modules } from "./content.ts";
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
    version: 1,
    xp: 0,
    lessons: {},
    streak: { current: 0, longest: 0, lastActiveDay: null, freezes: 1 },
    review: {},
    badges: {},
    history: {},
    weeklyGoal: 100,
    updatedAt: now.toISOString(),
  };
}

/** Accept unknown JSON (storage, import file) and return a valid state. */
export function parseProgress(raw: unknown): ProgressState {
  const base = createProgress();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<ProgressState>;
  if (r.version !== 1) return base;
  return {
    ...base,
    ...r,
    streak: { ...base.streak, ...(r.streak ?? {}) },
    lessons: r.lessons ?? {},
    review: r.review ?? {},
    badges: r.badges ?? {},
    history: r.history ?? {},
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
    return;
  }
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

const REVIEW_TALLY = "__reviewCorrect";

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

  for (const r of results) scheduleReview(s, `${lesson.id}:${r.exerciseId}`, r.correct && !r.retried, today);

  const rec = s.lessons[lesson.id];
  s.lessons[lesson.id] = {
    completedAt: rec?.completedAt ?? iso,
    bestAccuracy: Math.max(rec?.bestAccuracy ?? 0, accuracy),
    attempts: (rec?.attempts ?? 0) + 1,
  };

  checkBadges(s, iso, events, Number(s.badges[REVIEW_TALLY] ?? 0));
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
  for (const r of results) scheduleReview(s, r.key, r.correct, today);
  const tally = Number(s.badges[REVIEW_TALLY] ?? 0) + correct;
  s.badges[REVIEW_TALLY] = String(tally);
  checkBadges(s, iso, events, tally);
  trimHistory(s, today);
  s.updatedAt = iso;
  return { state: s, events };
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
  const out: ProgressState = structuredClone(a.updatedAt >= b.updatedAt ? a : b);
  const other = out === a ? b : a;
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
  out.streak.longest = Math.max(a.streak.longest, b.streak.longest);
  return out;
}
