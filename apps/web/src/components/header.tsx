"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { allLessons, dayKey, levelForXp, nextLesson, visibleStreak } from "@neuronaut/core";
import { Wordmark } from "./brand";
import { useProgress } from "./progress";

const NAV = [
  { href: "/learn", label: "Learn" },
  { href: "/review", label: "Review" },
  { href: "/ask", label: "Ask Pip" },
  { href: "/dashboard", label: "Progress" },
  { href: "/about", label: "About" },
];

function StatPills({ className = "" }: { className?: string }) {
  const { state, ready } = useProgress();
  const streak = ready ? visibleStreak(state, dayKey()) : 0;
  // A first-time visitor has no streak or XP: "0 0" reads as broken, so show nothing until there's progress.
  if (!ready || (streak === 0 && state.xp === 0)) return null;
  return (
    <Link
      href="/dashboard"
      className={`stat-chips ${className}`}
      aria-label={ready ? `${streak} day streak, ${state.xp} XP, level ${levelForXp(state.xp)}` : "Loading your progress"}
    >
      <span className={`chip chip-streak${ready ? "" : " skel"}`} data-on={streak > 0}>
        <Flame strokeWidth={2.4} aria-hidden /> <span className="num">{streak}</span>
      </span>
      <span className={`chip chip-xp${ready ? "" : " skel"}`} data-xp-target>
        <Zap strokeWidth={2.4} aria-hidden /> <span className="num">{state.xp}</span>
      </span>
    </Link>
  );
}

/** 52px frosted bar (48px on phones). Hairline after 8px of scroll. */
export function Header() {
  const path = usePathname();
  const { state, ready } = useProgress();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [heroCtaGone, setHeroCtaGone] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [path]);

  // "Start free" appears once the hero CTA has scrolled out of view (home only).
  useEffect(() => {
    const cta = document.getElementById("hero-cta");
    if (!cta) return;
    const io = new IntersectionObserver(([e]) => setHeroCtaGone(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(cta);
    return () => io.disconnect();
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.classList.add("menu-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (path.startsWith("/lesson/")) return null; // focused lesson mode
  const next = (ready ? nextLesson(state) : undefined) ?? allLessons[0];
  const showStart = path !== "/" || heroCtaGone;

  return (
    <>
      <header className="site-header" data-scrolled={scrolled || open}>
        <div className="wrap header-row">
          <Link href="/" className="brand-link" id="nav-logo" aria-label="Neuronaut home" onClick={() => setOpen(false)}>
            <Wordmark size={24} />
          </Link>
          <nav aria-label="Main" className="main-nav">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={path.startsWith(href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-right">
            <StatPills />
            <Link
              href={`/lesson/${next.id}`}
              className="btn btn-primary btn-sm nav-start"
              data-show={showStart}
              tabIndex={showStart ? undefined : -1}
              aria-hidden={showStart ? undefined : true}
            >
              {next.id === allLessons[0].id ? "Start lesson 1" : "Continue"}
            </Link>
            <button
              type="button"
              className="menu-btn"
              data-open={open}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="menu-sheet"
              onClick={() => setOpen(!open)}
            >
              <span aria-hidden />
              <span aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-sheet"
            className="menu-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav aria-label="Menu" className="wrap menu-links">
              {NAV.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.04 + i * 0.04 }}
                >
                  <Link href={href} aria-current={path.startsWith(href) ? "page" : undefined} onClick={() => setOpen(false)}>
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="wrap menu-foot">
              <StatPills />
              <Link className="btn btn-primary btn-lg btn-block" href={`/lesson/${next.id}`} onClick={() => setOpen(false)}>
                Start lesson {allLessons.indexOf(next) + 1}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
