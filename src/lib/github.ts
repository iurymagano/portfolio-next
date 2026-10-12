import { cacheLife } from "next/cache";
import snapshot from "@/data/github-snapshot.json";
import { profile } from "@/data/profile";
import { laneFor, type LaneId } from "./lanes";

export type Repo = {
  name: string;
  description: string | null;
  createdAt: string;
  pushedAt: string;
  url: string;
  homepageUrl: string | null;
  isFork: boolean;
  stars: number;
  language: string | null;
  languageColor: string | null;
  sha: string | null;
  commits: number | null;
};

export type Commit = Repo & { lane: LaneId; message: string };

// Mensagens no estilo commit para repositórios sem descrição (ou com descrição fraca)
const messages: Record<string, string> = {
  zendoc: "IAzen: secretária virtual no WhatsApp para consultórios, com IA",
  react_empresta_ai: "Empresta Aí: app web para emprestar e alugar itens entre vizinhos",
  web_empresta_ai: "Empresta Aí: painel web",
  backend_empresta_ai: "Empresta Aí: API em NestJS com chat em tempo real e cache em Redis",
  tasktray: "TaskTray: gerenciador de tarefas que vive na bandeja do sistema",
  "guild-sync-web": "GroupSync: painel para gerir e monetizar comunidades no Discord",
  "banking-frontend": "Banking: painel do cliente e do administrador",
  "banking-backend": "Banking: API de contas, transações e autenticação",
  "notification-service": "Serviço de notificações em NestJS e Prisma",
  "web-mydoctor": "MyDoctor: agendamento de consultas em Next.js",
  "backend-mydoctor": "MyDoctor: API em Express, Prisma e Socket.io",
  "doctor-mobile": "MyDoctor: app do paciente em Expo",
  globosell: "Globosell: app nativo em React Native CLI",
  "dieta-mobile": "Dieta: app de acompanhamento alimentar em Expo",
  "dieta-backend": "Dieta: API em Express e Prisma",
  pizzaria: "Pizzaria: API de pedidos em Express e Prisma",
  "workshop-spring": "Workshop de Spring Boot",
  xadrez: "Xadrez em C#, para estudar orientação a objetos",
  ignews: "ig.news: blog com assinatura via Stripe",
  rede: "Servidor mínimo em Express",
  "landing-page": "Landing page com login via Firebase e deploy por GitHub Actions",
  "portfolio-react": "Portfólio em React (versão 2022)",
  portfolio: "Primeiro portfólio, em HTML e CSS",
  "desafio-ignite-02": "Desafio Ignite: catálogo de filmes",
  "test-ignite": "Lista de tarefas testada com Jest e Testing Library",
  "bridge-teste": "Teste técnico: landing page",
  "curso-dio-ides-java-intellij": "Primeiros passos em Java com IntelliJ",
  "fundamentos-nodejs": "Fundamentos de Node.js, curso da Rocketseat",
  "carrinho-de-compras": "Carrinho de compras com hooks, desafio da Rocketseat",
  idmoney: "Controle financeiro em React com API simulada no MirageJS",
  calc_imc_rect: "Calculadora de IMC em React",
  finance: "Controle de entradas e saídas em JavaScript puro",
  Modal: "Modal simples em JavaScript",
  "rocket-nftz": "Página de NFTs, desafio da Rocketseat",
  sidebar: "Sidebar animada, desafio da Rocketseat",
  countdonw: "Contagem regressiva, desafio da Rocketseat",
  "store-loja": "Vitrine de loja em JavaScript",
  "project-starbucks": "Página da Starbucks em HTML e CSS, responsiva",
  "react-requicoes-api-json": "Requisições a uma API JSON com React",
  "react-props-style-comp": "Props e styled-components no React",
  "Restaurante-loja": "Restaurante com pedidos pela página",
  "pag-login": "Tela de login para web e mobile com efeitos em CSS",
  "mobile-login": "Tela de login mobile em CSS",
  Calculadora: "Calculadora em HTML, CSS e JavaScript",
  "dark-mode": "Alternância entre tema claro e escuro",
  "Calculadora-IMC": "Calculadora de percentual de gordura",
  "page-medicine": "Página de clínica médica",
  "catalog-car": "Catálogo de carros, o primeiro projeto publicado",
};

