import type { Metadata, Viewport } from "next";
import { Caveat, Gelasio } from "next/font/google";
import { Header } from "@/components/header";
import { ProgressProvider } from "@/components/progress";
import { RouteFade } from "@/components/route-fade";
import { RouteProgress } from "@/components/route-progress";
import { FooterGate } from "@/components/footer-gate";
import { SiteFooter } from "@/components/site-footer";
import { INTRO_HEAD_SCRIPT, IntroOverlay } from "@/components/intro-overlay";
import "./globals.css";
import "./site.css";
import "./chrome.css";

// Georgia ships on Apple and Windows devices; Gelasio (metric-compatible with Georgia) covers Android/ChromeOS.
const gelasio = Gelasio({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-gelasio", display: "swap" });
// Handwriting font for annotation margin notes only.
const caveat = Caveat({ subsets: ["latin"], weight: ["600"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Neuronaut: use AI well, and stay honest about it",
    template: "%s · Neuronaut",
  },
  description:
    "Free five-minute lessons for high schoolers: how AI works, how to prompt it, and how to use it for school without cheating. No account needed.",
  applicationName: "Neuronaut",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#161514" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${gelasio.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        {/* Decide before first paint whether the intro runs, so it never flashes on reload. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_HEAD_SCRIPT }} />
      </head>
      {/* Extensions sometimes add attributes to <body>; don't treat that as a mismatch. */}
      <body suppressHydrationWarning>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <ProgressProvider>
          <RouteProgress />
          <IntroOverlay />
          <Header />
          <main id="main">
            <RouteFade>{children}</RouteFade>
          </main>
          <FooterGate>
            <SiteFooter />
          </FooterGate>
        </ProgressProvider>
      </body>
    </html>
  );
}
