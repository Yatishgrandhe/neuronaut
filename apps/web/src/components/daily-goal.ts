"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Daily XP goals the learner can pick from. Small on purpose: a goal should fit between classes. */
export const GOALS = [
  { xp: 10, label: "Casual", minutes: 3 },
  { xp: 20, label: "Regular", minutes: 5 },
  { xp: 30, label: "Serious", minutes: 10 },
] as const;

const KEY = "neuronaut.goal";
const DEFAULT = 20;
const listeners = new Set<() => void>();

function read(): number {
  const n = Number(localStorage.getItem(KEY));
  return GOALS.some((g) => g.xp === n) ? n : DEFAULT;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** The learner's daily XP goal, kept in this browser next to their progress. */
export function useDailyGoal(): [number, (xp: number) => void] {
  const goal = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const set = useCallback((xp: number) => {
    localStorage.setItem(KEY, String(xp));
    listeners.forEach((l) => l());
  }, []);
  return [goal, set];
}
