"use client";

import { useEffect, useRef } from "react";

const REST = { w: 72, g: 760 };
const PEAK = { w: 125, g: 920 };
const ENTER = { w: 62, g: 120 };

/**
 * Nome em Archivo variável: cada letra alarga e engorda conforme o cursor chega perto.
 * Na entrada, as letras saem do traço mais fino e condensado para o peso final.
 */
export function ProximityName({ lines }: { lines: string[] }) {
  const root = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-l]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // primeira visita da sessão espera o boot sair da frente
    const delay = document.documentElement.hasAttribute("data-booted") ? 150 : 2100;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const current = letters.map(() => ({ ...ENTER }));
    const target = letters.map(() => ({ ...ENTER }));
    const centers: { x: number; y: number }[] = [];
    let entered = reduced;
    let pointer = { x: -9999, y: -9999 };
    let raf = 0;

    const measure = () => {
      centers.length = 0;
      for (const l of letters) {
        const r = l.getBoundingClientRect();
        centers.push({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
    };

    const apply = () => {
      letters.forEach((l, i) => {
        l.style.setProperty("--w", current[i].w.toFixed(1));
        l.style.setProperty("--g", current[i].g.toFixed(0));
      });
    };

    if (reduced) {
      current.forEach((c) => Object.assign(c, REST));
      apply();
      return;
    }

    const loop = () => {
      const radius = Math.max(window.innerWidth * 0.22, 220);
      // telas estreitas não têm folga para as letras alargarem tanto
      const peakW = window.innerWidth < 900 ? 96 : PEAK.w;
      letters.forEach((_, i) => {
        if (!entered) return;
        const c = centers[i];
        const d = c ? Math.hypot(pointer.x - c.x, pointer.y - c.y) : Infinity;
        const k = Math.max(0, 1 - d / radius);
        const e = k * k * (3 - 2 * k);
        target[i].w = REST.w + (peakW - REST.w) * e;
        target[i].g = REST.g + (PEAK.g - REST.g) * e;
      });
      let moving = false;
      current.forEach((c, i) => {
        const dw = target[i].w - c.w;
        const dg = target[i].g - c.g;
        c.w += dw * 0.14;
        c.g += dg * 0.14;
        if (Math.abs(dw) > 0.05 || Math.abs(dg) > 0.5) moving = true;
      });
      apply();
      raf = moving ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    // entrada escalonada letra a letra
    const timers = letters.map((_, i) =>
      window.setTimeout(() => {
        target[i] = { ...REST };
        if (i === letters.length - 1) {
          window.setTimeout(() => {
            entered = true;
            measure();
          }, 500);
        }
        kick();
      }, delay + i * 55),
    );

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      if (entered) kick();
    };
    const onScroll = () => {
      measure();
      kick();
    };

    measure();
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <h1 ref={root} translate="no" className="display select-none" aria-label={lines.join(" ")}>
      {lines.map((line, li) => (
        <span key={li} className="block whitespace-nowrap" aria-hidden>
          {line.split("").map((ch, i) => (
            <span key={i} data-l className="vf inline-block" style={{ ["--w" as string]: ENTER.w, ["--g" as string]: ENTER.g }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
