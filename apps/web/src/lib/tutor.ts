import "server-only";

import { ChatAnthropic } from "@langchain/anthropic";
import { Document } from "@langchain/core/documents";
import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BaseRetriever } from "@langchain/core/retrievers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getLesson, searchLessons } from "@neuronaut/core";

/** Default model per Anthropic's current guidance. */
export const TUTOR_MODEL = "claude-opus-5-5";

export function tutorConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/* ------------------------------------------------------------------ */
/* Knowledge base: our own lesson content as LangChain Documents.      */
/* ------------------------------------------------------------------ */

/** Ask Pip's retriever: the tested BM25 lesson search from @neuronaut/core, as LangChain Documents. */
class CurriculumRetriever extends BaseRetriever {
  lc_namespace = ["neuronaut", "retrievers"];
  constructor(private k = 4, private boostLesson?: string) {
    super();
  }
  async _getRelevantDocuments(query: string): Promise<Document[]> {
    return searchLessons(query, this.k, this.boostLesson).map(
      (p) => new Document({ pageContent: p.text, metadata: { lessonId: p.lessonId, lesson: p.lesson, module: p.module, kind: p.kind } }),
    );
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
