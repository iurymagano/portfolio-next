"use client";

import { useSyncExternalStore } from "react";

// Animações contínuas (fumaça, pacotes, cintilação do retrato) param com movimento
// reduzido no sistema ou quando a pessoa pausa pelo site. A pausa fica salva no navegador.
const KEY = "motion-paused";
const REDUCED = "(prefers-reduced-motion: reduce)";
const listeners = new Set<() => void>();

export function subscribeMotion(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

export const isPaused = () => document.documentElement.dataset.motion === "paused";

export const animationsEnabled = () => !window.matchMedia(REDUCED).matches && !isPaused();

export function setPaused(paused: boolean) {
  if (paused) document.documentElement.dataset.motion = "paused";
  else delete document.documentElement.dataset.motion;
  try {
    if (paused) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}

export const useAnimationsEnabled = () => useSyncExternalStore(subscribeMotion, animationsEnabled, () => true);

export const usePaused = () => useSyncExternalStore(subscribeMotion, isPaused, () => false);
