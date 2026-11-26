import type { Metadata } from "next";
import { modules } from "@neuronaut/core";
import { ModulePath } from "@/components/path";

export const metadata: Metadata = {
  title: "Learning path",
  description: "Three modules on how AI works, using AI well, and using AI ethically.",
};

export default function LearnPage() {
  return (
    <div className="wrap learn-page">
      <header className="page-head">
        <h1>Your learning path</h1>
        <p className="lede">
          Start any module. Lessons inside a module unlock in order, and each one takes about five minutes.
        </p>
      </header>
      {modules.map((m, i) => (
        <ModulePath key={m.id} module={m} index={i} />
      ))}
    </div>
  );
}
