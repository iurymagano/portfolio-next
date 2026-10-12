"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { isPaused } from "@/lib/motion-pref";

/** Texto de terminal que "decodifica" no lugar quando entra na tela, sem mudar de tamanho */
export function ScrambleOnView({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (isPaused()) return;
        gsap.to(ref.current, {
          duration: 1.4,
          scrambleText: { text, chars: "abcdefghijklmnopqrstuvwxyz-=", revealDelay: 0.25, speed: 0.6 },
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <p ref={ref} translate="no" className={className}>
      {text}
    </p>
  );
}
