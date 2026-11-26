"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { modules } from "@neuronaut/core";
import { Mark } from "@/components/brand";
import "../app/home-end.css";

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Desktop (>=768px) shows every column open and the headings as plain text. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
}

type Col = { id: string; title: string; links: { href: string; label: string }[] };

const COLUMNS: Col[] = [
  {
    id: "ft-learn",
    title: "Learn",
    links: modules.map((m) => ({ href: `/learn/${m.id}`, label: m.title })),
  },
  {
    id: "ft-practice",
    title: "Practice",
    links: [
      { href: "/review", label: "Review" },
      { href: "/ask", label: "Ask Pip" },
      { href: "/dashboard", label: "Progress" },
    ],
  },
  {
    id: "ft-about",
    title: "About",
    links: [
      { href: "/about", label: "About" },
      { href: "/how-we-built-it", label: "How we built it" },
      { href: "/design-decisions", label: "Design decisions" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

function FooterColumn({ col, open, onToggle }: { col: Col; open: boolean; onToggle: () => void }) {
  const isDesktop = useIsDesktop();
  return (
    <div className="ft-col" data-open={open}>
      <h2 className="ft-h">
        <button
          type="button"
          className="ft-toggle"
          id={`${col.id}-btn`}
          aria-expanded={isDesktop ? undefined : open}
          aria-controls={`${col.id}-list`}
          disabled={isDesktop}
          onClick={onToggle}
        >
          {col.title}
          <ChevronDown className="ft-chev" size={18} aria-hidden="true" />
        </button>
      </h2>
      <ul className="ft-list" id={`${col.id}-list`}>
        {col.links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="ft-link">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const [open, setOpen] = useState<boolean[]>(() => COLUMNS.map(() => false));
  const toggle = (i: number) => setOpen((cur) => cur.map((v, j) => (j === i ? !v : v)));

  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-cols">
          {COLUMNS.map((col, i) => (
            <FooterColumn key={col.id} col={col} open={open[i]} onToggle={() => toggle(i)} />
          ))}
        </div>

        <div className="ft-bottom">
          <div className="ft-brand">
            <Mark size={18} className="ft-mark" />
            <span className="ft-copy">© 2026 Neuronaut</span>
            <span className="ft-tag">Built to help students use AI honestly.</span>
          </div>
          <p className="ft-docs">
            <Link className="ft-link" href="/sources">
              Sources
            </Link>
            <span aria-hidden="true"> · </span>
            <Link className="ft-link" href="/copyright-checklist">
              Copyright checklist
            </Link>
            <span aria-hidden="true"> · </span>
            <Link className="ft-link" href="/work-log">
              Work log
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
