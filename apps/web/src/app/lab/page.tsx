import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo, Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { VARIANTS, type VariantId } from "./data";
import { LabBar } from "./lab-client";
import { Notebook, Poster, Sky, Sticker, Tokens } from "./variants";
import { SkyChapters } from "./sky-chapters";
import { SkyLedger } from "./sky-ledger";
import { SkyLog } from "./sky-log";
import { HeroGalaxyPage, HeroParticlesPage } from "./hero-pages";
import "./lab.css";
import "./nb.css";
import "./tk.css";
import "./ps.css";
import "./sk.css";
import "./st.css";
import "./sky-ledger.css";
import "./sky-chapters.css";
import "./sky-log.css";

// Design lab: five directions for the home page, one at a time, to compare and pick from.
// Local only. It 404s in production builds and is kept out of search engines.
export const metadata: Metadata = { title: "Home page lab", robots: { index: false, follow: false } };

// Reads ?v= at request time; local only, so a blocking render is fine.
export const instant = false;

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--lab-mono" });
const grotesk = Archivo({ subsets: ["latin"], weight: ["500", "800"], variable: "--lab-grotesk" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--lab-serif" });
const chunky = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "800"], variable: "--lab-chunky" });

const VIEWS: Record<VariantId, () => React.ReactNode> = {
  notebook: Notebook,
  tokens: Tokens,
  poster: Poster,
  sky: Sky,
  "sky-ledger": SkyLedger,
  "sky-chapters": SkyChapters,
  "sky-log": SkyLog,
  sticker: Sticker,
  "hero-galaxy": HeroGalaxyPage,
  "hero-particles": HeroParticlesPage,
};

export default async function Lab({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { v } = await searchParams;
  const id: VariantId = VARIANTS.some((x) => x.id === v) ? (v as VariantId) : "notebook";
  const View = VIEWS[id];
  return (
    <div className={`lab ${mono.variable} ${grotesk.variable} ${serif.variable} ${chunky.variable}`}>
      <View />
      <LabBar current={id} />
    </div>
  );
}
