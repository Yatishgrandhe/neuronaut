import Link from "next/link";
import { allLessons } from "@neuronaut/core";
import { Pip } from "../Pip";
import "../../app/home-end.css";

export function FinalCta() {
  return (
    <section className="cta-wrap" aria-labelledby="cta-h">
      <div className="cta">
        <div className="cta-copy">
          <h2 id="cta-h" className="t-h2 cta-h">
            Start lesson 1. It takes five minutes.
          </h2>
          <div className="cta-actions">
            <Link className="btn btn-inverse btn-lg" href={`/lesson/${allLessons[0].id}`}>
              Start lesson 1
            </Link>
            <Link className="btn-secondary on-dark" href="/learn">
              Browse lessons
            </Link>
          </div>
        </div>

        <div className="cta-visual">
          <div className="cta-pip">
            <Pip pose="cheer" size={140} />
          </div>
        </div>
      </div>
    </section>
  );
}
