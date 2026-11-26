"use client";

import { usePathname } from "next/navigation";

/** Keyed wrapper so each route enters with a short slide-fade (140ms). */
export function RouteFade({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div key={path} className="route">
      {children}
    </div>
  );
}
