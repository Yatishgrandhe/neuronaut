"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { createProgress, mergeProgress, parseProgress, type ProgressState } from "@neuronaut/core";

const KEY = "neuronaut.progress.v1";
const SERVER_STATE = createProgress(new Date(0));

/* A tiny external store over localStorage, read through useSyncExternalStore
   so server HTML and the first client render agree. */
let cache: ProgressState | null = null;
const listeners = new Set<() => void>();

function read(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseProgress(JSON.parse(raw)) : createProgress();
  } catch {
    return createProgress();
  }
}
function getSnapshot(): ProgressState {
  if (!cache) cache = read();
  return cache;
}
function write(s: ProgressState) {
  cache = s;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage full or blocked: progress stays in memory for this visit */
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = read();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}
const noop = () => () => {};

interface Ctx {
  state: ProgressState;
  ready: boolean;
  setState: (s: ProgressState) => void;
  reset: () => void;
  exportJson: () => string;
  importJson: (text: string) => boolean;
}

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
  const ready = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    // Ask the browser to keep our data (Safari may otherwise evict it after 7 idle days).
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  const setState = useCallback((s: ProgressState) => write(s), []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      setState,
      reset: () => write(createProgress()),
      exportJson: () => JSON.stringify({ app: "neuronaut", exportedAt: new Date().toISOString(), progress: state }, null, 2),
      importJson: (text: string) => {
        try {
          const parsed = JSON.parse(text);
          const raw = parsed?.app === "neuronaut" ? parsed.progress : parsed;
          if (!raw || (raw.version !== 1 && raw.version !== 2)) return false;
          // Merge, never overwrite: importing an old backup can't wipe newer progress here.
          write(mergeProgress(read(), parseProgress(raw)));
          return true;
        } catch {
          return false;
        }
      },
    }),
    [state, ready, setState],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
