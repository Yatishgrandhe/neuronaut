"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// Particles is React Bits (MIT + Commons Clause), vendored next to this file.
// It is loaded after hydration (ssr:false), so the hero text is in the server HTML and the
// canvas never blocks first paint. The wrapper below is always rendered, so the solid
// background is there before the canvas mounts and nothing shifts.
const ParticlesCanvas = dynamic(() => import("./Particles"), {
  ssr: false,
  loading: () => null,
});

// The phone breakpoint drops the particle count; useSyncExternalStore keeps this render-pure.
const NARROW_QUERY = "(max-width: 640px)";

function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const readNarrow = () => window.matchMedia(NARROW_QUERY).matches;
const readNarrowOnServer = () => false;

/** Particle backdrop for the home hero. Fills the absolutely positioned .home-sky-backdrop parent. */
export function HomeParticles() {
  const narrow = useSyncExternalStore(subscribeNarrow, readNarrow, readNarrowOnServer);

  return (
    <div className="home-particles" aria-hidden>
      <ParticlesCanvas
        particleCount={narrow ? 150 : 200}
        particleSpread={4}
        speed={0.06}
        particleColors={["#eef2fa", "#eef2fa", "#eef2fa", "#eef2fa", "#f3c98b"]}
        particleBaseSize={140}
        glow={0.4}
        twinkle={0.25}
        connections
        connectionDistance={150}
        connectionOpacity={0.95}
        drift="up"
        driftSpeed={0.3}
        moveParticlesOnHover
        particleHoverFactor={0.5}
        hoverEffect="parallax"
        clickBurst={false}
      />
    </div>
  );
}
