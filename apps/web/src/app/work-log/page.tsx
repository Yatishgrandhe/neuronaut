import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { TEAM_GAP, WORK_LOG } from "@/lib/records";

export const metadata: Metadata = {
  title: "Work log",
  description: "A dated record of how Neuronaut was researched, designed, built and tested, including where AI helped.",
};

const fmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function WorkLogPage() {
  const hasWho = WORK_LOG.some((e) => e.who);
  const hasTime = WORK_LOG.some((e) => e.minutes != null);
  return (
    <article className="wrap doc">
      <header className="doc-head">
        <h1>Work log</h1>
        <p className="lede">
          What we did, when, and where AI helped. Newest entries are at the bottom. How the pieces fit together is on{" "}
          <Link href="/how-we-built-it">How we built it</Link>.
        </p>
        {!hasWho || !hasTime ? (
          <p className="doc-note">
            <strong>Before submission:</strong> the team adds who did each task and how long it took, and confirms AI use where a row shows a dash. The columns appear
            here automatically once they are filled in.
          </p>
        ) : null}
        <p className="doc-actions">
          <a href="/docs/student-work-log.pdf" download>
            <Download size={18} aria-hidden /> Download as PDF
          </a>
        </p>
      </header>

      <div className="doc-table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Task</th>
              <th scope="col">What happened</th>
              {hasWho ? <th scope="col">Who</th> : null}
              {hasTime ? <th scope="col">Time</th> : null}
              <th scope="col">AI use</th>
            </tr>
          </thead>
          <tbody>
            {WORK_LOG.map((e, i) => (
              <tr key={i}>
                <td data-label="Date">
                  <time dateTime={e.date}>{fmt(e.date)}</time>
                </td>
                <td data-label="Task">{e.task}</td>
                <td data-label="What">{e.detail}</td>
                {hasWho ? <td data-label="Who">{e.who ?? <span className="doc-gap">{TEAM_GAP}</span>}</td> : null}
                {hasTime ? <td data-label="Time">{e.minutes != null ? `${e.minutes} min` : <span className="doc-gap">{TEAM_GAP}</span>}</td> : null}
                <td data-label="AI use">{e.ai ?? <span aria-label="Not recorded yet">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
