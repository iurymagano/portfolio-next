"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";
import { animationsEnabled } from "@/lib/motion-pref";

/**
 * Contador do topo. O servidor entrega o número final (bom para busca e sem JS); só na
 * primeira visita, enquanto o boot cobre a tela, ele zera e rola até o total quando o boot sai.
 */
export function RepoCount({ value }: { value: number }) {
  const [phase, setPhase] = useState<"static" | "zero" | "final">("static");

  useEffect(() => {
    if (document.documentElement.hasAttribute("data-booted") || !animationsEnabled()) return;
    const toZero = window.setTimeout(() => setPhase("zero"), 300);
    const toFinal = window.setTimeout(() => setPhase("final"), 2350);
    return () => {
      clearTimeout(toZero);
      clearTimeout(toFinal);
    };
  }, []);

  if (phase === "static") return <span className="tabular-nums">{value}</span>;
  return <NumberFlow value={phase === "zero" ? 0 : value} animated={phase === "final"} locales="pt-BR" className="tabular-nums" />;
}
