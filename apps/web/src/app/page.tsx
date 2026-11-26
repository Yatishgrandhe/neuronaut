import Link from "next/link";
import { preload } from "react-dom";
import { allLessons } from "@neuronaut/core";
import { HeroEarth } from "@/components/hero/hero-earth";
import { Pip } from "@/components/Pip";
import { HeroQuiz } from "@/components/hero-quiz";
import { EssayAnswer } from "@/components/home/essay-answer";
import { CourseList } from "@/components/home/course-list";
import { LessonStory } from "@/components/home/lesson-story";
import { HomeAsk } from "@/components/home/home-ask";
import { HomeQuestions } from "@/components/home/home-questions";
import "./home-hero.css";
import "./home-v2.css";

// The home page is fully static; opt it out of instant-navigation validation (dev-only check).
export const instant = false;

const first = allLessons[0];
const lengths = allLessons.map((l) => l.minutes);
const minMin = Math.min(...lengths);
const maxMin = Math.max(...lengths);
const lessonLength = minMin === maxMin ? `${minMin}-minute` : `${minMin}–${maxMin}-minute`;

export default function Home() {
  // The planet still is the LCP element: ask for it with the HTML, before CSS and scripts.
  preload("/hero/word-planet-900.webp", { as: "image", type: "image/webp", fetchPriority: "high", media: "(max-width: 767px)" });
  preload("/hero/word-planet-1700.webp", {
    as: "image",
    type: "image/webp",
    fetchPriority: "high",
    media: "(min-width: 768px)",
    imageSrcSet: "/hero/word-planet-1300.webp 1300w, /hero/word-planet-1700.webp 1700w",
    imageSizes: "1700px",
  });
  return (
    <>
      {/* 1. Hero (offset): night sky from the ISS, our own word planet rising, Pip standing on it. */}
      <section className="hero" id="hero" aria-labelledby="hero-h">
        <div className="hero-sky" aria-hidden />
        <div className="wrap hero-top">
          <h1 id="hero-h" className="hero-h">
            Short lessons on how AI works, and how to use it <em>honestly</em>.
          </h1>
          <p className="hero-sub">
            For high schoolers. Use AI well, and stay honest about it: how chatbots work, how to prompt them, and how to use
            them for school without cheating.
          </p>
          <div className="hero-actions">
            <Link id="hero-cta" href={`/lesson/${first.id}`} className="hero-start">
              Start lesson 1
            </Link>
            <Link href="/ask" className="hero-ask">
              or ask Pip a question
            </Link>
          </div>
          <p className="hero-facts">Free · no account · {lessonLength} lessons</p>
        </div>
        <div className="hero-lower">
          <HeroEarth />
          <span className="hero-pip" aria-hidden>
            <Pip pose="wave" size={64} />
          </span>
          <div className="wrap hero-proof">
            <EssayAnswer />
            <HeroQuiz />
          </div>
          <p className="hero-credit">
            Sky: the Milky Way photographed from the International Space Station (NASA). The planet: words from Neuronaut&rsquo;s
            lessons, the way an AI reads them, as tokens. <Link href="/how-we-built-it">How we made it</Link>
          </p>
        </div>
      </section>

      {/* 2. Your course (ruled list with real progress) */}
      <CourseList />

      {/* 3. One lesson, step by step (sticky story on wide screens) */}
      <LessonStory />

      {/* 4. Ask Pip (live) */}
      <HomeAsk />

      {/* 5. Questions people actually ask, ending on the closing action */}
      <HomeQuestions firstLessonId={first.id} />
    </>
  );
}
