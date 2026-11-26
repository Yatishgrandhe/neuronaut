import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { allLessons, getLesson, getModule } from "@neuronaut/core";
import { LessonPlayer } from "@/components/lesson-player";

export function generateStaticParams() {
  return allLessons.map((l) => ({ lessonId: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[lessonId]">): Promise<Metadata> {
  const l = getLesson((await params).lessonId);
  return l ? { title: l.title, description: l.summary } : {};
}

export default function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  // URL data is read inside Suspense so the shared app shell never depends on one lesson's URL.
  return (
    <Suspense>
      <LessonBody params={params} />
    </Suspense>
  );
}

async function LessonBody({ params }: { params: PageProps<"/lesson/[lessonId]">["params"] }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  const mod = getModule(lesson.moduleId);
  return (
    <>
      <LessonPlayer lessonId={lessonId} />
      {mod ? (
        <aside className="wrap lesson-sources" aria-label="Sources for this lesson">
          <p>
            <strong>Sources.</strong> Written by the Neuronaut team and checked against{" "}
            {mod.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 ? (i === mod.sources.length - 1 ? " and " : ", ") : ""}
                <a href={s.url}>{s.label}</a>
              </span>
            ))}
            . <Link href="/sources">All sources</Link>
          </p>
        </aside>
      ) : null}
    </>
  );
}
