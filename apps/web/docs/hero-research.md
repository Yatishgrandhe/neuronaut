# Hero research and decisions (Nov 20, 2026)

> **Update (Nov 26, 2026):** the word-planet hero described below is no longer on the home page. The home page hero is now an animated 3D particle field, the React Bits "Particles" background, which replaced an earlier Milky Way photo version the same day. The rest of this note is kept as written.

Five parallel research passes (Haiku), then synthesis here. Skills applied on top: Frontend Design, Impeccable (craft floor + detector).

## Report summaries

**1. AI-look audit.** The strongest tells on the current page: a stock section stack (hero, marquee, story, course, ask, progress, FAQ, CTA); a heavy 700-weight serif headline; one radius (24px) and stacked soft shadows on every surface; cool Apple greys (`globals.css` literally says "Apple polish"); decorative gradients (radial glow behind the planet); fade-up on every block; an endless topic marquee; decorative fake-progress chips ("3-day streak", "Fair Player") in the final CTA; a generic FAQ accordion; a generic site tagline. Not present: purple, gradient text, glass outside the nav.

**2. Hero teardown.** Earth Evidence Lab is behind Vercel SSO and could not be read. Apple / Linear / Stripe / Vercel: one centered column, one primary action, a visual anchored to an edge, handoff via a background change. Current hero values are already close: 86px headline at 1440, 68px pill, 820px pill/card width, 260px planet strip on phones with the card overlapping 140px.

**3. Globe library.** Keep the hand-rolled three + r3f planet (already installed, zero marginal bytes). cobe is land-map driven, react-globe.gl / three-globe are 150–500 KB gz and geo-oriented, ogl duplicates three, drei adds ~500 KB gz for nothing. Improvements: fade dots to transparent at the left/right in the shader (not only a CSS mask), no glow, cap dpr lower on phones. SVG still stays the server-rendered LCP element.

**4. Motion.** No new packages. Keep WAAPI for the logo handoff (motion `layoutId` scales the wordmark and crossfades across separate trees; GSAP is +27 KB). Skip Lenis (fights native trackpad / iOS scroll) and rough-notation (React 19 peer unverified; `Annotation.tsx` already covers it). Paper overlay, not black. Timing: draw 700ms `cubic-bezier(0.65,0,0.35,1)`, hold 400ms, glide 1000ms with X on `cubic-bezier(0.76,0,0.24,1)` and Y on `cubic-bezier(0.33,0,0.2,1)` so the path bends; nav items at +500ms with 60ms stagger; reveal the real nav logo in the same frame the overlay unmounts.

**5. Components / perf / testing.** Avoid shadcn/ui, Magic UI, Aceternity (their defaults are the template look). If tabs / accordion / carousel are needed: `@radix-ui/react-tabs` 1.2.1 (~9 KB), `@radix-ui/react-accordion` 1.3.1 (~9 KB), `embla-carousel-react` 8.6.0 (~7 KB). `cmdk` not needed: the pill is a plain `role="search"` form. Keep Gelasio + Caveat via next/font. Lighthouse must run on `next build && next start`, not dev. Playwright is not installed; add it as a devDependency for the screenshot script.

## Conflicts and resolutions

- *Auditor: "centered hero stack is a tell"* vs *brief: centered headline*. The brief wins; asymmetry goes into the sections below instead.
- *Auditor: drop 700 weight* vs *brief: Gelasio headlines*. Keep Gelasio; the headline stays bold (the planet horizon needs the weight), but the display stack is fixed so Gelasio actually renders (it was falling back to Georgia first).
- *Frontend Design skill: cream + serif + terracotta is a default look* vs *brief pins exactly that palette*. The brief's words win; distinctiveness comes from the planet, Pip and the hand-drawn annotation layer, not from the palette.
- *Motion agent: rewrite the intro timing* — another session was already rewriting the intro (paper overlay, 1000ms handoff) concurrently, so this pass leaves `intro-overlay.tsx` / the intro block of `chrome.css` to that work.

## Final decisions

**AI tells removed this pass**
- `globals.css`: cool greys → warm ink tints; Gelasio first in `--font-display`; drop the "Apple polish" framing; tighter single-layer shadows; card radius 24 → 16px.
- `home-hero.css`: remove the radial glow `.planet::before`.
- `page.tsx` / `ticker.tsx`: remove the topic marquee.
- `final-cta.tsx`: remove the fake streak / badge chips and their icons.
- `chrome.css`: bounce/overshoot easing → exponential ease-out.
- `layout.tsx`: generic tagline/description rewritten without "XP, streaks and badges" sales copy.

**Globe:** existing three + r3f planet, shader edge fade, dpr `[1, 1.5]` on phones, `[1, 1.75]` elsewhere. Fallback: server-rendered SVG still (`planet-fallback.tsx`) for no-WebGL, ≤4 cores, reduced motion; it is the LCP element and the canvas crossfades over it after the first frame.

**Motion / annotation:** WAAPI + CSS only. Existing `Annotation.tsx` for marks.

**Components:** none added. Radix / Embla only if a real tabs / carousel need appears.

**Hero spec**
| | 1440×900 | 390×844 |
|---|---|---|
| Headline | Gelasio 700, 86px (clamp 44–96 / 6vw), lh 1.02, −0.02em | 43px (clamp 40–46 / 11vw), left-aligned |
| Sub | 20/1.45, 46ch, +18px | 17px, +14px |
| Search pill | 820px max, 68px tall, button 54px | full width, 58px, 48px round icon button |
| Facts | 14px, +14px | 14px, left |
| Planet | fills `.hero-bottom`, top arc only, 14% side feather + shader fade | 260px strip |
| Proof card | 820px max, sits on the curve | overlaps the strip by 140px, single-column options |
| Colors | paper #fbfaf7, ink #1d1d1f, accent #c2410c (button + underline only) | same |

Intro timeline (ms, from first paint): logo draw 0–700 · hold 700–1100 · glide 1100–2100 · nav items 2100–2600 (60ms stagger) · hero rise from ~1950, 80ms stagger. Once per session (`sessionStorage.nn_intro`), skipped on any input, off for reduced motion, decided in an inline head script before paint.

**Packages:** `playwright` (devDependency) for `scripts/screenshots.mjs`. Nothing else.
