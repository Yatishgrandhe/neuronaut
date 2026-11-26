import "server-only";

import { ChatAnthropic } from "@langchain/anthropic";
import { Document } from "@langchain/core/documents";
import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BaseRetriever } from "@langchain/core/retrievers";
import { RunnableSequence } from "@langchain/core/runnables";
import { allLessons, getLesson, modules } from "@neuronaut/core";

/** Default model per Anthropic's current guidance. */
export const TUTOR_MODEL = "claude-opus-5-5";

export function tutorConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/* ------------------------------------------------------------------ */
/* Knowledge base: our own lesson content as LangChain Documents.      */
/* ------------------------------------------------------------------ */

const docs: Document[] = allLessons.flatMap((lesson) => {
  const mod = modules.find((m) => m.id === lesson.moduleId)!;
  const meta = { lessonId: lesson.id, lesson: lesson.title, module: mod.title };
  return [
    ...lesson.cards.map(
      (c) => new Document({ pageContent: `${c.title}. ${c.body}`, metadata: { ...meta, kind: "idea" } }),
    ),
    ...lesson.exercises.map(
      (e) =>
        new Document({
          pageContent: `${e.kind === "truefalse" ? e.statement : e.prompt} ${e.explain}`,
          metadata: { ...meta, kind: "practice" },
        }),
    ),
  ];
});

const STOP = new Set("a an and are as at be but by can do for from how i in is it its me my of on or so that the this to was what when which who why will with you your".split(" "));
const tokenize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

const docTokens = docs.map((d) => tokenize(d.pageContent));
const df = new Map<string, number>();
for (const toks of docTokens) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
const avgLen = docTokens.reduce((n, t) => n + t.length, 0) / docTokens.length;

/** BM25 retriever over the curriculum: no embeddings service, fully local. */
class CurriculumRetriever extends BaseRetriever {
  lc_namespace = ["neuronaut", "retrievers"];
  constructor(private k = 4, private boostLesson?: string) {
    super();
  }
  async _getRelevantDocuments(query: string): Promise<Document[]> {
    const q = tokenize(query);
    const N = docs.length;
    const scored = docs.map((d, i) => {
      const toks = docTokens[i];
      let score = 0;
      for (const term of q) {
        const tf = toks.filter((t) => t === term).length;
        if (!tf) continue;
        const idf = Math.log(1 + (N - (df.get(term) ?? 0) + 0.5) / ((df.get(term) ?? 0) + 0.5));
        score += (idf * tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (toks.length / avgLen)));
      }
      if (this.boostLesson && d.metadata.lessonId === this.boostLesson) score += 1.5;
      return { d, score };
    });
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.k)
      .map((s) => s.d);
  }
}

const formatDocs = (ds: Document[]) =>
  ds.length
    ? ds.map((d, i) => `[${i + 1}] (${d.metadata.module} › ${d.metadata.lesson})\n${d.pageContent}`).join("\n\n")
    : "(No matching lesson content.)";

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

function model(opts: { maxTokens: number; effort: "low" | "medium" }) {
  return new ChatAnthropic({
    model: TUTOR_MODEL,
    maxTokens: opts.maxTokens,
    outputConfig: { effort: opts.effort },
    // If a safety classifier declines, the API re-runs the request on a suitable model.
    betas: ["server-side-fallback-2026-07-01"],
    invocationKwargs: { fallbacks: "default" },
    maxRetries: 2,
  });
}

/* ------------------------------------------------------------------ */
/* Ask Pip: retrieval-augmented, streaming tutor chain                 */
/* ------------------------------------------------------------------ */

const TUTOR_SYSTEM = `You are Pip, the friendly guide inside Neuronaut, a free site that teaches high school students (ages 13-18) how AI works, how to use it well, and how to use it honestly at school.

How you help:
- Explain in plain, warm language for a 9th-12th grader. Keep answers short: usually 2-5 sentences, or a few bullets.
- Ground answers in the lesson excerpts below when they're relevant, and name the lesson (e.g. "That's from 'The verification lab'"). If the excerpts don't cover it, answer from general knowledge and say so.
- Be a tutor, not a ghostwriter. If a student asks you to write graded work (essays, homework answers, test answers), don't. Offer a hint, a question that moves them forward, or feedback on their own draft instead, and remind them to check their class's AI policy.
- Admit uncertainty. Never invent statistics, quotes, or citations.
- If a student shares personal information (full name, address, phone, passwords), gently tell them not to share it here.
- If a student mentions being in danger, self-harm, or abuse, respond with care and encourage them to talk to a trusted adult; in the US they can call or text 988.
- Stay on topics related to learning, school, and AI. Politely steer back if asked about unrelated things.

Lesson excerpts:
{context}`;

const tutorPrompt = ChatPromptTemplate.fromMessages([
  ["system", TUTOR_SYSTEM],
  new MessagesPlaceholder("history"),
  ["human", "{question}"],
]);

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** Retrieves matching lesson text first, so the caller can show which lessons the answer drew on. */
export async function tutorStream(input: { question: string; history: ChatTurn[]; lessonId?: string }) {
  const retriever = new CurriculumRetriever(4, input.lessonId && getLesson(input.lessonId) ? input.lessonId : undefined);
  const history: BaseMessage[] = input.history.map((t) => (t.role === "user" ? new HumanMessage(t.content) : new AIMessage(t.content)));
  const found = await retriever.invoke(input.question);
  const lessons = [...new Set(found.map((d) => d.metadata.lessonId as string))]
    .map((id) => getLesson(id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .map((l) => ({ id: l.id, title: l.title }));

  const chain = RunnableSequence.from([tutorPrompt, model({ maxTokens: 1500, effort: "low" }), new StringOutputParser()]);
  const stream = await chain.stream({ question: input.question, history, context: formatDocs(found) });
  return { stream, lessons };
}

/* ------------------------------------------------------------------ */
/* Practice generator: structured output (native JSON schema mode)     */
/* ------------------------------------------------------------------ */
