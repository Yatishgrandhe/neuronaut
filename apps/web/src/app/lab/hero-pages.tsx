import { Instrument_Serif } from "next/font/google";
import { HomeHero } from "@/components/home-sky/home-hero";
import { HomeLedger } from "@/components/home-sky/home-ledger";
import "../home-sky.css";
import { GalaxyBackdrop } from "./hero-galaxy";
import { ParticlesBackdrop } from "./hero-particles";

// Same font setup as the home page (src/app/page.tsx), so the lab matches the live page exactly.
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-home-serif",
  display: "swap",
});

// Each lab view renders the real home page composition with one backdrop slot filled.

export function HeroGalaxyPage() {
  return (
    <div className={`home-sky ${serif.variable}`}>
      <HomeHero backdrop={<GalaxyBackdrop />} />
      <HomeLedger />
    </div>
  );
}

export function HeroParticlesPage() {
  return (
    <div className={`home-sky ${serif.variable}`}>
      <HomeHero backdrop={<ParticlesBackdrop />} />
      <HomeLedger />
    </div>
  );
}

