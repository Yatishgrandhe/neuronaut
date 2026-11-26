export type ModuleId = "foundations" | "toolkit" | "ethics";

export interface ChoiceExercise {
  kind: "choice";
  id: string;
  prompt: string;
  /** Optional passage shown above the options (e.g. an AI answer to inspect). */
  passage?: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface TrueFalseExercise {
  kind: "truefalse";
  id: string;
  statement: string;
  answer: boolean;
  explain: string;
}

/** Build an ordered answer from word tiles (prompt building, pipelines). */
export interface OrderExercise {
  kind: "order";
  id: string;
  prompt: string;
  tiles: string[];
  /** Correct sequence, as indexes into `tiles`. Extra tiles are distractors. */
  answer: number[];
  explain: string;
}

export interface MatchExercise {
  kind: "match";
  id: string;
  prompt: string;
  pairs: [left: string, right: string][];
  explain: string;
}

export type Exercise = ChoiceExercise | TrueFalseExercise | OrderExercise | MatchExercise;

export interface TeachCard {
  title: string;
  body: string;
}

export interface Lesson {
  id: string;
  moduleId: ModuleId;
  title: string;
  summary: string;
  minutes: number;
  cards: TeachCard[];
  exercises: Exercise[];
}

export interface Source {
  label: string;
  url: string;
  note?: string;
}

export interface Module {
  id: ModuleId;
  title: string;
  tagline: string;
  description: string;
  /** Token name for the module colour, resolved per platform. */
  color: "ink" | "spark" | "leaf";
  lessons: Lesson[];
  sources: Source[];
}

export interface LessonRecord {
  completedAt: string;
  bestAccuracy: number;
  attempts: number;
}

export interface ReviewItem {
  /** `${lessonId}:${exerciseId}` */
  key: string;
  box: number;
  due: string;
}

export interface ProgressState {
  /** Schema version. Version 1 saves are migrated on load (see parseProgress). */
  version: 2;
  xp: number;
  lessons: Record<string, LessonRecord>;
  streak: {
    current: number;
    longest: number;
    lastActiveDay: string | null;
    freezes: number;
  };
  review: Record<string, ReviewItem>;
  badges: Record<string, string>;
  /** XP earned per local day, `YYYY-MM-DD` → xp. Trimmed to the last 60 days. */
  history: Record<string, number>;
  weeklyGoal: number;
  /** BKT estimate P(known) per lesson id, 0–1. Missing = not started. */
  mastery: Record<string, number>;
  /** Day (`YYYY-MM-DD`) each lesson's estimate was last updated, for the forgetting curve. */
  masterySeen: Record<string, string>;
  stats: {
    /** Review questions answered right on the first try, all time. */
    reviewCorrect: number;
    /** Practice questions answered, all time. */
    practiceAnswered: number;
  };
  updatedAt: string;
}

export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  /** True when the learner needed more than one try. */
  retried: boolean;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  glyph: "spark" | "path" | "shield" | "flame" | "loop" | "star" | "cap" | "lens";
}

export type ProgressEvent =
  | { type: "xp"; amount: number; reason: string }
  | { type: "badge"; badge: BadgeDef }
  | { type: "streak"; current: number; usedFreeze: boolean }
  | { type: "level"; level: number }
  | { type: "freeze-earned"; total: number };
