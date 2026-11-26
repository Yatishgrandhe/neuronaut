import type { SVGProps } from "react";

export { Pip, type PipPose, type PipHandle } from "./Pip";

/** Nodes of the Neuronaut "N": a tiny neural network shaped like an N. */
export const N_NODES = [
  { x: 16, y: 50 },
  { x: 16, y: 16 },
  { x: 32, y: 33 },
  { x: 48, y: 50 },
] as const;
export const N_DOT = { x: 49, y: 14 };

/**
 * The Neuronaut mark: four ink nodes joined like neurons into an "N",
 * with the orange goal-dot at the top right.
 */
export function Mark({ size = 32, ...rest }: { size?: number } & SVGProps<SVGSVGElement>) {
  const [a, b, c, d] = N_NODES;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" {...rest}>
      <path
        d={`M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}L${d.x} ${d.y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {N_NODES.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="6.5" fill="currentColor" />
      ))}
      <circle cx={N_DOT.x} cy={N_DOT.y} r="7.5" fill="#e8501f" />
    </svg>
  );
}

export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="wordmark" style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3 }}>
      <Mark size={size} />
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.78, letterSpacing: "-0.01em", lineHeight: 1 }}>
        Neuronaut
      </span>
    </span>
  );
}
