"use client";

import { NeuroNoise } from "@paper-design/shaders-react";
import { useAnimationsEnabled } from "@/lib/motion-pref";

/**
 * Fundo do topo: fios de luz neurais (shader Neuro Noise da Paper) nas cores do site.
 * Velocidade zero com movimento reduzido ou pausa: vira um quadro estático, sem custo.
 */
export function NeuroField({ className }: { className?: string }) {
  const on = useAnimationsEnabled();
  return (
    <NeuroNoise
      aria-hidden
      className={className}
      speed={on ? 0.5 : 0}
      colorFront="#7ad8ff"
      colorMid="#3b2f8f"
      colorBack="#05060b"
      brightness={0.02}
      contrast={0.35}
      scale={1.2}
    />
  );
}
