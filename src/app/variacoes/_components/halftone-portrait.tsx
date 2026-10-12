"use client";

import { useEffect, useRef } from "react";

/**
 * Foto em meio-tom: um ponto por célula, maior onde a foto é mais clara.
 * Perto do cursor os pontos ganham a cor original da foto.
 */
export function HalftonePortrait({
  src,
  alt,
  dot,
  bg,
  focusY = 0.35,
  className,
}: {
  src: string;
  alt: string;
  dot: string;
  bg: string;
  focusY?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    img.src = src;

    let w = 0;
    let h = 0;
    let cell = 9;
    let cols = 0;
    let rows = 0;
    let lum = new Float32Array(0);
    let rgb: string[] = [];
    let raf = 0;
    let born = 0;
    const lens = { x: -999, y: -999, tx: -999, ty: -999, k: 0, tk: 0 };

    const sample = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = w < 500 ? 7 : 9;
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);

      // recorte "cover", centrado no rosto
      const ar = w / h;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      let sw = iw;
      let sh = iw / ar;
      if (sh > ih) {
        sh = ih;
        sw = ih * ar;
      }
      const sx = (iw - sw) / 2;
      const sy = Math.min(ih - sh, Math.max(0, ih * focusY - sh / 2));

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      const data = o.getImageData(0, 0, cols, rows).data;
      lum = new Float32Array(cols * rows);
      rgb = new Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        // tinta: quanto mais escuro o pixel, maior o ponto
        lum[i] = Math.pow(1 - Math.min(1, Math.max(0, (l - 0.06) / 0.86)), 0.85);
        rgb[i] = `rgb(${r},${g},${b})`;
      }
    };

    const draw = (now: number) => {
      const age = reduced ? 99 : (now - born) / 1000;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const R = Math.max(110, w * 0.22);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          // entrada em diagonal, do canto de cima
          const appear = Math.min(1, Math.max(0, age * 1.6 - (i + j) / (cols + rows)));
          if (appear <= 0) continue;
          const cx = i * cell + cell / 2;
          const cy = j * cell + cell / 2;
          const d = Math.hypot(cx - lens.x, cy - lens.y);
          const near = lens.k * Math.max(0, 1 - d / R);
          const r = (cell / 2) * (0.08 + lum[k] * 1.05) * appear * (1 + near * 0.25);
          if (r < 0.35) continue;
          ctx.fillStyle = near > 0.15 ? rgb[k] : dot;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      lens.x += (lens.tx - lens.x) * 0.18;
      lens.y += (lens.ty - lens.y) * 0.18;
      lens.k += (lens.tk - lens.k) * 0.12;
      draw(now);
      const settling = (now - born) / 1000 < 1.6 || Math.abs(lens.tk - lens.k) > 0.01 || Math.hypot(lens.tx - lens.x, lens.ty - lens.y) > 0.5;
      raf = settling ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      lens.tx = e.clientX - rect.left;
      lens.ty = e.clientY - rect.top;
      if (lens.k < 0.02) {
        lens.x = lens.tx;
        lens.y = lens.ty;
      }
      lens.tk = 1;
      kick();
    };
    const onLeave = () => {
      lens.tk = 0;
      kick();
    };

    const ro = new ResizeObserver(() => {
      if (!img.complete) return;
      sample();
      kick();
    });
    img.onload = () => {
      sample();
      born = performance.now();
      ro.observe(canvas);
      kick();
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [src, dot, bg, focusY]);

  return <canvas ref={ref} role="img" aria-label={alt} className={className} />;
}
