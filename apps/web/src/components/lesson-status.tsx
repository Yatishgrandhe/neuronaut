"use client";

import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { isLessonUnlocked } from "@neuronaut/core";
import { useProgress } from "./progress";

export function LessonStatus({ lessonId }: { lessonId: string }) {
  const { state, ready } = useProgress();
  const rec = state.lessons[lessonId];
  if (!ready) return <span className="lesson-cta-placeholder skel" aria-hidden />;
  if (rec)
    return (
      <Link className="btn btn-ghost" href={`/lesson/${lessonId}`}>
        <Check size={18} aria-hidden strokeWidth={3} /> Practice again
      </Link>
    );
  if (!isLessonUnlocked(state, lessonId))
    return (
      <span className="locked-pill">
        <Lock size={16} aria-hidden /> Finish the previous lesson
      </span>
    );
  return (
    <Link className="btn btn-spark" href={`/lesson/${lessonId}`}>
      Start
    </Link>
  );
}
