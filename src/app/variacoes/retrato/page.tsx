import type { Metadata } from "next";
import { ProximityName } from "@/components/proximity-name";
import { profile } from "@/data/profile";
import { getHistory } from "@/lib/github";
import { HalftonePortrait } from "../_components/halftone-portrait";
import { HeroMeta } from "../_components/hero-meta";
import { VariantNav } from "../_components/variant-nav";

export const metadata: Metadata = { title: "Variação: Retrato", robots: { index: false } };

const C = {
  amber: "#ffb547",
  paper: "#ffc46b",
  plum: "#1a0f33",
  dusk: "rgba(26,15,51,.72)",
};

export default async function Retrato() {
  const { commits } = await getHistory();
  return (
    <section className="grid min-h-[100svh] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="relative order-2 min-h-[70svh] lg:order-1 lg:min-h-0" style={{ background: C.paper }}>
        <HalftonePortrait
          src="/img/iury.jpg"
          alt="Iury no alto de um mirante, com Florianópolis ao fundo"
          dot={C.plum}
          bg={C.paper}
          focusY={0.32}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
        />
      </div>

      <div className="relative order-1 flex flex-col justify-end px-5 pb-8 pt-28 sm:px-10 sm:pb-10 lg:order-2" style={{ background: C.amber }}>
        <VariantNav color={C.plum} line="rgba(26,15,51,.35)" />
        <div className="text-[clamp(3.5rem,19.5vw,20rem)] lg:text-[11.5vw]" style={{ color: C.plum }}>
          <ProximityName lines={[profile.firstName.toUpperCase(), profile.lastName.toUpperCase()]} />
        </div>
        <div className="mt-8">
          <HeroMeta repos={commits.length} ink={C.plum} muted={C.dusk} line="rgba(26,15,51,.25)" />
        </div>
      </div>
    </section>
  );
}
