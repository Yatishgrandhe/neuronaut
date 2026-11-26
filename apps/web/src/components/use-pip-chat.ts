"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface PipTurn {
  role: "user" | "assistant";
  content: string;
  /** Lessons whose text grounded this answer (assistant turns only). */
  lessons?: { id: string; title: string }[];
  /** True once the answer has finished streaming (or was stopped). */
  done?: boolean;
}

export type PipStatus = "idle" | "streaming" | "error";
export interface PipError {
  message: string;
  /** "config" = no API key on the server; "rate" = too many questions; "other" = anything else. */
  kind: "config" | "rate" | "other";
}

/** Shown, always visible, under every Ask Pip input. */
export const PIP_NOTICE = "Pip sends your question to Anthropic to answer it. Skip personal details. For ages 13+.";

const CONSENT_KEY = "neuronaut.ai-consent";
/** The conversation, kept for this tab only, so "Continue in Ask Pip" carries it to /ask. */
const CHAT_KEY = "neuronaut.pip-chat";

const consentListeners = new Set<() => void>();
function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === "yes";
  } catch {
    return false;
  }
}

export function usePipConsent() {
  const consented = useSyncExternalStore(
    (l) => (consentListeners.add(l), () => consentListeners.delete(l)),
    readConsent,
    () => false,
  );
  const accept = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_KEY, "yes");
    } catch {
      /* storage blocked: consent lasts for this page only */
    }
    consentListeners.forEach((l) => l());
  }, []);
  return { consented, accept };
}

function loadChat(): PipTurn[] {
  try {
    const raw = sessionStorage.getItem(CHAT_KEY);
    const turns = raw ? (JSON.parse(raw) as PipTurn[]) : [];
    return Array.isArray(turns) ? turns.filter((t) => t.content).map((t) => ({ ...t, done: true })) : [];
  } catch {
    return [];
  }
}

/** One Ask Pip conversation: streaming, stop, retry, and the lessons each answer drew on. */
export function usePipChat({ lessonId }: { lessonId?: string } = {}) {
  const [turns, setTurns] = useState<PipTurn[]>([]);
  const [status, setStatus] = useState<PipStatus>("idle");
  const [error, setError] = useState<PipError | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const turnsRef = useRef(turns);
  turnsRef.current = turns;

  // Pick up a conversation started elsewhere in this tab (home page → /ask).
  // Deferred a frame so the server HTML (always empty) and the first client render agree.
  useEffect(() => {
    const saved = loadChat();
    if (!saved.length) return;
    const id = requestAnimationFrame(() => setTurns((t) => (t.length ? t : saved)));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (status === "streaming") return;
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(turns.slice(-12)));
    } catch {
      /* ignore */
    }
  }, [turns, status]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || abort.current) return;
      setError(null);
      setFailed(null);
      const prior = turnsRef.current.filter((t) => t.content);
      const history = prior.slice(-10).map(({ role, content }) => ({ role, content }));
      setTurns([...prior, { role: "user", content: question }, { role: "assistant", content: "" }]);
      setStatus("streaming");
      const ctrl = new AbortController();
      abort.current = ctrl;
      const patchLast = (p: Partial<PipTurn>) => setTurns((t) => [...t.slice(0, -1), { ...t[t.length - 1], ...p }]);
      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, history, lessonId }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          const kind = res.status === 503 ? "config" : res.status === 429 ? "rate" : "other";
          throw Object.assign(new Error(data.error ?? `Pip couldn't answer (error ${res.status}). Try again.`), { kind });
        }
        let lessons: PipTurn["lessons"] = [];
        try {
          lessons = JSON.parse(decodeURIComponent(res.headers.get("X-Pip-Lessons") ?? "%5B%5D"));
        } catch {
          lessons = [];
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          patchLast({ content: acc });
        }
        patchLast({ content: acc, lessons, done: true });
        setStatus("idle");
      } catch (e) {
        const err = e as Error & { kind?: PipError["kind"] };
        if (err.name === "AbortError") {
          // Keep whatever arrived; drop the pair if nothing did.
          setTurns((t) => (t.at(-1)?.content ? [...t.slice(0, -1), { ...t[t.length - 1], done: true }] : t.slice(0, -2)));
          setStatus("idle");
        } else {
          setTurns((t) => (t.at(-1)?.content ? t : t.slice(0, -2)));
          setFailed(question);
          setError({
            message: err.kind ? err.message : "Couldn't reach Pip. Check your connection and try again.",
            kind: err.kind ?? "other",
          });
          setStatus("error");
        }
      } finally {
        abort.current = null;
      }
    },
    [lessonId],
  );

  const stop = useCallback(() => abort.current?.abort(), []);

  /** Ask the last question again (after an error, or to get a different answer). */
  const retry = useCallback(() => {
    if (failed) {
      void send(failed);
      return;
    }
    const t = turnsRef.current;
    const lastUser = [...t].reverse().find((x) => x.role === "user");
    if (!lastUser) return;
    const cut = t.lastIndexOf(lastUser);
    setTurns(t.slice(0, cut));
    turnsRef.current = t.slice(0, cut);
    void send(lastUser.content);
  }, [send, failed]);

  return { turns, status, error, send, stop, retry, busy: status === "streaming" };
}

/** Pip declining graded work: its answers then offer a one-tap walk-through. */
export function looksLikeDecline(text: string) {
  return /\b(won['’]t|can['’]t|not going to|rather not)\b[^.]{0,60}\b(write|do|give|answer)/i.test(text);
}
