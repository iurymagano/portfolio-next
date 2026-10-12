"use client";

import { useEffect, useRef } from "react";
import { animationsEnabled } from "@/lib/motion-pref";

const RAMP = " .:-=+*<>/\\{}[]#%&@";

/**
 * A foto vira texto: cada célula pega o brilho e a cor do pixel de origem e
 * escolhe um glifo pela densidade. Passando o cursor, uma lente mostra a foto real.
 */
export function AsciiPortrait({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = !animationsEnabled();
    const img = new Image();
    img.src = src;

    let size = 0;
    let cols = 0;
    let rows = 0;
    let cw = 6;
    let ch = 10;
    let lum = new Float32Array(0);
    let rgb = new Uint8ClampedArray(0);
    let reveal = reduced ? 1 : 0;
    let raf = 0;
    let visible = false;
    let last = 0;
    const lens = { x: -999, y: -999, tx: -999, ty: -999, r: 0, tr: 0 };

    const sample = () => {
      const rect = canvas.getBoundingClientRect();
      size = rect.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cw = size < 360 ? 5 : 6;
      ch = size < 360 ? 8.5 : 10;
      cols = Math.floor(size / cw);
      rows = Math.floor(size / ch);

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o || !img.complete) return;
      o.drawImage(img, 0, 0, cols, rows);
      const data = o.getImageData(0, 0, cols, rows).data;
      lum = new Float32Array(cols * rows);
      rgb = new Uint8ClampedArray(cols * rows * 3);
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        lum[i] = Math.pow(Math.min(1, Math.max(0, (l - 0.12) / 0.78)), 1.25);
        // cor original puxada para o tom do texto, para sugerir a foto sem gritar
        rgb[i * 3] = r * 0.7 + 238 * 0.3;
        rgb[i * 3 + 1] = g * 0.7 + 240 * 0.3;
        rgb[i * 3 + 2] = b * 0.7 + 247 * 0.3;
      }
      const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim();
      ctx.font = `${size < 360 ? 8 : 9.5}px ${mono || "ui-monospace"}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, size, size);
      const tick = Math.floor(now / 90);
      for (let j = 0; j < rows; j++) {
        // revelação de cima pra baixo na primeira vez que aparece
        const rowOn = reveal * (rows + 12) - j;
        if (rowOn <= 0) break;
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const l = lum[k];
          if (l < 0.04) continue;
          let idx = Math.floor(Math.pow(l, 1.5) * (RAMP.length - 1));
          const noise = Math.sin((i + tick) * 12.9898 + j * 78.233) * 43758.5453;
          const n = noise - Math.floor(noise);
          if (rowOn < 12 || (n > 0.992 && animationsEnabled())) idx = 1 + Math.floor(n * (RAMP.length - 1));
          ctx.fillStyle = `rgb(${rgb[k * 3]},${rgb[k * 3 + 1]},${rgb[k * 3 + 2]})`;
          ctx.globalAlpha = 0.22 + l * 0.6;
          ctx.fillText(RAMP[idx], i * cw + cw / 2, j * ch + ch / 2);
        }
      }
      ctx.globalAlpha = 1;

      if (lens.r > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--void").trim() || "#05060b";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(92,225,230,0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      if (reveal < 1) reveal = Math.min(1, reveal + 0.012);
      lens.x += (lens.tx - lens.x) * 0.2;
      lens.y += (lens.ty - lens.y) * 0.2;
      lens.r += (lens.tr - lens.r) * 0.16;
      // fora da revelação e sem lente, 12 quadros por segundo bastam (e nenhum se pausado)
      if (reveal < 1 || lens.r > 1 || Math.abs(lens.tr - lens.r) > 0.5 || (now - last > 83 && animationsEnabled())) {
        draw(now);
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(loop);
      if (reduced) draw(0);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      lens.tx = e.clientX - rect.left;
      lens.ty = e.clientY - rect.top;
      if (lens.r < 1) {
        lens.x = lens.tx;
        lens.y = lens.ty;
      }
      lens.tr = Math.max(70, size * 0.2);
      if (reduced) {
        lens.x = lens.tx;
        lens.y = lens.ty;
        lens.r = lens.tr;
        draw(0);
      }
    };
    const onLeave = () => {
      lens.tr = 0;
      if (reduced) {
        lens.r = 0;
        draw(0);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    const ro = new ResizeObserver(() => {
      sample();
      draw(performance.now());
    });

    img.onload = () => {
      sample();
      io.observe(canvas);
      ro.observe(canvas);
      start();
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [src]);

  return <canvas ref={ref} role="img" aria-label={alt} className={className} />;
}
