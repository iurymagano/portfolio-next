import type { Metadata } from "next";
import { GlyphField } from "@/components/glyph-field";
import { ProximityName } from "@/components/proximity-name";
import { profile } from "@/data/profile";
import { getHistory } from "@/lib/github";
import { lanes } from "@/lib/lanes";
import { AuroraField } from "../_components/aurora-field";
import { HeroMeta } from "../_components/hero-meta";
import { VariantNav } from "../_components/variant-nav";

export const metadata: Metadata = { title: "Variação: Aurora", robots: { index: false } };

const C = {
  indigo: "#1d0b52",
  milk: "#fff8f0",
  haze: "rgba(255,248,240,.78)",
};

const hex: Record<string, string> = {
  produto: "#ffb547",
  web: "#5ce1e6",
  api: "#a78bfa",
  mobile: "#ff6b9a",
  base: "#ff5a3c",
};

export default async function Aurora() {
  const { commits } = await getHistory();
  const blobs = lanes
    .map((l) => ({ color: hex[l.id], weight: commits.filter((c) => c.lane === l.id).length }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-8 pt-28 sm:px-10 sm:pb-10" style={{ background: C.indigo }}>
      <AuroraField blobs={blobs} base={C.indigo} className="absolute inset-0 -z-10 h-full w-full" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <GlyphField className="absolute inset-0 -z-10 h-full w-full mix-blend-overlay" ink={C.milk} palette={[C.milk]} strength={0.9} />
      <VariantNav color={C.milk} line="rgba(255,248,240,.4)" />

      <div className="relative">
        <div className="text-[clamp(3.5rem,19.5vw,20rem)]" style={{ color: C.milk }}>
          <ProximityName lines={[profile.firstName.toUpperCase(), profile.lastName.toUpperCase()]} />
        </div>
        <div className="mt-8">
          <HeroMeta repos={commits.length} ink={C.milk} muted={C.haze} line="rgba(255,248,240,.35)" />
        </div>
      </div>
    </section>
  );
}
