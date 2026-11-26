import type { Metadata } from "next";
import { ReviewSession } from "@/components/review-session";

export const metadata: Metadata = {
  title: "Review",
  description: "Spaced review of the questions you missed, so they stick.",
};

export default function ReviewPage() {
  return <ReviewSession />;
}
