# iury magano — portfólio

Portfólio pessoal em Next.js 16. A ideia central: a carreira contada como um `git log --graph`.
Cada repositório público vira um commit numa branch (produto, web, API, mobile, fundamentos) e o grafo
é desenhado conforme a página rola. Os projetos principais aparecem como diagramas de arquitetura com
os dados circulando entre as partes.

## Rodar

```bash
pnpm install
cp .env.example .env.local   # opcional
pnpm dev                     # http://localhost:3000
```

## O que tem aqui

| Peça | Arquivo |
| --- | --- |
| Boot de abertura (só CSS, roda uma vez por sessão) | `src/components/boot.tsx` |
| Fios de luz neurais no fundo do hero (shader Neuro Noise da Paper) | `src/components/neuro-field.tsx` |
| Nome em fonte variável que alarga perto do cursor | `src/components/proximity-name.tsx` |
| Diagramas de arquitetura animados | `src/components/arch-diagram.tsx`, dados em `src/data/projects.ts` |
| Histórico em grafo de commits | `src/components/history-graph.tsx`, branches em `src/lib/lanes.ts` |
| Retrato em ASCII com lente que revela a foto | `src/components/ascii-portrait.tsx` |
| Paleta de comandos (⌘K / Ctrl K) | `src/components/command-palette.tsx` |
| Títulos que entram letra a letra (GSAP SplitText) | `src/components/split-heading.tsx` |
| Hashes e comando do Histórico que "decodificam" (GSAP ScrambleText) | `src/components/history-graph.tsx`, `src/components/scramble-on-view.tsx` |
| Pausar animações (rodapé e ⌘K), respeita movimento reduzido | `src/lib/motion-pref.ts` |

## Dados do GitHub

`src/lib/github.ts` busca os repositórios com `"use cache"` e `cacheLife("hours")`, então um repositório
novo aparece sozinho em até uma hora. Se a API falhar, cai no snapshot `src/data/github-snapshot.json`.

- Repositório novo sem branch definida: a heurística em `laneFor` decide pelo nome e pela linguagem.
  Para escolher na mão, adicione em `overrides` (`src/lib/lanes.ts`).
- Descrição curta no estilo commit: adicione em `messages` (`src/lib/github.ts`).
- Sistemas com mais de um repositório (front + API + app) viram curvas de merge: `systems` em `src/lib/lanes.ts`.
- Projetos em destaque e diagramas: `src/data/projects.ts`.

## Deploy

Vercel: importe o repositório, defina `GITHUB_TOKEN` (opcional) e `NEXT_PUBLIC_SITE_URL`.

## Animação

GSAP 3 (todos os plugins são gratuitos) com `useGSAP`, registrado em `src/lib/gsap.ts`. O Lenis avisa o
ScrollTrigger a cada passo da rolagem. Tudo que anima sozinho para com `prefers-reduced-motion` ou com
"Pausar animações".

O fundo do topo usa o Neuro Noise da [Paper Shaders](https://github.com/paper-design/shaders), com a versão
travada em `0.0.81` porque a biblioteca ainda está em 0.0.x.

## Design

Skills em `.claude/skills/` para o Claude Code seguir o mesmo critério nas próximas mudanças:
`frontend-design` (Anthropic, Apache 2.0) e `gsap-*` (oficiais da GreenSock, MIT). A auditoria de
acessibilidade e UX usou a skill `web-design-guidelines` da Vercel, que não vem no repositório; para usar:
`npx skills add vercel-labs/agent-skills --skill web-design-guidelines`. Tokens de cor em `src/app/globals.css`.
Tipografia: Archivo (eixo de largura variável) e JetBrains Mono.
