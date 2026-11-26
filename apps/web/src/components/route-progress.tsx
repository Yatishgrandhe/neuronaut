"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** A 2px orange load bar at the top of the viewport for in-app navigations. */
export function RouteProgress() {
  const path = usePathname();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [from, setFrom] = useState(path);

  // Path changed: finish the bar. (State update during render is React's documented
  // pattern for adjusting state when a prop changes.)
  if (path !== from) {
    setFrom(path);
    if (phase === "loading") setPhase("done");
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      setPhase("loading");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(() => setPhase("idle"), 400);
    return () => clearTimeout(t);
  }, [phase]);

  return <div className="route-bar" data-phase={phase} aria-hidden />;
}
