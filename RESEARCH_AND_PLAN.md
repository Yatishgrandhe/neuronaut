# Scholaris — Research Findings & Proposed Plan
_Date: 2026-11-20 · Status: **awaiting approval — nothing built yet**_

---

# REVISION 2 — Scholaris for TSA Webmaster + Software Development (supersedes §3–§6 below)

**Confirmed by user:** product is **Scholaris**; it targets the TSA 2026-27 **Webmaster** event (AI learning portal, grades 9–12) and the **Software Development** event (software that improves how people learn); Duolingo-style learning. The 20-agent research in §2 below still applies (store rules, storage, icons, loading, design); this section adds 5 follow-up agents.

## R1. Competition constraints (biggest risks first)

| Finding | Status | Source |
|---|---|---|
| ⚠️ "Only one entry per event"; 2025-26 general rules: same work may be used for **one year and one competition only** — infraction = disqualification | 2025-26 text verified; 2026-27/27-28 wording **not** verified | [Utah TSA General Rules 2025-26](https://utahtsa.org/wp-content/uploads/2024/08/HS-General-Rules.pdf) |
| ⚠️ Entries must be **original student work**; outside ideas/text/images/sound cited; copyright checklist | Verified (general rules + Webmaster page) | same; [WA TSA Webmaster](https://www.washingtontsa.org/high-school-events/webmaster) |
| GenAI: 2025-26 SD rules banned it; 2027-28 guide (Aug 2026) permits GenAI per a "Use of GenAI" general rule + mandatory **Resources and AI Reflection Form** (≤4 pages) | Partially verified (via VR event page) | [PCA TSA VR 2027-28](https://www.pca-tsa.org/HS/HS%20-%20VR.pdf), [TSA preconference reqs](https://tsaweb.org/competitions/competitive-event-preconference-submission-requirements) |
| Webmaster: ≥3 modules (concepts, tools/techniques, ethics); gamified progress tracking; **≥3 separate pages** linked from home (scroll sections don't count); links to copyright checklist + work log; semifinal interview on design methods + topic research | Verified (WA) | [WA TSA Webmaster](https://www.washingtontsa.org/high-school-events/webmaster) |
| Webmaster WA dates: register 2026-12-18; site link via JudgePro 2027-01-21; final link 2027-03-18 | Verified (WA only — **your state may differ**) | same |
| Software Dev: "educational or social value"; upload AI Reflection Form PDF + Copy of Code (PDF or **public** URL; 30 MB); presentation ≤3 members; WA: virtual round 2027-01-21 (executable code + 1-page summary) | Verified | [TSA CS events](https://tsaweb.org/competitions/!hs/-in-category/categories/computer-science-and-information-technology), [WA TSA SD](https://www.washingtontsa.org/high-school-events/software-development) |
| Past WA Webmaster winners hosted on Vercel | Observed | WA page |
| Framework/template/library rules, rubrics, accessibility requirements | **Unverified** — guide is behind TSA member login | — |

**Implication:** "one project for both events" is probably disallowed. Safer: **one Scholaris brand, two distinct entries** —
- **Webmaster entry → Scholaris *AI* (website):** the required AI learning portal, web-first.
- **Software Development entry → Scholaris app (iOS/Android):** a Duolingo-style skill-practice app solving a *different* learning problem (topic TBD by your team), with its own codebase/content. Shared design tokens only if your advisor confirms that's OK.

## R2. Revised login decision — guest-first, optional account
- Progress tracking across web + iOS + Android is a real account-based feature → optional login is justified; forcing it is not (Apple 5.1.1(v)).
- Default: play as guest (progress in local storage); "Save your progress" → account.
- Because accounts exist: **in-app account deletion** (Apple 5.1.1(v)) + **web deletion link** (Google Play User Data/account-deletion policy) + Data safety deletion answers.
- Auth methods: email magic link + **Sign in with Apple** + Google (4.8 satisfied by offering Apple).
- Audience **13+** on both stores (Play target audience 13-15/16-17/18+; avoid Apple Kids Category and Play Families Policy). Neutral age gate; under-13 → guest only, no account (COPPA). No ads, no tracking SDKs. [FTC COPPA](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa), [Play Families](https://support.google.com/googleplay/android-developer/answer/9893335) (teen-law details unverified — have advisor/counsel check)

## R3. Revised storage
- Local-first (IndexedDB web / expo-sqlite mobile) for guest progress and offline lessons.
- **Existing `scholaris` Supabase project** (`aioyzumxxsepbnfivvdd`) for optional accounts + progress sync: Auth, Postgres + RLS (`profiles`, `progress`, `xp_events`, `badges`), a server-side `delete-account` Edge Function. Currently **unreachable/paused** — restore it in the Supabase dashboard. No edge functions exist yet.
- Lesson content ships as static JSON/MDX in the repo (no DB needed for content).

## R4. Learning design (Duolingo-informed, teen-safe)
- **Adopt:** unit path of 3–5-min micro-lessons; instant explanatory feedback; spaced review of missed items (Leitner/SM-2); XP as progress meter; streaks with auto-forgiveness (weekly goal, free freezes) — Duolingo reports 7-day streak learners 3.6× more likely to finish ([Duolingo](https://blog.duolingo.com/how-duolingo-streak-builds-habit)); milestone celebrations; original mascot via Rive state machine.
- **Adapt:** no hearts/scarcity → unlimited retries + "review mistakes"; competency badges, not attendance badges; opt-in private class leagues, no demotion; 2–3 optional "missions".
- **Avoid:** guilt notifications, sad-mascot shaming, public individual rankings ([Mogavi et al. 2022](https://arxiv.org/abs/2203.16175), [deceptive.design](https://deceptive.design/articles/teaching-or-manipulating-on-the-adoption-of-bright-and-deceptive-patterns-by-duolingo)); anything resembling Duolingo's owl, colours, sounds.

## R5. Webmaster curriculum (aligned, cite-don't-copy)
Frameworks: AI4K12 Five Big Ideas, UNESCO AI Competency Framework for Students (CC BY-SA 3.0 IGO — adaptable with attribution), EC/OECD AILit, CSTA (CC BY-NC-SA), Day of AI / Code.org (verify licence), Common Sense (link only, ND). (Agent compiled from memory — **verify licences**.)
1. **How AI Works** — what AI is; perception; how machines learn (in-browser classifier demo); how LLMs predict tokens; limits.
2. **Using AI Well** — prompting (role/context/task/format); iterating; verification lab (catch a fabricated citation); choosing tools; AI as tutor not ghostwriter.
3. **AI Ethics & Integrity** — school AI policies and disclosure; citing AI (MLA/APA); hallucinations & deepfakes; bias; privacy; personal AI code of ethics (capstone).
Pages: Home, Learn (path), each Module, Dashboard (XP/badges/streak), About/Sources, Copyright checklist, Work log.

## R6. Revised build plan
| # | Milestone | Notes |
|---|---|---|
| M0 | Confirm rules + access | Advisor downloads 2026-27 guide + rating forms; email event managers re GenAI + dual-entry; GitHub repo, Vercel team, restore Supabase |
| M1 | Brand & design system | Impeccable init → PRODUCT.md/DESIGN.md; Scholaris logo + original mascot; tokens; motion spec |
| M2 | Webmaster site (priority — WA virtual deadline 2027-01-21) | Next.js on Vercel; 3 modules × ~5 lessons; gamified dashboard; guest progress; optional Supabase sync; WCAG 2.2 AA; sources + checklist + work-log pages |
| M3 | Software Dev app | Expo SDK 58 iOS/Android; Duolingo-style engine; second learning problem; native tabs/Liquid Glass, M3 Expressive, widgets, reminders (opt-in) |
| M4 | Accounts & compliance | Sign in with Apple/Google/email, in-app + web deletion, privacy policy, Data safety, privacy labels, 13+ age gate |
| M5 | Hardening | Impeccable audit/polish, a11y, Sentry (PII off), Speed Insights |
| M6 | Competition + store | AI Reflection Form, copyright checklist, work log, interview prep; TestFlight / Play closed test |

---

_Original research (Revision 1) follows; §3–§6 are superseded by Revision 2 above._

> Verification note: 20 research agents ran in parallel. Several could not fetch JS-rendered pages (Apple HIG, m3.material.io) and fell back to background knowledge. Items marked **(verify)** must be re-checked against the live source before launch.

---

## 1. Skill status

| Skill | Status | Notes |
|---|---|---|
| Apple (`apple-design`) | ✅ Loaded | WWDC-derived motion, materials, typography, HIG principles. `swiftui-skills` / `write-swift` also installed. |
| Impeccable (`impeccable`) | ✅ Loaded | Design-quality skill. Its `context` script and `craft-floor.md` will be run right before UI work (deliberately not run during planning). |
| Watchdog | ❌ **Missing** | Not installed under `~/.claude/skills` or `~/.agents/skills`. Third-party "watchdog" skills exist (skills.sh, skillsdirectory) but several carry security flags (e.g. Snyk MEDIUM on athola install-watchdog); none are monitoring-for-web/mobile. **Proposed substitute:** Sentry (web + Expo) + Vercel Speed Insights/Observability + Better Stack uptime. |

---

## 2. Research summary by topic

### 2.1 Apple App Store rules
- **5.1.1(v)** — apps without significant account-based features must work without login; account creation ⇒ in-app account deletion required. [Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **4.8 Login Services** — only applies if a third-party/social login is used; then an equivalent privacy login (e.g. Sign in with Apple) is required. Not triggered by a no-login app. (same source)
- **4.2 / 4.2.2 Minimum Functionality** — must go "beyond a repackaged website"; not primarily "marketing materials… web clippings… collection of links". (same source) Real-world Capacitor rejections show push + location + share alone were *not* enough ([report](https://scribe.disroot.org/post/7369014)).
- **5.1.1(i)** — privacy policy URL required in App Store Connect *and* in-app, even when collecting nothing.
- **Privacy manifest** — `PrivacyInfo.xcprivacy` required; UserDefaults is a required-reason API (reason `CA92.1`). [Apple](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)
- **SDK minimum** — since 2026-04-28 uploads must use Xcode 26 / iOS 26 SDK. [Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/) (check for an Xcode 27 requirement in spring 2027 — **verify**)
- **Age ratings** now 4+/9+/13+/16+/18+; new questionnaire mandatory. [Apple](https://developer.apple.com/help/app-store-connect/reference/age-ratings)
- **EU DSA trader status** must be declared in App Store Connect. [Apple](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-eu-digital-services-act-compliance-information)
- **Accessibility Nutrition Labels** shown on iOS 26+; claim a feature only if all common tasks work with it. [Apple](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels)

### 2.2 Google Play rules
- **Account deletion** — required only if accounts can be created; needs in-app path **plus** web deletion link. [Play](https://support.google.com/googleplay/android-developer/answer/13327111)
- **Data safety form** — required for every app, even one collecting nothing; on-device-only data isn't "collected"; SDK data must be declared. [Play](https://support.google.com/googleplay/android-developer/answer/10787469)
- **Webview spam** — wrappers built to drive web traffic are spam. [Android Dev Blog](https://android-developers.googleblog.com/2020/10/developer-tips-and-guides-common-policy.html) (current text — **verify**)
- **Target API 36** (Android 16) required since 2026-08-31. [Play](https://support.google.com/googleplay/android-developer/answer/11926878) → edge-to-edge enforced (no opt-out), predictive back on by default, large-screen orientation/resize restrictions ignored ≥600dp. [Android](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
- **New personal accounts** — 12 testers × 14 days closed test before production. [Play](https://support.google.com/googleplay/android-developer/answer/14151465)
- **Developer verification** — enforced from 2026-09-30 in BR/ID/SG/TH, global 2027. [Android](https://developer.android.com/developer-verification)

### 2.3 Storage
- Web: IndexedDB is the right store; localStorage ≈5 MiB. **Safari ITP deletes script-writable storage after 7 days without interaction** (installed home-screen web apps exempt). [WebKit](https://webkit.org/tracking-prevention/), [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Expo: `expo-sqlite` (iOS/Android/web, KV store built in); SecureStore for secrets only. [Expo](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- Backups: Android Auto Backup on by default (25 MB) [Android](https://developer.android.com/identity/data/autobackup); iOS backs up Documents/Application Support to iCloud. Web data has no backup ⇒ ship export/import.

### 2.4 Server needs even without a database
- Browsers can't fetch arbitrary sites (CORS) ⇒ header/robots/sitemap/OG/redirect checks need a **locked-down serverless proxy** (block private IPs/SSRF, rate-limit). [Cloudflare example](https://developers.cloudflare.com/workers/examples/cors-header-proxy/) Native apps can fetch directly (no CORS).
- DNS can run client-side via DNS-over-HTTPS (CORS-enabled).
- Contact/quote form ⇒ serverless function + Resend (free 3k/mo) [Resend](https://resend.com/pricing) + Vercel BotID or Turnstile [Vercel](https://vercel.com/docs/botid). Inbox is the only data store. If the form is **in the app**, it counts as "collected" for Apple/Google labels. [Apple](https://developer.apple.com/app-store/app-privacy-details/)
- Scheduled uptime checks + push alerts genuinely require a backend.

### 2.5 Stack
- Expo SDK 58 / RN 0.88 current (2026-10-15); New Architecture mandatory; Expo Router native tabs stable. [Expo changelog](https://expo.dev/changelog/sdk-58)
- Recommendation: **Next.js (web, SEO-critical) + Expo (iOS/Android) in one monorepo** with shared TS logic. Capacitor = highest 4.2 risk; Flutter = weak SEO; fully native = 3× cost.
- If a backend is ever needed: Supabase (auth incl. Apple/Google, Postgres + RLS) [pricing](https://supabase.com/pricing). Avoid Instant Cloud (shutting down 2027) and Electric Cloud (closed to signups). [roundup](https://flaviocopes.com/shutdowns/)

### 2.6 Companion-app evidence
- Real demand for mobile webmaster tooling: third-party Cloudflare apps (Clouder, CF Dash), UptimeRobot app with widgets, Better Stack with Live Activities. [UptimeRobot](https://uptimerobot.com/mobile-app/), [Better Stack docs](https://betterstack.com/docs/uptime/ios-and-android-mobile-apps.md)
- Fully on-device: JSON/regex/color-contrast/Base64/JWT-decode/hash/UUID/timestamp tools, saved sites, notes, on-demand SSL/DNS/header checks.
- Native value: WidgetKit + Glance widgets, share extension/share target, App Intents/Shortcuts, Android Quick Settings tile. [Android tiles](https://developer.android.com/develop/ui/views/quicksettings-tiles)
- No evidence small dev agencies ship brochure apps; a brochure app would fail 4.2.2.

### 2.7 Design — logos
References (verify on each brand page before reuse): Vercel (single triangle, survives 16px), Linear (rounded-square container), Raycast (slash in squircle), Supabase (negative-space bolt), Resend (heavy monogram), Warp (parallelogram "W"), GitHub (silhouette on disc), VoidZero 2025 rebrand. Trend sources: [LogoLounge 2026](https://www.logolounge.com/trend/2026-logo-trend-report) (theme: marks that move/adapt — [Dieline](https://thedieline.com/logoloung-releases-its-2026-trend-report-and-everything-is-on-the-move/)), [Brand New](https://underconsideration.com/brandnew).
**Takeaways:** one primary shape; mono version + container version; design at 16px first; one ownable colour.

### 2.8 Design — app icons
- iOS 26: single Icon Composer `.icon`, 1024px, layered, default/dark/clear/tinted. [Apple](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer)
- Android: adaptive 108dp layers + monochrome layer (themed icons); Play icon 512px. [Android](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- Web: separate `any` and `maskable` icons (40% safe circle), 192/512 manifest icons. [web.dev](https://web.dev/articles/maskable-icon)

### 2.9 Design — loading animations
- NN/g limits 0.1s / 1s / 10s; skeletons for 2–10s page loads, spinner for short unknown waits, determinate bar >10s. [NN/g](https://www.nngroup.com/articles/response-times-3-important-limits/), [skeletons](https://www.nngroup.com/articles/skeleton-screens/)
- Agency intro loaders often gate LCP (≤2.5s target) — if used: ≤1s, once per session, real content rendered underneath, skipped for reduced motion. [web.dev LCP](https://web.dev/articles/optimize-lcp)
- View Transitions for page-to-page logo continuity [Chrome](https://developer.chrome.com/docs/web-platform/view-transitions); scroll-driven animations now Baseline (Firefox 159). [web.dev](https://web.dev/blog/web-platform-10-2026)
- Logo animation formats: inline SVG+CSS (lightest), dotLottie, Rive. [Rive](https://rive.app/docs/runtimes/web)
- iOS launch screen must be static, resemble first screen, no branding ad. [HIG](https://developer.apple.com/design/human-interface-guidelines/launching) Android 12+ SplashScreen: animated icon ≤1000ms. [Android](https://developer.android.com/develop/ui/views/launch/splash-screen) Expo splash config. [Expo](https://docs.expo.dev/versions/latest/sdk/splash-screen/)
- M3 Expressive `LoadingIndicator` (shape-morphing) for Android. [Android ref](https://developer.android.com/reference/kotlin/androidx/compose/material3/LoadingIndicator.composable)
- Reference sites: Stripe (no loader, fast paint), Locomotive (wordmark reveal), Active Theory (cautionary heavy preloader), Chrome view-transitions demos.

### 2.10 Design — platform & web patterns
- iOS 26 Liquid Glass: glass only for the controls/navigation layer, never content; use native tabs (`expo-router/native-tabs`, SDK 58) so the system supplies glass; respect Reduce Transparency. [Expo native tabs](https://docs.expo.dev/router/advanced/native-tabs/), [expo-glass-effect](https://docs.expo.dev/versions/latest/sdk/glass-effect/)
- Material 3 Expressive: spring motion schemes, shape morphing, dynamic color. [M3](https://m3.material.io/blog/building-with-m3-expressive)
- Web: editorial display face + mono for data; bento cells with real content (live tool, metric); dark-first with `light-dark()`. Anti-patterns: purple gradient hero, Inter-only centered "Build the future", three identical icon cards, fake logo walls, scroll-jacking.

### 2.11 Legal / accessibility
- WCAG 2.2 AA as the single target [W3C](https://www.w3.org/TR/WCAG22/); EAA in force since 2025-06-28 (microenterprise service exemption <10 staff & ≤€2M) [EUR-Lex](https://eur-lex.europa.eu/eli/dir/2019/882/oj); ADA web suits up 27% in 2025 [Seyfarth](https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/).
- Needed pages: privacy policy, terms, accessibility statement, (EU) imprint. Analytics cookies need opt-in in the EU (ePrivacy 5(3)) — prefer cookieless analytics.

### 2.12 Positioning (agency sites)
- Name the niche on the first screen; site is proof of quality; case studies = problem → measurable result; "starting from" pricing filters leads. [nanoglobals](https://nanoglobals.com/marketing-agency-websites/) (vendor sources — directional only)

---

## 3. Recommended framing & scope (pending your answers)

**Working assumption:** a software-development & webmaster *studio* brand whose website sells services, and whose apps are a genuinely useful **webmaster toolkit** carrying the same brand.

| Surface | Mode | Role |
|---|---|---|
| Website | Persuade (marketing) + Operate (`/tools`) | Services, work/case studies, process, contact/quote; plus browser-based tools that prove craft and drive SEO. |
| iOS app | Operate | Offline toolkit, saved sites with on-demand health checks, share extension, widgets, App Intents. Links to services. |
| Android app | Operate | Same features; Quick Settings tile, Glance widget, share target, M3 Expressive. |

Audience: small businesses needing a site built/maintained (website), and developers/webmasters (tools + apps). **Not invented — confirm.**

## 4. Login decision — **No login for v1**
- Apple 5.1.1(v): an app without significant account-based features must not force login → no-login is the compliant default.
- Apple 4.8: not triggered (no third-party login).
- Apple 5.1.1(v) deletion / Google account-deletion policy: not triggered (no account creation) — **as long as nothing in the app offers sign-up.**
- Still required: privacy policy (Apple 5.1.1(i); Play User Data), App Privacy labels, privacy manifest, Play Data safety form.
- **Trigger to revisit:** if you want server-run uptime monitoring with push alerts, cross-device sync, or a client portal → accounts become justified, and then Sign in with Apple (if Google login offered), in-app + web account deletion, and Apple token revocation all become mandatory.

## 5. Storage approach — **local-first, no database; one stateless serverless layer**
- Mobile: `expo-sqlite` (saved sites, notes, history); SecureStore for any API tokens the user adds.
- Web: IndexedDB (via expo-sqlite web or idb); request `navigator.storage.persist()`; prominent export/import (JSON, versioned, UUID + `updatedAt` merge) because of Safari ITP.
- Stateless Vercel Functions (no DB): (1) SSRF-hardened URL-inspection proxy for the web tools, (2) contact form → Resend, protected by BotID + honeypot. Native apps fetch URLs directly.
- Privacy labels: "Data Not Collected" is achievable if the app has no in-app contact form and no crash SDK — otherwise declare Contact Info / Diagnostics. Decision point: Sentry in the apps (declare Crash/Performance data, PII scrubbed) vs. none.

## 6. Build plan & milestones (after approval + access)

**Repo:** Turborepo/pnpm monorepo — `apps/web` (Next.js, Vercel), `apps/mobile` (Expo SDK 58, EAS), `packages/core` (pure-TS tool logic, shared & unit-tested), `packages/tokens` (design tokens → CSS vars + RN theme), `packages/brand` (logo SVG sources).

| # | Milestone | Web | iOS | Android |
|---|---|---|---|---|
| M0 | Access & foundations | Repo, CI, Vercel project, domain | Apple Developer acct (org ⇒ D-U-N-S, start early), bundle ID | Play Console acct; if personal & post-2023, recruit 12 testers |
| M1 | Brand & design system | Impeccable `init` → PRODUCT.md / DESIGN.md; logo (16px-first, mono + container); tokens; motion spec (springs, reduced motion) | Icon Composer `.icon` | Adaptive + monochrome icon |
| M2 | Core tools (`packages/core`) | JSON, regex, contrast (WCAG+APCA), Base64/URL, JWT decode, hash, UUID, timestamp, meta/OG parser, robots/sitemap validator — unit tested | shared | shared |
| M3 | Website | Home, Services, Work, Process, About, Contact (Resend + BotID), `/tools/*`, legal pages; View Transitions; ≤1s once-per-session logo reveal; CWV budget LCP ≤2.5s | — | — |
| M4 | Mobile apps | — | Native tabs (Liquid Glass), tools, saved sites (SQLite), on-demand SSL/DNS/headers, share extension, WidgetKit widget, App Intents, static launch screen | Edge-to-edge, predictive back, M3 Expressive, Glance widget, QS tile, share target, Android 12 splash |
| M5 | Hardening & monitoring | Impeccable `audit`/`polish`; axe + Lighthouse; Sentry + Speed Insights; Better Stack uptime | VoiceOver, Dynamic Type, Reduce Motion/Transparency; privacy manifest; Accessibility labels | TalkBack, large-screen tier 2 |
| M6 | Store submission | Launch | Privacy labels, age rating, DSA trader, TestFlight → review | Data safety, closed test (14 days if required), target API 36 → production |
| v2 (optional) | Monitoring tier | Supabase + scheduled checks + push | Live Activities, push | FCM alerts | ⇒ adds login + account deletion |

**Biggest schedule risks:** D-U-N-S / DSA verification delays (Apple), 14-day Play closed test, 4.2 review if app feels like a brochure.
