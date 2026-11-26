import type { Metadata } from "next";
import { MatchGame } from "@/components/match-game";

export const metadata: Metadata = {
  title: "Match",
  description: "Pair AI terms and situations with what they mean. Six pairs a round, with an optional clock.",
};

export default function MatchPage() {
  return <MatchGame />;
}
