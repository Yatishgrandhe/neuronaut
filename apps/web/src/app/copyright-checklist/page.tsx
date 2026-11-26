import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { ASSETS, TEAM_GAP } from "@/lib/records";

export const metadata: Metadata = {
  title: "Copyright checklist",
  description: "Every image, font, library and original asset in Neuronaut, with its creator, licence and how we used it.",
};

const CHECKS = [
  "All lesson text and practice questions were written for Neuronaut; outside frameworks are linked, not copied.",
  "Every outside image, font and code library is listed below with its licence.",
  "Photographers and NASA are credited where their images appear and on the About page.",
  "No music, sound or video from other creators is used.",
  "The only live AI text, Ask Pip\u2019s answers, is labelled on screen as AI-written.",
];

export default function CopyrightChecklistPage() {
  return (
    <article className="wrap doc">
      <header className="doc-head">
        <h1>Copyright checklist</h1>
        <p className="lede">
          Everything on Neuronaut that we didn&rsquo;t make ourselves, and everything we did, with who made it and the licence
          that lets us use it.
        </p>
        <p className="doc-actions">
          <a href="/docs/student-copyright-checklist.pdf" download>
            <Download size={18} aria-hidden /> Download as PDF
          </a>
          <Link href="/sources">All sources</Link>
        </p>
      </header>

      <h2>Checks</h2>
      <ul className="doc-checks">
        {CHECKS.map((c) => (
          <li key={c}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{c}</span>
          </li>
        ))}
      </ul>

      <h2>Assets</h2>
      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Creator</th>
              <th scope="col">Licence</th>
              <th scope="col">How we used it</th>
              <th scope="col">Permission</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.item}>
                <td data-label="Item">
                  <span>
                    {a.source ? <a href={a.source}>{a.item}</a> : a.item}
                    {a.kind !== "Original work" && !a.source ? <span className="doc-gap"> (source link: {TEAM_GAP.toLowerCase()})</span> : null}
                  </span>
                </td>
                <td data-label="Creator">{a.creator}</td>
                <td data-label="Licence">{a.licenseUrl ? <a href={a.licenseUrl}>{a.license}</a> : a.license}</td>
                <td data-label="How used">{a.howUsed}</td>
                <td data-label="Permission">{a.permission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
