import "server-only";

import { ChatAnthropic } from "@langchain/anthropic";
import { Document } from "@langchain/core/documents";
import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BaseRetriever } from "@langchain/core/retrievers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
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

export const PracticeSet = z.object({
  questions: z
    .array(
      z.object({
        prompt: z.string().describe("The question, one or two sentences, for a high school student."),
        options: z.array(z.string()).describe("Exactly 4 answer options, each under 90 characters."),
        answer: z.number().int().describe("Index (0-3) of the single correct option."),
        explain: z.string().describe("One or two sentences explaining why the answer is right."),
      }),
    )
    .describe("Exactly 3 new multiple-choice questions."),
});
export type PracticeSet = z.infer<typeof PracticeSet>;

const practicePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You write practice questions for Neuronaut, an AI-literacy course for high school students.
Write exactly 3 NEW multiple-choice questions (4 options each, one correct) that check understanding of the lesson below.
- Test understanding and application, not trivia or wording recall. Use realistic school scenarios.
- Don't repeat the existing questions. Keep facts accurate and avoid made-up statistics or names of real studies.
- Wrong options should be plausible but clearly wrong once you understand the lesson.

Lesson: {title}
Summary: {summary}

Ideas taught:
{ideas}

Existing questions (don't repeat):
{existing}`,
  ],
  ["human", "Write the 3 questions."],
]);

export async function generatePractice(lessonId: string): Promise<PracticeSet> {
  const lesson = getLesson(lessonId);
  if (!lesson) throw new Error("Unknown lesson");
  const structured = model({ maxTokens: 4000, effort: "medium" }).withStructuredOutput(PracticeSet, {
    name: "practice_set",
    method: "jsonSchema",
  });
  const result = await practicePrompt.pipe(structured).invoke({
    title: lesson.title,
    summary: lesson.summary,
    ideas: lesson.cards.map((c) => `- ${c.title}: ${c.body}`).join("\n"),
    existing: lesson.exercises.map((e) => `- ${e.kind === "truefalse" ? e.statement : e.prompt}`).join("\n"),
  });
  // Validate shape the schema can't express (exact counts, answer in range).
  const questions = result.questions
    .filter((q) => q.options.length === 4 && q.answer >= 0 && q.answer < 4)
    .slice(0, 3);
  if (!questions.length) throw new Error("No valid questions generated");
  return { questions };
}
