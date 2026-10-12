import type { Metadata } from "next";
import { GlyphField } from "@/components/glyph-field";
import { ProximityName } from "@/components/proximity-name";
import { profile } from "@/data/profile";
import { getHistory } from "@/lib/github";
import { HeroMeta } from "../_components/hero-meta";
import { StackDrawing } from "../_components/stack-drawing";
import { VariantNav } from "../_components/variant-nav";

export const metadata: Metadata = { title: "Variação: Planta", robots: { index: false } };

const C = {
  cobalt: "#1b3bd9",
  paper: "#f2f5ff",
  chalk: "#b9c5ff",
  amber: "#ffb547",
};

export default async function Planta() {
  const { commits } = await getHistory();
  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-8 pt-28 sm:px-10 sm:pb-10"
      style={{
        background: C.cobalt,
        // papel quadriculado: grade fina a cada 32px e grossa a cada 160px
        backgroundImage: `linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)`,
        backgroundSize: "160px 160px, 160px 160px, 32px 32px, 32px 32px",
        backgroundPosition: "-1px -1px",
      }}
    >
      <GlyphField
        className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,black_40%,transparent_95%)]"
        ink={C.paper}
        palette={[C.amber, "#ffffff", C.chalk]}
        strength={0.55}
      />
      <VariantNav color={C.paper} line="rgba(255,255,255,.35)" />

      <div className="pointer-events-none absolute right-10 top-28 hidden w-[min(38vw,560px)] lg:block">
        <StackDrawing ink={C.paper} accent={C.amber} />
      </div>

      <div className="relative">
        <div className="text-[clamp(3.5rem,19.5vw,20rem)]" style={{ color: C.paper }}>
          <ProximityName lines={[profile.firstName.toUpperCase(), profile.lastName.toUpperCase()]} />
        </div>
        <div className="mt-8">
          <HeroMeta repos={commits.length} ink={C.paper} muted={C.chalk} line="rgba(255,255,255,.3)" />
        </div>
      </div>
    </section>
  );
}