const excluded = new Set([profile.githubUser, "git-"]);

function normalize(repos: Repo[]): Commit[] {
  return repos
    .filter((r) => !r.isFork && !excluded.has(r.name))
    .map((r) => ({
      ...r,
      lane: laneFor(r.name, r.language),
      message: messages[r.name] ?? r.description ?? r.name.replace(/[-_]/g, " "),
    }))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

const snapshotRepos = snapshot.repos as Repo[];
const snapshotByName = new Map(snapshotRepos.map((r) => [r.name, r]));

type GraphQLRepo = {
  name: string;
  description: string | null;
  createdAt: string;
  pushedAt: string;
  url: string;
  homepageUrl: string | null;
  isFork: boolean;
  stargazerCount: number;
  primaryLanguage: { name: string; color: string } | null;
  defaultBranchRef: { target: { oid: string; history?: { totalCount: number } } } | null;
};

async function fromGraphQL(token: string): Promise<Repo[]> {
  const query = `query($login: String!) { user(login: $login) { repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, orderBy: {field: CREATED_AT, direction: DESC}) { nodes { name description createdAt pushedAt url homepageUrl isFork stargazerCount primaryLanguage { name color } defaultBranchRef { target { ... on Commit { oid history { totalCount } } } } } } } }`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: profile.githubUser } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
  const json = await res.json();
  const nodes: GraphQLRepo[] = json.data.user.repositories.nodes;
  return nodes.map((n) => ({
    name: n.name,
    description: n.description,
    createdAt: n.createdAt,
    pushedAt: n.pushedAt,
    url: n.url,
    homepageUrl: n.homepageUrl || null,
    isFork: n.isFork,
    stars: n.stargazerCount,
    language: n.primaryLanguage?.name ?? null,
    languageColor: n.primaryLanguage?.color ?? null,
    sha: n.defaultBranchRef?.target.oid ?? null,
    commits: n.defaultBranchRef?.target.history?.totalCount ?? null,
  }));
}

type RestRepo = {
  name: string;
  description: string | null;
  created_at: string;
  pushed_at: string;
  html_url: string;
  homepage: string | null;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
};

// Sem token: a API REST não traz o SHA nem a contagem de commits, então reaproveita o snapshot
async function fromRest(): Promise<Repo[]> {
  const res = await fetch(`https://api.github.com/users/${profile.githubUser}/repos?per_page=100&type=owner`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub REST ${res.status}`);
  const data: RestRepo[] = await res.json();
  return data.map((r) => {
    const known = snapshotByName.get(r.name);
    return {
      name: r.name,
      description: r.description,
      createdAt: r.created_at,
      pushedAt: r.pushed_at,
      url: r.html_url,
      homepageUrl: r.homepage || null,
      isFork: r.fork,
      stars: r.stargazers_count,
      language: r.language,
      languageColor: known?.languageColor ?? null,
      sha: known?.sha ?? null,
      commits: known?.commits ?? null,
    };
  });
}

export async function getHistory(): Promise<{ commits: Commit[]; fetchedAt: string; live: boolean }> {
  "use cache";
  cacheLife("hours");

  const token = process.env.GITHUB_TOKEN;
  try {
    const repos = token ? await fromGraphQL(token) : await fromRest();
    return { commits: normalize(repos), fetchedAt: new Date().toISOString(), live: true };
  } catch {
    return { commits: normalize(snapshotRepos), fetchedAt: snapshot.fetchedAt, live: false };
  }
}
