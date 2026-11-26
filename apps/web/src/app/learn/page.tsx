import type { Metadata } from "next";
import { LearnPath, PathRail } from "@/components/learn-path";

export const metadata: Metadata = {
  title: "Learning path",
  description: "Three units on how AI works, using AI well, and using AI ethically, with a daily goal, review and study modes.",
};

export default function LearnPage() {
  return (
    <div className="wrap learn-page">
      <header className="page-head">
        <h1>Your learning path</h1>
        <p className="lede">Follow the path one lesson at a time. Each takes 4 to 6 minutes, and the next one opens when you finish.</p>
      </header>
      <div className="learn-layout">
        <LearnPath />
        <PathRail />
      </div>
    </div>
  );
}
