import type { LaneId } from "@/lib/lanes";

export type NodeTone = LaneId | "user" | "ext";

export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  tone: NodeTone;
};

export type DiagramEdge = {
  from: string;
  to: string;
  duplex?: boolean;
  label?: string;
};

export type Highlight = {
  text: string;
  /** peças do diagrama que acendem quando o destaque recebe o cursor */
  nodes: string[];
};

export type Screen = {
  src: string;
  label: string;
  w: number;
  h: number;
  /** object-position quando o print é cortado para caber no painel */
  position?: string;
};

export type Project = {
  slug: string;
  name: string;
  /** repositório principal, de onde vêm hash e contagem de commits */
  repo: string;
  year: string;
  kind: string;
  lane: LaneId;
  /** o problema de quem usa, numa frase */
  problem: string;
  summary: string;
  highlights: Highlight[];
  stack: string[];
  links: { label: string; href: string }[];
  /** prints reais, capturados do projeto rodando */
  screens: Screen[];
  diagram: { nodes: DiagramNode[]; edges: DiagramEdge[] };
};

const gh = (repo: string) => `https://github.com/iurymagano/${repo}`;

// Diagramas desenhados num viewBox de 520 x 380
export const projects: Project[] = [
  {
    slug: "iazen",
    name: "IAzen",
    repo: "zendoc",
    year: "2026",
    kind: "SaaS para saúde",
    lane: "produto",
    problem: "Quem atende sozinho perde horas no WhatsApp marcando e remarcando consulta.",
    summary:
      "O IAzen coloca uma secretária virtual no número do psicólogo, da nutricionista, do fisioterapeuta. Ela conversa com o paciente, encontra um horário livre, agenda, confirma e lembra.",
    highlights: [
      { text: "Agente com Claude que conversa em português e consulta a agenda real antes de responder", nodes: ["claude", "app", "db"] },
      { text: "WhatsApp integrado pela Evolution API, hospedada em Docker", nodes: ["paciente", "evo", "app"] },
      { text: "Assinatura mensal com Stripe e teste de 7 dias sem cartão", nodes: ["pro", "app", "stripe"] },
    ],
    stack: ["Next.js 16", "TypeScript", "Tailwind v4", "Supabase", "NextAuth v5", "Claude API", "Evolution API", "Stripe"],
    links: [{ label: "Código", href: gh("zendoc") }],
    screens: [
      { src: "/img/projetos/iazen/inicio.webp", label: "Página inicial", w: 1440, h: 900 },
      { src: "/img/projetos/iazen/login.webp", label: "Login", w: 1440, h: 900 },
    ],
    diagram: {
      nodes: [
        { id: "paciente", label: "Paciente", sub: "no WhatsApp", x: 10, y: 30, tone: "user" },
        { id: "evo", label: "Evolution API", sub: "ponte com o WhatsApp", x: 10, y: 164, tone: "ext" },
        { id: "app", label: "Next.js 16", sub: "webhook, agenda, painel", x: 190, y: 164, tone: "produto" },
        { id: "claude", label: "Claude", sub: "secretária virtual", x: 370, y: 30, tone: "ext" },
        { id: "db", label: "Supabase", sub: "Postgres", x: 370, y: 164, tone: "api" },
        { id: "stripe", label: "Stripe", sub: "assinatura", x: 370, y: 298, tone: "ext" },
        { id: "pro", label: "Profissional", sub: "painel web", x: 190, y: 298, tone: "user" },
      ],
      edges: [
        { from: "paciente", to: "evo", duplex: true },
        { from: "evo", to: "app", duplex: true, label: "webhook" },
        { from: "app", to: "claude", duplex: true },
        { from: "app", to: "db", duplex: true },
        { from: "app", to: "stripe" },
        { from: "pro", to: "app", duplex: true },
      ],
    },
  },
  {
    slug: "empresta-ai",
    name: "Empresta Aí",
    repo: "backend_empresta_ai",
    year: "2025",
    kind: "Marketplace",
    lane: "produto",
    problem: "Todo mundo tem uma furadeira parada. O vizinho precisa dela por uma tarde.",
    summary:
      "Plataforma para emprestar e alugar objetos entre pessoas, com catálogo por categoria e localização, reserva com calendário, chat entre as partes e reputação construída por avaliações.",
    highlights: [
      { text: "API em NestJS sobre Fastify, com JWT e documentação em Swagger", nodes: ["api", "swagger"] },
      { text: "Chat e notificações em tempo real com Socket.io", nodes: ["user", "web", "api"] },
      { text: "Cache em Redis com invalidação e fotos no Cloudflare R2", nodes: ["api", "redis", "r2", "pg"] },
    ],
    stack: ["NestJS", "Fastify", "Drizzle ORM", "PostgreSQL", "Redis", "Socket.io", "React", "TanStack Query", "Docker"],
    links: [
      { label: "API", href: gh("backend_empresta_ai") },
      { label: "Front-end", href: gh("react_empresta_ai") },
    ],
    screens: [
      { src: "/img/projetos/empresta-ai/login.webp", label: "Login", w: 1440, h: 900 },
      { src: "/img/projetos/empresta-ai/cadastro.webp", label: "Cadastro", w: 1440, h: 900 },
    ],
    diagram: {
      nodes: [
        { id: "user", label: "Usuários", sub: "quem empresta e quem pega", x: 10, y: 30, w: 170, tone: "user" },
        { id: "web", label: "React + Vite", sub: "React Query e Radix", x: 10, y: 164, tone: "web" },
        { id: "api", label: "NestJS", sub: "Fastify, JWT, WebSocket", x: 190, y: 164, tone: "api" },
        { id: "pg", label: "PostgreSQL", sub: "Drizzle ORM", x: 370, y: 30, tone: "api" },
        { id: "redis", label: "Redis", sub: "cache de consultas", x: 370, y: 164, tone: "api" },
        { id: "r2", label: "Cloudflare R2", sub: "fotos dos itens", x: 370, y: 298, tone: "ext" },
        { id: "swagger", label: "Swagger", sub: "documentação viva", x: 190, y: 298, tone: "ext" },
      ],
      edges: [
        { from: "user", to: "web", duplex: true },
        { from: "web", to: "api", duplex: true, label: "chat" },
        { from: "api", to: "pg", duplex: true },
        { from: "api", to: "redis", duplex: true },
        { from: "api", to: "r2" },
        { from: "api", to: "swagger" },
      ],
    },
  },
  {
    slug: "groupsync",
    name: "GroupSync",
    repo: "guild-sync-web",
    year: "2025",
    kind: "SaaS para comunidades",
    lane: "produto",
    problem: "Cobrar por uma comunidade no Discord vira trabalho manual: quem pagou, quem saiu, quem tem qual cargo.",
    summary:
      "Painel para conectar o servidor, definir regras e automações, gerenciar cargos e banimentos, disparar campanhas e acompanhar tudo em relatórios, com planos cobrados por checkout.",
    highlights: [
      { text: "Planos pagos ligados aos cargos do servidor", nodes: ["member", "stripe", "api", "discord"] },
      { text: "Telas de dashboard, regras, automações, campanhas e relatórios", nodes: ["admin", "web"] },
      { text: "Componentes próprios sobre Radix e dados sincronizados com React Query", nodes: ["web", "api"] },
    ],
    stack: ["React", "TypeScript", "Vite", "Radix UI", "Tailwind CSS", "React Query"],
    links: [{ label: "Código", href: gh("guild-sync-web") }],
    screens: [
      { src: "/img/projetos/groupsync/dashboard.webp", label: "Dashboard", w: 1440, h: 900 },
      { src: "/img/projetos/groupsync/analytics.webp", label: "Analytics", w: 1440, h: 900 },
      { src: "/img/projetos/groupsync/automacoes.webp", label: "Automações", w: 1440, h: 900 },
      { src: "/img/projetos/groupsync/inicio.webp", label: "Página inicial", w: 1440, h: 900 },
    ],
    diagram: {
      nodes: [
        { id: "admin", label: "Dono do servidor", sub: "navegador", x: 10, y: 30, tone: "user" },
        { id: "web", label: "Painel React", sub: "Radix e Tailwind", x: 10, y: 164, tone: "produto" },
        { id: "api", label: "API GroupSync", sub: "regras e automações", x: 190, y: 164, tone: "api" },
        { id: "discord", label: "Discord", sub: "membros e cargos", x: 370, y: 30, tone: "ext" },
        { id: "stripe", label: "Checkout", sub: "planos pagos", x: 370, y: 298, tone: "ext" },
        { id: "member", label: "Membro", sub: "assina um plano", x: 190, y: 298, tone: "user" },
      ],
      edges: [
        { from: "admin", to: "web", duplex: true },
        { from: "web", to: "api", duplex: true },
        { from: "api", to: "discord", duplex: true, label: "cargos" },
        { from: "member", to: "stripe" },
        { from: "stripe", to: "api", label: "webhook" },
      ],
    },
  },
  {
    slug: "tasktray",
    name: "TaskTray",
    repo: "tasktray",
    year: "2025",
    kind: "App desktop",
    lane: "produto",
    problem: "Uma lista de tarefas não deveria disputar espaço com as janelas abertas.",
    summary: "O TaskTray mora na bandeja do sistema: abre com Ctrl + K, funciona sem internet e roda em macOS, Windows e Linux.",
    highlights: [
      { text: "Instaladores para os três sistemas e atualização automática", nodes: ["tray", "main", "updater"] },
      { text: "Reordenação por arrastar e soltar", nodes: ["you", "ui"] },
      { text: "Tudo salvo localmente, sem conta e sem servidor", nodes: ["ui", "main", "store"] },
    ],
    stack: ["Electron", "React", "TypeScript", "Vite", "Framer Motion", "electron-store"],
    links: [{ label: "Código", href: gh("tasktray") }],
    screens: [
      { src: "/img/projetos/tasktray/bandeja.webp", label: "Aberto na bandeja do sistema", w: 1600, h: 1072, position: "right top" },
    ],
    diagram: {
      nodes: [
        { id: "you", label: "Você", sub: "Ctrl + K", x: 10, y: 30, tone: "user" },
        { id: "tray", label: "Bandeja", sub: "macOS, Windows, Linux", x: 10, y: 164, tone: "ext" },
        { id: "main", label: "Electron main", sub: "janela e sistema", x: 190, y: 164, tone: "produto" },
        { id: "ui", label: "React", sub: "arrastar e soltar", x: 190, y: 30, tone: "web" },
        { id: "store", label: "electron-store", sub: "offline, em disco", x: 370, y: 164, tone: "api" },
        { id: "updater", label: "Atualizações", sub: "electron-updater", x: 370, y: 298, tone: "ext" },
      ],
      edges: [
        { from: "you", to: "ui", duplex: true },
        { from: "tray", to: "main", duplex: true },
        { from: "ui", to: "main", duplex: true, label: "IPC" },
        { from: "main", to: "store", duplex: true },
        { from: "updater", to: "main" },
      ],
    },
  },
  {
    slug: "mydoctor",
    name: "MyDoctor",
    repo: "web-mydoctor",
    year: "2023",
    kind: "Agendamento médico",
    lane: "web",
    problem: "Clínica e paciente olhando para agendas diferentes é consulta perdida.",
    summary:
      "Agendamento em três frentes: painel web para a clínica, app para o paciente e uma API que mantém a agenda sincronizada entre os dois, ao vivo.",
    highlights: [
      { text: "Agenda atualizada ao vivo com Socket.io", nodes: ["web", "app", "api", "pg"] },
      { text: "Envio de documentos e fotos, até pela webcam, com Uppy e Cloudinary", nodes: ["web", "api", "cdn"] },
      { text: "NextAuth no painel e JWT na API", nodes: ["web", "api"] },
    ],
    stack: ["Next.js", "Expo", "Express", "Prisma", "PostgreSQL", "Socket.io", "Zustand"],
    links: [
      { label: "Ver online", href: "https://web-mydoctor.vercel.app" },
      { label: "Web", href: gh("web-mydoctor") },
      { label: "API", href: gh("backend-mydoctor") },
    ],
    screens: [
      { src: "/img/projetos/mydoctor/login.webp", label: "Login", w: 1440, h: 900 },
    ],
    diagram: {
      nodes: [
        { id: "web", label: "Next.js", sub: "painel da clínica", x: 10, y: 30, tone: "web" },
        { id: "app", label: "Expo", sub: "app do paciente", x: 10, y: 298, tone: "mobile" },
        { id: "api", label: "Express", sub: "Prisma e Socket.io", x: 190, y: 164, tone: "api" },
        { id: "pg", label: "PostgreSQL", sub: "consultas e agenda", x: 370, y: 30, tone: "api" },
        { id: "cdn", label: "Cloudinary", sub: "documentos e fotos", x: 370, y: 164, tone: "ext" },
        { id: "mail", label: "Nodemailer", sub: "e-mails", x: 370, y: 298, tone: "ext" },
      ],
      edges: [
        { from: "web", to: "api", duplex: true, label: "ao vivo" },
        { from: "app", to: "api", duplex: true },
        { from: "api", to: "pg", duplex: true },
        { from: "api", to: "cdn" },
        { from: "api", to: "mail" },
      ],
    },
  },
];
