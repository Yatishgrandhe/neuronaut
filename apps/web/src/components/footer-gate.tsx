"use client";

import { usePathname } from "next/navigation";

/** Hides the site footer in focused lesson mode. */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  return p.startsWith("/lesson/") || p.startsWith("/lab") ? null : <>{children}</>;
}
