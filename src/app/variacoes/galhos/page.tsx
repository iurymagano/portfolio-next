import type { Metadata } from "next";
import { ProximityName } from "@/components/proximity-name";
import { profile } from "@/data/profile";
import { getHistory } from "@/lib/github";
import type { LaneId } from "@/lib/lanes";
import { BranchLog } from "../_components/branch-log";
import { HeroMeta } from "../_components/hero-meta";
import { VariantNav } from "../_components/variant-nav";

export const metadata: Metadata = { title: "Variação: Galhos", robots: { index: false } };

const C = {
  mist: "#eef0f4",
  graphite: "#0e1222",
  slate: "#5b6178",
};

// cores das branches recalibradas para fundo claro
const lanes: Record<LaneId, string> = {
  produto: "#f29a00",
  web: "#08a4c4",
  api: "#6d45f5",
  mobile: "#ee3d78",
  base: "#9aa0b5",
};

export default async function Galhos() {
  const { commits } = await getHistory();
  const recent = commits.slice(0, 13).map(({ name, message, url, createdAt, lane, sha }) => ({ name, message, url, createdAt, lane, sha }));

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pb-8 pt-28 sm:px-10 sm:pb-10" style={{ background: C.mist }}>
      <VariantNav color={C.graphite} line="rgba(14,18,34,.25)" />

      <div className="grid flex-1 items-end gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
        <div className="text-[clamp(3.5rem,19.5vw,20rem)] lg:text-[12vw]" style={{ color: C.graphite }}>
          <ProximityName lines={[profile.firstName.toUpperCase(), profile.lastName.toUpperCase()]} />
        </div>
        <div className="hidden lg:block">
          <BranchLog commits={recent} colors={lanes} paper={C.mist} ink={C.graphite} muted={C.slate} rowHeight={42} />
        </div>
      </div>

      <div className="mt-8">
        <HeroMeta repos={commits.length} ink={C.graphite} muted={C.slate} line="rgba(14,18,34,.18)" />
      </div>
      <div className="mt-12 lg:hidden">
        <BranchLog commits={recent.slice(0, 7)} colors={lanes} paper={C.mist} ink={C.graphite} muted={C.slate} rowHeight={40} compact />
      </div>
    </section>
  );
}
