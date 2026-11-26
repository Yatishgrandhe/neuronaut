import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { getModule, lessonPhoto, modulePhoto, modules } from "@neuronaut/core";
import { Photo } from "@/components/photo";
import { LessonStatus } from "@/components/lesson-status";

export function generateStaticParams() {
  return modules.map((m) => ({ moduleId: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[moduleId]">): Promise<Metadata> {
  const m = getModule((await params).moduleId);
  return m ? { title: m.title, description: m.description } : {};
}

export default async function ModulePage({ params }: PageProps<"/learn/[moduleId]">) {
  const { moduleId } = await params;
  const m = getModule(moduleId);
  if (!m) notFound();
  const index = modules.indexOf(m);

  return (
    <article className="module-page" data-color={m.color}>
      <header className="module-hero">
        <div className="wrap module-hero-inner">
          <div className="module-hero-copy">
            <Link href="/learn" className="back-link">
              <ArrowLeft size={18} aria-hidden /> Learning path
            </Link>
            <p className="module-step num">Module {index + 1}</p>
            <h1>{m.title}</h1>
            <p className="lede">{m.description}</p>
          </div>
          <figure className="module-hero-photo">
            <Photo name={modulePhoto[m.id]} width={800} height={600} priority sizes="(max-width: 900px) 100vw, 50vw" />
          </figure>
        </div>
      </header>

      <div className="wrap module-body">
        <ol className="lesson-list">
          {m.lessons.map((l, i) => (
            <li key={l.id} className="lesson-row">
              <Photo name={lessonPhoto[l.id]} width={240} height={180} sizes="160px" className="lesson-thumb" />
              <div className="lesson-row-copy">
                <ul className="lesson-meta num">
                  <li>Lesson {i + 1}</li>
                  <li>
                    <Clock size={14} aria-hidden /> {l.minutes} min
                  </li>
                  <li>{l.exercises.length} questions</li>
                </ul>
                <h2>{l.title}</h2>
                <p>{l.summary}</p>
              </div>
              <LessonStatus lessonId={l.id} />
            </li>
          ))}
        </ol>

        <aside className="sources" aria-labelledby="src-h">
          <h2 id="src-h">Where this content comes from</h2>
          <p>Lessons are written by the Neuronaut team and aligned with these frameworks and guides:</p>
          <ul>
            {m.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url}>
                  {s.label} <ExternalLink size={14} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </article>
  );
}
