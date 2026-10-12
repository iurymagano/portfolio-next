# iury magano — portfólio

No ar em **[iurymagano.vercel.app](https://iurymagano.vercel.app)**. Cada push na `main` publica sozinho pela Vercel.

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
| Glitch RGB no hover dos nomes de projeto (CSS, fonte real) | `src/components/glitch-name.tsx`, `.glitch` no `globals.css` |
| Números que rolam dígito a dígito (number-flow) | `src/components/repo-count.tsx`, contador do Histórico |
| Botões magnéticos (adaptado do motion-primitives, MIT) | `src/components/magnetic.tsx` |

## Dados do GitHub

`src/lib/github.ts` busca os repositórios com `"use cache"` e `cacheLife("hours")`, então um repositório
novo aparece sozinho em até uma hora. Se a API falhar, cai no snapshot `src/data/github-snapshot.json`.

- Repositório novo sem branch definida: a heurística em `laneFor` decide pelo nome e pela linguagem.
  Para escolher na mão, adicione em `overrides` (`src/lib/lanes.ts`).
- Descrição curta no estilo commit: adicione em `messages` (`src/lib/github.ts`).
- Sistemas com mais de um repositório (front + API + app) viram curvas de merge: `systems` em `src/lib/lanes.ts`.
- Projetos em destaque e diagramas: `src/data/projects.ts`.

## Deploy

Publicado na Vercel com a integração do GitHub (push na `main` vai para produção). Variáveis: `NEXT_PUBLIC_SITE_URL`
(definida) e `GITHUB_TOKEN` (opcional; um token sem nenhum escopo basta para ler dados públicos).

## Animação

Curvas compartilhadas (as do Emil Kowalski) em três lugares que precisam bater: `--ease-ui-*` no
`globals.css` (e `ease-out`/`ease-in-out` do Tailwind), `src/lib/motion.ts` para o Motion e `ui.out`/`ui.inOut`
no GSAP. A paleta ⌘K abre sem animação de propósito: é atalho de teclado, usado muitas vezes.

GSAP 3 (todos os plugins são gratuitos) com `useGSAP`, registrado em `src/lib/gsap.ts`. O Lenis avisa o
ScrollTrigger a cada passo da rolagem. Tudo que anima sozinho para com `prefers-reduced-motion` ou com
"Pausar animações".

O fundo do topo usa o Neuro Noise da [Paper Shaders](https://github.com/paper-design/shaders), com a versão
travada em `0.0.81` porque a biblioteca ainda está em 0.0.x.

## Design

Skills em `.claude/skills/` para o Claude Code seguir o mesmo critério nas próximas mudanças:
`frontend-design` (Anthropic, Apache 2.0), `gsap-*` (oficiais da GreenSock, MIT), `emil-*` (Emil Kowalski,
MIT: auditoria e revisão de animação) e `make-interfaces-feel-better` (Jakub Krehel, MIT: acabamento). A auditoria de
acessibilidade e UX usou a skill `web-design-guidelines` da Vercel, que não vem no repositório; para usar:
`npx skills add vercel-labs/agent-skills --skill web-design-guidelines`. Tokens de cor em `src/app/globals.css`.
Tipografia: Archivo (eixo de largura variável) e JetBrains Mono.
