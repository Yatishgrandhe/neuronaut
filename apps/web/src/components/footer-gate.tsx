"use client";

import { usePathname } from "next/navigation";

/** Hides the site footer in focused lesson mode. */
export function FooterGate({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith("/lesson/") ? null : <>{children}</>;
}
