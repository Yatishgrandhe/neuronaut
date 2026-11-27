import { Instrument_Serif } from "next/font/google";
import { HomeHero } from "@/components/home-sky/home-hero";
import { HomeLedger } from "@/components/home-sky/home-ledger";
import { HomeParticles } from "@/components/home-sky/particles/home-particles";
import "./home-sky.css";

// Instrument Serif for headings (italic is used for the emphasised word in the hero).
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-home-serif",
  display: "swap",
});

// The home page is fully static; opt it out of instant-navigation validation (dev-only check).
export const instant = false;

export default function Home() {
  // The hero text is server-rendered. The particle canvas mounts client-side over a solid background.
  return (
    <div className={`home-sky ${serif.variable}`}>
      <HomeHero backdrop={<HomeParticles />} />
      <HomeLedger />
    </div>
  );
}
