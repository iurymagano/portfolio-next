"use client";

import { motion } from "motion/react";
import { useAnimationsEnabled } from "@/lib/motion-pref";
import type { DiagramEdge, DiagramNode, NodeTone } from "@/data/projects";

const H = 52;
const W = 140;

const toneColor: Record<NodeTone, string> = {
  user: "var(--ink)",
  ext: "var(--fog)",
  produto: "var(--lane-produto)",
  web: "var(--lane-web)",
  api: "var(--lane-api)",
  mobile: "var(--lane-mobile)",
  base: "var(--lane-base)",
};

type Box = { x: number; y: number; w: number; h: number };

function box(n: DiagramNode): Box {
  return { x: n.x, y: n.y, w: n.w ?? W, h: H };
}

// Curva entre as laterais mais próximas de cada caixa
function edgePath(a: Box, b: Box) {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const dx = bc.x - ac.x;
  const dy = bc.y - ac.y;
  if (Math.abs(dx) > Math.abs(dy) * 0.9) {
    const sx = dx > 0 ? a.x + a.w : a.x;
    const ex = dx > 0 ? b.x : b.x + b.w;
    const mx = (sx + ex) / 2;
    const flat = Math.abs(dy) < 4;
    return { d: `M${sx},${ac.y} C${mx},${ac.y} ${mx},${bc.y} ${ex},${bc.y}`, mid: { x: mx, y: (ac.y + bc.y) / 2 - (flat ? H / 2 + 14 : 0) } };
  }
  const sy = dy > 0 ? a.y + a.h : a.y;
  const ey = dy > 0 ? b.y : b.y + b.h;
  const my = (sy + ey) / 2;
  return { d: `M${ac.x},${sy} C${ac.x},${my} ${bc.x},${my} ${bc.x},${ey}`, mid: { x: (ac.x + bc.x) / 2, y: my } };
}

export function ArchDiagram(props: Parameters<typeof Diagram>[0]) {
  const enabled = useAnimationsEnabled();
  return <Diagram {...props} animatePackets={enabled && props.animatePackets !== false} />;
}

function Diagram({
  nodes,
  edges,
  title,
  animatePackets = true,
  focus = null,
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  title: string;
  animatePackets?: boolean;
  /** quando presente, só essas peças (e as ligações entre elas) ficam acesas */
  focus?: string[] | null;
}) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 520 380" role="img" aria-label={`Arquitetura do ${title}`} className="h-auto w-full overflow-visible">
      <title>{`Arquitetura do ${title}: ${nodes.map((n) => n.label).join(", ")}`}</title>

      {edges.map((e, i) => {
        const a = byId[e.from];
        const b = byId[e.to];
        const { d, mid } = edgePath(box(a), box(b));
        const color = toneColor[a.tone === "user" || a.tone === "ext" ? b.tone : a.tone];
        const dur = 1.8 + ((i * 0.37) % 1.1);
        const lit = !focus || (focus.includes(e.from) && focus.includes(e.to));
        return (
          <g key={`${e.from}-${e.to}`} style={{ opacity: lit ? 1 : 0.12, transition: "opacity .35s" }}>
            <motion.path
              d={d}
              fill="none"
              stroke={focus && lit ? color : "var(--edge)"}
              strokeWidth={focus && lit ? 2 : 1.25}
              style={{ transition: "stroke .35s, stroke-width .35s" }}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.08, ease: [0.65, 0, 0.35, 1] }}
            />
            {animatePackets && (
              <>
                {/* opacidade zero até o caminho terminar de desenhar; sem isso o pacote aparece em (0,0) */}
                <circle r={3} fill={color} opacity={0} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
                  <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} begin={`-${(i * 0.53) % dur}s`} />
                  <animate attributeName="opacity" to="1" dur="0.3s" begin={`${0.9 + i * 0.08}s`} fill="freeze" />
                </circle>
                {e.duplex && (
                  <circle r={2.25} fill="var(--ink)" opacity={0}>
                    <animateMotion
                      dur={`${dur * 1.3}s`}
                      repeatCount="indefinite"
                      path={d}
                      keyPoints="1;0"
                      keyTimes="0;1"
                      calcMode="linear"
                      begin={`-${(i * 0.71) % (dur * 1.3)}s`}
                    />
                    <animate attributeName="opacity" to="0.85" dur="0.3s" begin={`${1.1 + i * 0.08}s`} fill="freeze" />
                  </circle>
                )}
              </>
            )}
            {e.label && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.08 }}>
                <rect x={mid.x - e.label.length * 3.6 - 6} y={mid.y - 9} width={e.label.length * 7.2 + 12} height={18} rx={9} fill="var(--void)" stroke="var(--edge)" />
                <text x={mid.x} y={mid.y + 3.5} textAnchor="middle" className="fill-fog font-mono" fontSize={10}>
                  {e.label}
                </text>
              </motion.g>
            )}
          </g>
        );
      })}

      {nodes.map((n, i) => {
        const b = box(n);
        const color = toneColor[n.tone];
        const dashed = n.tone === "user";
        const lit = !focus || focus.includes(n.id);
        return (
          // o <g> de fora cuida do foco; o motion.g de dentro, da entrada
          <g
            key={n.id}
            style={{
              opacity: lit ? 1 : 0.2,
              transition: "opacity .35s",
              filter: focus && lit ? `drop-shadow(0 0 12px color-mix(in oklab, ${color} 50%, transparent))` : undefined,
            }}
          >
          <motion.g
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={n.tone === "user" ? 26 : 8}
              fill="var(--void-2)"
              stroke={color}
              strokeOpacity={n.tone === "ext" ? 0.5 : 0.9}
              strokeDasharray={dashed ? "3 4" : undefined}
            />
            <text x={b.x + 16} y={b.y + 22} fontSize={14} fontWeight={600} className="fill-ink">
              {n.label}
            </text>
            {n.sub && (
              <text x={b.x + 16} y={b.y + 39} fontSize={11} className="fill-fog">
                {n.sub}
              </text>
            )}
            {n.tone !== "user" && n.tone !== "ext" && <circle cx={b.x + b.w - 14} cy={b.y + 14} r={3} fill={color} />}
          </motion.g>
          </g>
        );
      })}
    </svg>
  );
}
