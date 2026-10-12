"use client";

import { setPaused, usePaused } from "@/lib/motion-pref";

// Controle para quem quer a página parada: fumaça, pacotes dos diagramas e retrato
export function MotionToggle() {
  const paused = usePaused();
  return (
    <button
      type="button"
      onClick={() => setPaused(!paused)}
      aria-pressed={paused}
      className="self-start text-left text-fog underline decoration-wire underline-offset-4 transition-colors hover:text-ink sm:self-auto"
    >
      {paused ? "Retomar animações" : "Pausar animações"}
    </button>
  );
}
