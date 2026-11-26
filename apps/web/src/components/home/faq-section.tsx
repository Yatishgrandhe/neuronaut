import Link from "next/link";
import { allLessons } from "@neuronaut/core";
import { Pip } from "../Pip";
import { Annotation } from "../ui/Annotation";
import "../../app/home-end.css";

/* Straight answers, all visible: the things people want settled before lesson 1. */
const ITEMS: { q: string; a: string }[] = [
  {
    q: "It's free. All of it.",
    a: "Every lesson, review and badge. No ads, nothing to buy.",
  },
  {
    q: "No account, no sign-up.",
    a: "Progress saves in your browser. Download a backup on the Progress page and import it on another device.",
  },
  {
    q: "Pip won't write your essay.",
    a: "Using AI to brainstorm or get feedback can be fine when your class allows it and you say how you used it. Handing in AI-written work as your own isn't. Module 3 covers exactly where the line is.",
  },
  {
    q: "About an hour, start to finish.",
    a: `${allLessons.length} lessons of about five minutes, plus reviews. Spread it over as many days as you like.`,
  },
  {
    q: "Made by students, for grades 9–12.",
    a: "A student team built Neuronaut for high schoolers, and for anyone who wants an honest intro to AI.",
  },
  {
    q: "Works on a school Chromebook.",
    a: "Any modern browser on phones, tablets, Chromebooks and computers.",
  },
];

export function FaqSection() {
  return (
    <section className="fq" id="faq" aria-labelledby="fq-h">
      <div className="wrap fq-grid">
        <div className="fq-side">
          <h2 id="fq-h" className="t-h2">
            Before you start.
          </h2>
          <div className="fq-pip">
            <Pip pose="think" size={96} />
            <Annotation type="question" className="fq-q" color="var(--accent)" delay={0.1} />
          </div>
          <p className="fq-still">
            Something else on your mind?{" "}
            <Link className="btn-secondary" href="/ask">
              Ask Pip
            </Link>
          </p>
        </div>

        <ul className="fq-list" role="list">
          {ITEMS.map((item) => (
            <li key={item.q} className="fq-item">
              <h3 className="fq-h">{item.q}</h3>
              <p className="fq-a">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
