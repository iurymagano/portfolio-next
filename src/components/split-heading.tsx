"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { isPaused } from "@/lib/motion-pref";

/**
 * Título que entra letra a letra ao chegar na tela, saindo da largura mais estreita do
 * Archivo para a final: o mesmo gesto do nome no topo, uma vez por título.
 */
export function SplitHeading({
  children,
  className,
  style,
}: {
  children: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (isPaused() || !ref.current) return;
        SplitText.create(ref.current, {
          type: "lines,words,chars",
          mask: "lines",
          linesClass: "split-line",
          wordsClass: "split-word",
          charsClass: "vf",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 110,
              "--w": 62,
              "--g": 200,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.022,
              scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <h2 ref={ref} className={className} style={style}>
      {children}
    </h2>
  );
}
