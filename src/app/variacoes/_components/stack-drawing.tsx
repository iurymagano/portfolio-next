// "Full stack" medido ao pé da letra: a altura da pilha, cotada como num desenho técnico
const nodes = [
  { label: "Interface", sub: "React, Next.js, React Native", x: 0, y: 12 },
  { label: "API", sub: "Node, NestJS, Java", x: 150, y: 124 },
  { label: "Banco de dados", sub: "PostgreSQL, Redis, Prisma", x: 300, y: 236 },
];
const W = 190;
const H = 60;
const links = ["M95,72 V154 H150", "M245,184 V266 H300"];

export function StackDrawing({ ink, accent }: { ink: string; accent: string }) {
  return (
    <svg viewBox="0 0 560 310" className="h-auto w-full overflow-visible" role="img" aria-label="Pilha: interface, API e banco de dados">
      {nodes.map((n) => (
        <g key={n.label}>
          <rect x={n.x} y={n.y} width={W} height={H} fill="none" stroke={ink} strokeWidth={1.5} />
          <text x={n.x + 16} y={n.y + 25} fill={ink} fontSize={16} fontWeight={600}>
            {n.label}
          </text>
          <text x={n.x + 16} y={n.y + 45} fill={ink} fillOpacity={0.65} fontSize={12}>
            {n.sub}
          </text>
        </g>
      ))}

      {links.map((d, i) => (
        <g key={d}>
          <path d={d} fill="none" stroke={ink} strokeWidth={1.5} />
          <circle r={4} fill={accent}>
            <animateMotion dur="2.4s" repeatCount="indefinite" path={d} begin={`-${i * 0.8}s`} />
          </circle>
          <circle r={3} fill={ink}>
            <animateMotion dur="3.1s" repeatCount="indefinite" path={d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" begin={`-${i * 1.3}s`} />
          </circle>
        </g>
      ))}

      {/* linhas de chamada e cota */}
      <g stroke={ink} strokeOpacity={0.55} strokeWidth={1}>
        <path d="M196,12 H540" strokeDasharray="4 5" />
        <path d="M496,296 H540" strokeDasharray="4 5" />
        <path d="M530,12 V296" />
        <path d="M524,18 L536,6 M524,302 L536,290" />
      </g>
      <text x={548} y={154} fill={ink} fontSize={13} transform="rotate(90 548 154)" textAnchor="middle" className="font-mono">
        full stack
      </text>
    </svg>
  );
}
