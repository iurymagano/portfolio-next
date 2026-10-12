"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { animationsEnabled } from "@/lib/motion-pref";

/**
 * O elemento "puxa" levemente na direção do cursor quando ele chega perto.
 * Adaptado do Magnetic do motion-primitives (MIT, github.com/ibelick/motion-primitives):
 * sem estado React por movimento, mola mais contida e transform completo (acelerado na GPU).
 * Só age com mouse de verdade e com animações liberadas.
 */
export function Magnetic({
  children,
  intensity = 0.35,
  range = 140,
  className,
}: {
  children: ReactNode;
  intensity?: number;
  range?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 170, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 170, damping: 18, mass: 0.4 });
  const transform = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0)`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !animationsEnabled() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const k = Math.max(0, 1 - Math.hypot(dx, dy) / range);
    x.set(dx * intensity * k);
    y.set(dy * intensity * k);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ transform }} className={className}>
      {children}
    </motion.div>
  );
}
