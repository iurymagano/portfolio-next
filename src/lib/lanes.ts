export type LaneId = "produto" | "web" | "api" | "mobile" | "base";

export type Lane = {
  id: LaneId;
  label: string;
  color: string;
  hint: string;
};

// A ordem define a coluna de cada branch no grafo
export const lanes: Lane[] = [
  { id: "produto", label: "Produto", color: "var(--lane-produto)", hint: "SaaS e apps completos" },
  { id: "web", label: "Web", color: "var(--lane-web)", hint: "Interfaces e front-end" },
  { id: "api", label: "API", color: "var(--lane-api)", hint: "Back-end e serviços" },
  { id: "mobile", label: "Mobile", color: "var(--lane-mobile)", hint: "React Native e Expo" },
  { id: "base", label: "Fundamentos", color: "var(--lane-base)", hint: "Estudos e desafios" },
];

export const laneById = Object.fromEntries(lanes.map((l) => [l.id, l])) as Record<LaneId, Lane>;

const overrides: Record<string, LaneId> = {
  zendoc: "produto",
  "guild-sync-web": "produto",
  tasktray: "produto",
  react_empresta_ai: "produto",
  web_empresta_ai: "produto",
  backend_empresta_ai: "api",
  "runtime-game": "produto",
  "banking-frontend": "web",
  "banking-backend": "api",
  "notification-service": "api",
  "web-mydoctor": "web",
  "backend-mydoctor": "api",
  "doctor-mobile": "mobile",
  globosell: "mobile",
  "dieta-mobile": "mobile",
  "dieta-backend": "api",
  pizzaria: "api",
  "fundamentos-nodejs": "api",
  "workshop-spring": "api",
  xadrez: "base",
  "curso-dio-ides-java-intellij": "base",
  ignews: "web",
  idmoney: "web",
  rede: "api",
  "landing-page": "web",
  "bridge-teste": "web",
  "portfolio-react": "web",
  "carrinho-de-compras": "web",
  calc_imc_rect: "web",
  "desafio-ignite-02": "web",
  "test-ignite": "web",
  "react-requicoes-api-json": "web",
  "react-props-style-comp": "web",
};

// Repositórios novos que ainda não estão no mapa caem numa heurística por nome e linguagem
export function laneFor(name: string, language: string | null): LaneId {
  if (overrides[name]) return overrides[name];
  const n = name.toLowerCase();
  if (/(backend|api|service|server)/.test(n)) return "api";
  if (/(mobile|app-?rn|expo)/.test(n)) return "mobile";
  if (/(web|front|site|landing)/.test(n)) return "web";
  if (language === "Java" || language === "Go" || language === "Python") return "api";
  if (language === "HTML" || language === "CSS" || language === "C#" || language === null) return "base";
  if (language === "JavaScript") return "base";
  return "web";
}

// Repositórios que formam um mesmo sistema; viram "merges" no grafo
export const systems: { id: string; label: string; repos: string[] }[] = [
  { id: "empresta", label: "Empresta Aí", repos: ["backend_empresta_ai", "web_empresta_ai", "react_empresta_ai"] },
  { id: "banking", label: "Banking", repos: ["banking-frontend", "banking-backend"] },
  { id: "mydoctor", label: "MyDoctor", repos: ["web-mydoctor", "backend-mydoctor", "doctor-mobile"] },
  { id: "dieta", label: "Dieta", repos: ["dieta-mobile", "dieta-backend"] },
];
