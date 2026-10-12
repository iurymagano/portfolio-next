"use client";

import NumberFlow from "@number-flow/react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { lanes, laneById, systems, type LaneId } from "@/lib/lanes";
import { isPaused } from "@/lib/motion-pref";

export type GraphCommit = {
  name: string;
  message: string;
  url: string;
  homepageUrl: string | null;
  language: string | null;
  createdAt: string;
  sha: string | null;
  commits: number | null;
  lane: LaneId;
};

const ROW = 56;

const compactQuery = "(max-width: 639px)";
const subscribeCompact = (cb: () => void) => {
  const mq = window.matchMedia(compactQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

// "nov 2025": Intl dá "nov. de 2025", então só tira o ponto e o "de"
const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" });
const monthYear = (iso: string) => {
  const parts = monthFmt.formatToParts(new Date(iso));
  const m = parts.find((p) => p.type === "month")?.value.replace(".", "");
  const y = parts.find((p) => p.type === "year")?.value;
  return `${m} ${y}`;
};

// filtro na URL (?branch=api) para dar para compartilhar o histórico já filtrado
const branchListeners = new Set<() => void>();
const subscribeBranch = (cb: () => void) => {
  branchListeners.add(cb);
  window.addEventListener("popstate", cb);
  return () => {
    branchListeners.delete(cb);
    window.removeEventListener("popstate", cb);
  };
};
const readBranch = (): LaneId | "todos" => {
  const b = new URLSearchParams(window.location.search).get("branch");
  return lanes.some((l) => l.id === b) ? (b as LaneId) : "todos";
};
const writeBranch = (b: LaneId | "todos") => {
  const url = new URL(window.location.href);
  if (b === "todos") url.searchParams.delete("branch");
  else url.searchParams.set("branch", b);
  window.history.replaceState(null, "", url);
  branchListeners.forEach((l) => l());
};

export function HistoryGraph({ commits }: { commits: GraphCommit[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const filter = useSyncExternalStore(subscribeBranch, readBranch, () => "todos" as const);
  const setFilter = writeBranch;
  const [hover, setHover] = useState<string | null>(null);
  const compact = useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(compactQuery).matches,
    () => false,
  );
  const LANE_GAP = compact ? 13 : 22;
  const PAD = compact ? 8 : 14;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 85%"] });

  // hashes "decodificam" quando a linha entra na tela, como um git log chegando
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (isPaused()) return;
        const els = gsap.utils.toArray<HTMLElement>("[data-sha]", ref.current);
        ScrollTrigger.batch(els, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            batch.forEach((el, i) =>
              gsap.to(el, {
                duration: 0.9,
                delay: i * 0.05,
                scrambleText: { text: (el as HTMLElement).dataset.sha ?? "", chars: "0123456789abcdef", speed: 0.5 },
              }),
            ),
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  // o grafo é revelado de cima pra baixo conforme a rolagem. O valor vai direto no SVG e na
  // linha de varredura (dois elementos), não numa variável no container, que recalcularia as 48 linhas
  const svgRef = useRef<SVGSVGElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const reveal = (v: number) => {
    const p = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : v;
    const h = ref.current?.offsetHeight ?? 0;
    if (svgRef.current) svgRef.current.style.clipPath = `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0)`;
    if (scanRef.current) {
      scanRef.current.style.transform = `translateY(${(p * h).toFixed(1)}px)`;
      scanRef.current.style.opacity = String(Math.min(1, Math.max(0, Math.min(p, 1 - p) * 30)));
    }
  };
  useMotionValueEvent(scrollYProgress, "change", reveal);
  useEffect(() => reveal(scrollYProgress.get()));

  const geo = useMemo(() => {
    const laneIndex = Object.fromEntries(lanes.map((l, i) => [l.id, i])) as Record<LaneId, number>;
    const x = (lane: LaneId) => PAD + laneIndex[lane] * LANE_GAP;
    const y = (row: number) => row * ROW + ROW / 2;
    const rowOf = new Map(commits.map((c, i) => [c.name, i]));

    // cada branch existe do primeiro ao último commit dela
    const spans = lanes
      .map((l) => {
        const rows = commits.flatMap((c, i) => (c.lane === l.id ? [i] : []));
        if (!rows.length) return null;
        return { lane: l.id, from: Math.min(...rows), to: Math.max(...rows) };
      })
      .filter(Boolean) as { lane: LaneId; from: number; to: number }[];

    // merges: liga os repositórios de um mesmo sistema
    const merges = systems.flatMap((s) => {
      const rows = s.repos
        .map((r) => rowOf.get(r))
        .filter((r): r is number => r !== undefined)
        .sort((a, b) => a - b);
      return rows.slice(1).map((r, i) => {
        const a = commits[rows[i]];
        const b = commits[r];
        const x1 = x(a.lane);
        const y1 = y(rows[i]);
        const x2 = x(b.lane);
        const y2 = y(r);
        const d = x1 === x2 ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} C${x1},${y1 + ROW * 0.8} ${x2},${y2 - ROW * 0.8} ${x2},${y2}`;
        return { id: `${s.id}-${i}`, system: s.id, d, color: laneById[a.lane].color, names: [a.name, b.name] };
      });
    });

    const systemOf = new Map(systems.flatMap((s) => s.repos.map((r) => [r, s.id] as const)));
    return { x, y, spans, merges, systemOf, width: PAD * 2 + (lanes.length - 1) * LANE_GAP };
  }, [commits, LANE_GAP, PAD]);

  const height = commits.length * ROW;
  const counts = useMemo(() => {
    const c = Object.fromEntries(lanes.map((l) => [l.id, 0])) as Record<LaneId, number>;
    commits.forEach((cm) => c[cm.lane]++);
    return c;
  }, [commits]);

  const visible = filter === "todos" ? commits.length : counts[filter];
  const hoveredSystem = hover ? geo.systemOf.get(hover) : undefined;
  const dim = (c: GraphCommit) => (filter !== "todos" && c.lane !== filter) || (hoveredSystem !== undefined && geo.systemOf.get(c.name) !== hoveredSystem);

  return (
    <div>
      <div role="group" aria-label="Filtrar por branch" className="mb-10 flex flex-wrap gap-2">
        {[{ id: "todos" as const, label: "Todas", color: "var(--ink)" }, ...lanes].map((l) => {
          const on = filter === l.id;
          const n = l.id === "todos" ? commits.length : counts[l.id];
          return (
            <button
              key={l.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(l.id)}
              className={`flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm transition-[color,border-color,background-color,scale] duration-150 ease-out motion-safe:active:scale-[0.96] ${
                on ? "border-ink/60 bg-ink/5 text-ink" : "border-wire text-fog hover:text-ink"
              }`}
            >
              <span className="size-2 rounded-full" style={{ background: l.color }} />
              {l.label}
              <span className="tabular-nums text-fog">{n}</span>
            </button>
          );
        })}
        <p aria-live="polite" className="ml-auto self-center text-sm text-fog">
          Mostrando <NumberFlow value={visible} className="tabular-nums text-ink" /> de {commits.length}
        </p>
      </div>

      <div ref={ref} className="relative">
        <svg
          ref={svgRef}
          aria-hidden
          width={geo.width}
          height={height}
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          style={{ clipPath: "inset(0 0 100% 0)" }}
        >
          {geo.spans.map((s) => (
            <line
              key={s.lane}
              x1={geo.x(s.lane)}
              x2={geo.x(s.lane)}
              y1={geo.y(s.from)}
              y2={geo.y(s.to)}
              stroke={laneById[s.lane].color}
              strokeWidth={1.5}
              strokeOpacity={filter === "todos" || filter === s.lane ? 0.55 : 0.12}
              className="transition-[stroke-opacity] duration-500"
            />
          ))}
          {geo.merges.map((m) => (
            <path
              key={m.id}
              d={m.d}
              fill="none"
              stroke={m.color}
              strokeWidth={hoveredSystem === m.system ? 2.5 : 1.5}
              strokeOpacity={hoveredSystem === m.system ? 1 : filter === "todos" ? 0.55 : 0.12}
              className="transition-[stroke-width,stroke-opacity] duration-300"
            />
          ))}
          {commits.map((c, i) => (
            <g key={c.name} className="transition-opacity duration-300" opacity={dim(c) ? 0.3 : 1}>
              <circle cx={geo.x(c.lane)} cy={geo.y(i)} r={compact ? 4 : 5} fill="var(--void)" stroke={laneById[c.lane].color} strokeWidth={2} />
              <circle cx={geo.x(c.lane)} cy={geo.y(i)} r={2} fill={laneById[c.lane].color} />
            </g>
          ))}
        </svg>

        <ol className="relative">
          {commits.map((c) => {
            const lane = laneById[c.lane];
            const faded = dim(c);
            return (
              <li key={c.name} style={{ height: ROW }}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setHover(c.name)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(c.name)}
                  onBlur={() => setHover(null)}
                  className={`group relative flex h-full items-center gap-4 border-b border-wire/60 pr-2 transition-opacity duration-300 sm:gap-6 ${
                    faded ? "opacity-30" : "opacity-100"
                  }`}
                  style={{ paddingLeft: geo.width + 8 }}
                >
                  <span
                    translate="no"
                    data-sha={c.sha ? c.sha.slice(0, 7) : undefined}
                    className="hidden w-[7ch] shrink-0 font-mono text-[13px] text-fog sm:block"
                    title={c.sha ?? undefined}
                  >
                    {c.sha ? c.sha.slice(0, 7) : "·······"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-3">
                      <span translate="no" className="truncate font-mono text-[14px] text-ink transition-colors group-hover:text-[var(--c)]" style={{ ["--c" as string]: lane.color }}>
                        {c.name}
                      </span>
                      <span className="hidden truncate text-[15px] text-fog md:block">{c.message}</span>
                    </span>
                    <span className="block truncate text-[13px] text-fog md:hidden">{c.message}</span>
                  </span>
                  <span className="hidden w-[11ch] shrink-0 text-right text-sm text-fog lg:block">{c.language ?? ""}</span>
                  <span className="w-[9ch] shrink-0 whitespace-nowrap text-right text-sm tabular-nums text-fog">{monthYear(c.createdAt)}</span>
                </a>
              </li>
            );
          })}
        </ol>

        <div ref={scanRef} aria-hidden className="pointer-events-none absolute left-0 right-0 top-0 h-px opacity-0">
          <div className="h-px w-full bg-gradient-to-r from-web via-web/20 to-transparent opacity-60" />
        </div>
      </div>
    </div>
  );
}
