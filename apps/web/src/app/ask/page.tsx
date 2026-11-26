import type { Metadata } from "next";
import { Suspense } from "react";
import { AskPip } from "@/components/ask-pip";

export const metadata: Metadata = {
  title: "Ask Pip",
  description: "An AI tutor that answers questions about the Neuronaut lessons, with hints instead of homework answers.",
};

export default function AskPage() {
  return (
    <Suspense>
      <AskPip />
    </Suspense>
  );
}
