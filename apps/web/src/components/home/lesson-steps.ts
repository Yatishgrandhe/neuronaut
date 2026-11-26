import type { PipPose } from "@/components/Pip";

/** Shared contract for the "How a lesson works" section (tabs, screens, carousel). */
export type StepIndex = 0 | 1 | 2 | 3;

export const LESSON_STEPS: { num: string; title: string; body: string; pip: PipPose }[] = [
  { num: "01", title: "Read two ideas", body: "Every lesson starts with two short cards that explain one concept in plain words.", pip: "idle" },
  { num: "02", title: "Answer five questions", body: "Multiple choice, true or false, put-in-order and matching. Every answer tells you why.", pip: "think" },
  { num: "03", title: "Get the missed ones back", body: "Wrong answers come back the same day, then after 1, 3, 7 and 16 days, until they stick.", pip: "point" },
  { num: "04", title: "Earn a badge", body: "Finish lessons to earn skill badges like Prompt Smith and Fair Player.", pip: "cheer" },
];

/** Auto-advance time per tab on desktop. */
export const STEP_MS = 6000;

/**
 * Props for `LessonWindow` (components/home/lesson-screens.tsx).
 * - step: which screen to show.
 * - playing: true while this screen should run its timed demo (flip, tap, count-up...).
 *   When it goes false the screen keeps its current frame; when `step` changes the demo restarts.
 * - reduced: reduced motion; show each screen's final state, 150ms fade only.
 * - compact: tighter spacing (short laptops, mobile carousel cards).
 * - onNext: called by the window's buttons to move on to the next step.
 * - fit: "fill" = fixed 16:10 window that fills its box (desktop/tablet stage);
 *        "auto" = auto height that wraps its content (mobile carousel).
 */
export type LessonWindowProps = {
  step: StepIndex;
  playing: boolean;
  reduced: boolean;
  compact?: boolean;
  fit?: "fill" | "auto";
  /** The window's own buttons (Start questions, Continue, Review now) move the tour to the next step. */
  onNext?: () => void;
};
