import type { Metadata } from "next";
import { Flashcards } from "@/components/flashcards";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Flip through every lesson's big ideas and true-or-false claims, and sort them into Still learning or Know it.",
};

export default function FlashcardsPage() {
  return <Flashcards />;
}
