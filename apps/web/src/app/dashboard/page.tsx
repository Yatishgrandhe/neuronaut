import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "My progress",
  description: "Your XP, level, streak, module progress and badges.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
