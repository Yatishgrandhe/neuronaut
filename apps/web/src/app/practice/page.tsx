import type { Metadata } from "next";
import { PracticeSession } from "@/components/practice-session";

export const metadata: Metadata = {
  title: "Practice",
  description: "Adaptive practice: questions from the lessons you know least, chosen by a mastery model.",
};

export default function PracticePage() {
  return <PracticeSession />;
}
