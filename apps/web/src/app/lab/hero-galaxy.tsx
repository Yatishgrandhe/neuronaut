"use client";

import { useSyncExternalStore } from "react";
import Galaxy from "./vendor/Galaxy";
import "./hero-galaxy.css";

// Night-theme backdrop for the hero slot. Fills the absolute .home-sky-backdrop (inset 0).
// Warm star palette on #0b0d12, slow and low density so the headline stays the focus.

const WARM_STARS = ["#f3c98b", "#ffe2b8", "#fff4e0", "#e9b872"];
const PHONE_QUERY = "(max-width: 640px)";

function subscribePhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePhone() {
  return useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

export function GalaxyBackdrop() {
  const phone = usePhone();
  return (
    <div className="hero-galaxy" aria-hidden>
      <Galaxy
        starColors={WARM_STARS}
        backgroundColor="#0b0d12"
        transparent={false}
        intro={false}
        starSpeed={0.15}
        speed={0.4}
        rotationSpeed={0.01}
        density={0.6}
        layers={3}
        glowIntensity={0.25}
        twinkleIntensity={0.2}
        opacity={0.9}
        mouseInteraction
        mouseRepulsion
        repulsionStrength={1.5}
        clickWarp
        dpr={phone ? 1.5 : undefined}
      />
    </div>
  );
}
