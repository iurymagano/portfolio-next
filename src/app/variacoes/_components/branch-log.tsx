"use client";

import { motion } from "motion/react";
import { systems, type LaneId } from "@/lib/lanes";

export type LogCommit = { name: string; message: string; url: string; createdAt: string; lane: LaneId; sha: string | null };

const order: LaneId[] = ["produto", "web", "api", "mobile", "base"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const monthYear = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/** git log em tamanho de cartaz: branches grossas, os commits mais recentes e o HEAD no topo */
export function BranchLog({
  commits,
  colors,
  paper,
  ink,
  muted,
  rowHeight = 44,
  compact = false,
}: {
  /** versão estreita para celular: branches mais juntas e sem a etiqueta HEAD */
  compact?: boolean;
  commits: LogCommit[];
  colors: Record<LaneId, string>;
  paper: string;
  ink: string;
  muted: string;
  rowHeight?: number;
}) {
  const GAP = compact ? 18 : 30;
  const PAD = compact ? 10 : 16;
  const R = compact ? 6 : 9;
  const width = PAD * 2 + (order.length - 1) * GAP;
  const height = commits.length * rowHeight;
  const x = (lane: LaneId) => PAD + order.indexOf(lane) * GAP;
  const y = (i: number) => i * rowHeight + rowHeight / 2;

  const row = new Map(commits.map((c, i) => [c.name, i]));
  const merges = systems.flatMap((s) => {
      const rows = s.repos.map((r) => row.get(r)).filter((r): r is number => r !== undefined).sort((a, b) => a - b);
      return rows.slice(1).map((r, i) => {
        const a = commits[rows[i]];
        const b = commits[r];
        const x1 = x(a.lane);
        const y1 = y(rows[i]);
        const x2 = x(b.lane);
        const y2 = y(r);
        return { id: `${s.id}-${i}`, lane: a.lane, d: `M${x1},${y1} C${x1},${y1 + rowHeight * 0.75} ${x2},${y2 - rowHeight * 0.75} ${x2},${y2}` };
      });
  });

  return (
    <div className="relative" style={{ height }}>
      <svg width={width} height={height + 80} className="absolute -top-10 left-0 overflow-visible" aria-hidden>
        <g transform="translate(0 40)">
          {order.map((lane, i) => (
            <motion.line
              key={lane}
              x1={x(lane)}
              x2={x(lane)}
              y1={compact ? -12 : -60}
              y2={height + 8}
              stroke={colors[lane]}
              strokeWidth={compact ? 4 : 6}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.3, delay: 0.15 + i * 0.1, ease: [0.65, 0, 0.35, 1] }}
            />
          ))}
          {merges.map((m, i) => (
            <motion.path
              key={m.id}
              d={m.d}
              fill="none"
              stroke={colors[m.lane]}
              strokeWidth={4}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 1 + i * 0.1 }}
            />
          ))}
          {commits.map((c, i) => (
            <motion.circle
              key={c.name}
              cx={x(c.lane)}
              cy={y(i)}
              r={R}
              fill={paper}
              stroke={colors[c.lane]}
              strokeWidth={compact ? 4 : 5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 20, delay: 0.5 + i * 0.06 }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          ))}
          <circle cx={x(commits[0].lane)} cy={y(0)} r={R} fill="none" stroke={colors[commits[0].lane]} strokeWidth={2}>
            <animate attributeName="r" values={`${R};${R * 2.4}`} dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>

      <ol className="relative" style={{ paddingLeft: width + 12 }}>
        {commits.map((c, i) => (
          <motion.li
            key={c.name}
            className="flex items-center gap-4"
            style={{ height: rowHeight }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.06 }}
          >
            <a href={c.url} target="_blank" rel="noreferrer" className="group flex min-w-0 flex-1 items-baseline gap-3">
              <span className={`truncate font-mono font-medium ${compact ? "text-[14px]" : "text-[15px]"} transition-colors group-hover:underline`} style={{ color: ink }}>
                {c.name}
              </span>
              {i === 0 && !compact && (
                <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px]" style={{ background: ink, color: paper }}>
                  HEAD -&gt; main
                </span>
              )}
            </a>
            <span className="shrink-0 whitespace-nowrap text-sm tabular-nums" style={{ color: muted }}>
              {monthYear(c.createdAt)}
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
