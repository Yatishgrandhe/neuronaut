"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "home-course", label: "The course" },
  { id: "home-how", label: "How a lesson works" },
  { id: "home-try", label: "Try a question" },
  { id: "home-qa", label: "Questions" },
];
const SECTION_IDS = SECTIONS.map((s) => s.id);

/**
 * Tracks which section is under a thin band near the top of the viewport.
 * The band only changes state when a section edge crosses it, so one observer is enough.
 */
function useActiveSection(fallback: string) {
  const [active, setActive] = useState(fallback);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const hits = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) hits.add(e.target.id);
          else hits.delete(e.target.id);
        }
        const current = SECTION_IDS.filter((id) => hits.has(id));
        if (current.length) setActive(current[current.length - 1]);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return active;
}

/** Sticky "On this page" index. The link for the section you are reading is highlighted. */
export function HomeIndex() {
  const active = useActiveSection(SECTION_IDS[0]);
  return (
    <nav className="home-sky-index" aria-label="On this page">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}
