"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger } from "@/lib/gsap";
import { MotionConfig } from "motion/react";
import { useSyncExternalStore, type ReactNode } from "react";

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

// ScrollTrigger recalcula posições a cada passo da rolagem suave
function ScrollTriggerSync() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );

  // MotionConfig faz todas as animações do Motion respeitarem o movimento reduzido do sistema
  if (reduced) return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.09, anchors: { offset: -40 }, autoRaf: true }}>
        <ScrollTriggerSync />
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
