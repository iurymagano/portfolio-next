"use client";

import { useEffect, useRef } from "react";

const RAMP = ".:-=+<>/\\(){}[]*#%&@";
const LANE_COLORS = ["#ffb547", "#5ce1e6", "#a78bfa", "#ff6b9a"];

function hash(x: number, y: number) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

/**
 * Curvas de nível feitas de glifos de código. O campo escoa devagar e o cursor
 * acende uma lente colorida que empurra os caracteres e embaralha o que está perto.
 */
export function GlyphField({
  className,
  ink = "#eef0f7",
  palette = LANE_COLORS,
  strength = 1,
}: {
  className?: string;
  /** cor dos glifos em repouso */
  ink?: string;
  /** cores da lente do cursor */
  palette?: string[];
  /** multiplica a opacidade dos glifos em repouso */
  strength?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let cw = 11;
    let ch = 17;
    let raf = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, energy: 0 };
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cw = w < 640 ? 9 : 11;
      ch = w < 640 ? 14 : 17;
      cols = Math.ceil(w / cw) + 1;
      rows = Math.ceil(h / ch) + 1;
      // canvas não resolve var(); lê a família que o next/font gerou
      const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim();
      ctx.font = `${w < 640 ? 10 : 12}px ${mono || "ui-monospace"}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    const frame = (now: number) => {
      const t = reduced ? 8 : (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      pointer.energy *= 0.96;

      ctx.clearRect(0, 0, w, h);
      const R = coarse ? 120 : 190;
      const R2 = R * R;
      const tick = Math.floor(t * 3);

      for (let j = 0; j < rows; j++) {
        const ny = j * 0.075;
        for (let i = 0; i < cols; i++) {
          const nx = i * 0.042;
          const a = Math.sin(nx + t * 0.22 + Math.sin(ny * 1.4 - t * 0.17) * 1.7);
          const b = Math.cos(ny * 0.85 - t * 0.19 + Math.sin(nx * 0.8 + t * 0.13) * 1.9);
          const v = (a * b + 1) * 0.5;

          const band = (v * 6 + t * 0.04) % 1;
          const line = 1 - Math.abs(band - 0.5) * 2;

          const px = i * cw;
          const py = j * ch;
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const d2 = dx * dx + dy * dy;
          const near = d2 < R2 ? 1 - Math.sqrt(d2) / R : 0;

          const lit = line > 0.82 ? (line - 0.82) / 0.18 : 0;
          if (lit === 0 && near < 0.25) continue;

          const seed = hash(i, j);
          let idx = Math.floor((v * 0.35 + seed * 0.65) * RAMP.length * 0.999);
          if (near > 0 || seed > 0.97) idx = Math.floor(hash(i + tick, j - tick) * RAMP.length);

          let x = px;
          let y = py;
          if (near > 0) {
            const push = near * near * (18 + pointer.energy * 30);
            const d = Math.sqrt(d2) || 1;
            x += (dx / d) * push;
            y += (dy / d) * push;
            ctx.fillStyle = palette[Math.floor(seed * palette.length)];
            ctx.globalAlpha = Math.min(1, 0.15 + near * 0.9) * (lit > 0 ? 1 : 0.55);
          } else {
            ctx.fillStyle = ink;
            ctx.globalAlpha = Math.min(1, (0.06 + lit * 0.3) * strength);
          }
          ctx.fillText(RAMP[idx], x, y);
        }
      }
      ctx.globalAlpha = 1;

      if (!reduced && visible) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      const speed = Math.hypot(nx - pointer.tx, ny - pointer.ty);
      if (pointer.tx < -999) {
        pointer.x = nx;
        pointer.y = ny;
      }
      pointer.tx = nx;
      pointer.ty = ny;
      pointer.energy = Math.min(1, pointer.energy + speed / 400);
      if (reduced) requestAnimationFrame(frame);
    };
    const onLeave = () => {
      pointer.tx = -9999;
      pointer.ty = -9999;
    };

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting && !document.hidden;
      if (visible && !was && !reduced) raf = requestAnimationFrame(frame);
    });
    const onVisibility = () => {
      const was = visible;
      visible = !document.hidden;
      if (visible && !was && !reduced) raf = requestAnimationFrame(frame);
    };

    resize();
    raf = requestAnimationFrame(frame);
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) requestAnimationFrame(frame);
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ink, palette, strength]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
