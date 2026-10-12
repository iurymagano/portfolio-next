"use client";

import { useEffect, useRef, useState } from "react";

const W = 1440;
const H = 900;

// Renderiza a página em 1440x900 e encolhe para caber no card, mantendo as animações vivas
export function ScaledFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: `${W} / ${H}` }}>
      {scale > 0 && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          className="absolute left-0 top-0 origin-top-left border-0"
          style={{ width: W, height: H, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
