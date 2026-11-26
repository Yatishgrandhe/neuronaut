import { Flame, GraduationCap, Repeat2, Route, ScanSearch, ShieldCheck, Sparkles, Star, type LucideIcon } from "lucide-react";
import type { BadgeDef } from "@neuronaut/core";

const ICONS: Record<BadgeDef["glyph"], LucideIcon> = {
  spark: Sparkles,
  path: Route,
  shield: ShieldCheck,
  flame: Flame,
  loop: Repeat2,
  star: Star,
  cap: GraduationCap,
  lens: ScanSearch,
};

const TONE: Record<BadgeDef["glyph"], string> = {
  spark: "var(--spark)",
  path: "var(--blue)",
  shield: "var(--leaf)",
  flame: "var(--spark)",
  loop: "var(--leaf)",
  star: "var(--sun)",
  cap: "var(--ink)",
  lens: "var(--blue)",
};

/** Hexagonal medal: earned badges are coloured, locked ones are outlined. */
export function BadgeGlyph({ glyph, earned, size = 72 }: { glyph: BadgeDef["glyph"]; earned: boolean; size?: number }) {
  const Icon = ICONS[glyph];
  return (
    <span className="medal" data-earned={earned} style={{ "--tone": TONE[glyph], width: size, height: size } as React.CSSProperties}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <path d="M50 4l40 23v46L50 96 10 73V27z" className="medal-shape" />
        <path d="M50 14l31 18v36L50 86 19 68V32z" className="medal-inner" />
      </svg>
      <Icon className="medal-icon" aria-hidden strokeWidth={2.4} size={size * 0.38} />
    </span>
  );
}
