"use client";

import { useEffect, useRef } from "react";

export type AuroraBlob = { color: string; weight: number };

/**
 * Manchas de luz, uma por branch, com raio proporcional à quantidade de repositórios.
 * Desenha numa tela pequena e deixa o blur do CSS fazer o resto: barato e suave.
 */
export function AuroraField({ blobs, base, className }: { blobs: AuroraBlob[]; base: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = 160;
    const H = 100;
    canvas.width = W;
    canvas.height = H;

    const max = Math.max(...blobs.map((b) => b.weight));
    const state = blobs.map((b, i) => ({
      ...b,
      r: 34 + 22 * Math.sqrt(b.weight / max),
      phase: i * 1.7,
      speed: 0.07 + i * 0.013,
    }));
    const pointer = { x: W * 0.7, y: H * 0.4, tx: W * 0.7, ty: H * 0.4 };
    let raf = 0;
    const start = performance.now();

    const frame = (now: number) => {
      const t = reduced ? 3 : (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      state.forEach((b, i) => {
        let x = W * (0.5 + 0.38 * Math.sin(t * b.speed * 2 + b.phase));
        let y = H * (0.5 + 0.36 * Math.cos(t * b.speed * 1.4 + b.phase * 1.3));
        // a primeira mancha (a maior) persegue o cursor
        if (i === 0) {
          x = x * 0.4 + pointer.x * 0.6;
          y = y * 0.4 + pointer.y * 0.6;
        }
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, b.color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.95;
        ctx.fillRect(0, 0, W, H);
      });
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width) * W;
      pointer.ty = ((e.clientY - rect.top) / rect.height) * H;
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [blobs, base]);

  return <canvas ref={ref} aria-hidden className={className} style={{ filter: "blur(48px) saturate(1.25)", transform: "scale(1.2)" }} />;
}
