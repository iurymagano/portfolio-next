"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useLenis } from "lenis/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { projects, type DiagramNode, type Project } from "@/data/projects";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { laneById } from "@/lib/lanes";
import { EASE_OUT } from "@/lib/motion";
import { animationsEnabled } from "@/lib/motion-pref";
import { ProjectPanel } from "./project-panel";
import { GlitchName } from "./glitch-name";
import { SplitHeading } from "./split-heading";

export type RepoStats = Record<string, { sha: string | null; commits: number | null }>;

type Focus = { slug: string; nodes: string[]; key: string } | null;

const norm = (s: string) => s.toLowerCase().replace(/[\s.+]/g, "");

// liga um item da stack à peça do diagrama com o mesmo nome, quando existe
function nodeFor(item: string, nodes: DiagramNode[]) {
  const a = norm(item);
  return nodes.find((n) => {
    const b = norm(n.label);
    return a === b || a.startsWith(b) || b.startsWith(a);
  })?.id;
}

function ProjectBlock({
  project,
  index,
  active,
  onActive,
  focus,
  setFocus,
  stats,
}: {
  project: Project;
  index: number;
  active: boolean;
  onActive: (i: number) => void;
  focus: Focus;
  setFocus: (f: Focus) => void;
  stats?: { sha: string | null; commits: number | null };
}) {
  const ref = useRef<HTMLElement>(null);
  const problemRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const color = laneById[project.lane].color;
  const mine = focus?.slug === project.slug ? focus : null;

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  // a frase do problema sobe linha a linha toda vez que o projeto vira o ativo
  useGSAP(
    () => {
      if (!active || !animationsEnabled() || !problemRef.current) return;
      SplitText.create(problemRef.current, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 0.9, ease: "ui.out", stagger: 0.09 }),
      });
    },
    { dependencies: [active], scope: ref, revertOnUpdate: true },
  );

  // hover e foco do teclado acendem; toque alterna
  const bind = (key: string, nodes: string[]) => ({
    onMouseEnter: () => setFocus({ slug: project.slug, nodes, key }),
    onMouseLeave: () => setFocus(null),
    onFocus: () => setFocus({ slug: project.slug, nodes, key }),
    onBlur: () => setFocus(null),
    // no iOS o toque não dá foco ao botão, então o clique também acende
    onClick: () => setFocus({ slug: project.slug, nodes, key }),
    "aria-pressed": mine?.key === key,
  });

  return (
    <article ref={ref} id={`projeto-${project.slug}`} className="flex flex-col justify-center py-16 lg:min-h-[86vh] lg:py-10">
      <p className="flex gap-4 text-sm text-fog">
        <span className="tabular-nums">{project.year}</span>
        <span>{project.kind}</span>
      </p>
      <h3
        translate="no"
        className="vf mt-3 text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.9] tracking-tight transition-[color,font-variation-settings] duration-700 ease-in-out motion-reduce:transition-[color]"
        style={{
          ["--w" as string]: active ? 125 : 90,
          ["--g" as string]: active ? 800 : 500,
          color: active ? "var(--ink)" : "color-mix(in oklab, var(--fog) 55%, transparent)",
        }}
      >
        <GlitchName text={project.name} />
      </h3>

      <p
        ref={problemRef}
        className="vf mt-7 max-w-[26ch] text-balance text-[clamp(1.45rem,2.3vw,2.05rem)] leading-[1.15] text-ink"
        style={{ ["--w" as string]: 106, ["--g" as string]: 540 }}
      >
        {project.problem}
      </p>
      <p className="mt-5 max-w-[52ch] text-pretty text-[16px] leading-relaxed text-fog">{project.summary}</p>

      {/* no celular o painel vem antes dos destaques, para o toque acender algo visível */}
      <div className="mt-8 rounded-3xl border border-wire bg-void-2/50 p-3 lg:hidden">
        <ProjectPanel project={project} focus={mine?.nodes} />
      </div>

      <div className="mt-9 max-w-[54ch]">
        <p className="text-[13px] text-fog">
          <span className="hidden lg:inline">Passe o cursor em cada ponto para ver onde ele acontece na arquitetura, ao lado.</span>
          <span className="lg:hidden">Toque em cada ponto para ver onde ele acontece no diagrama acima.</span>
        </p>
        <ol className="relative mt-3">
          <span aria-hidden className="absolute bottom-4 left-[5px] top-4 w-px" style={{ background: color, opacity: 0.35 }} />
          {project.highlights.map((h, i) => {
            const on = mine?.key === `h${i}`;
            return (
              <li key={h.text}>
                <button type="button" {...bind(`h${i}`, h.nodes)} className="group relative flex w-full gap-4 py-2.5 text-left">
                  <span
                    aria-hidden
                    className="relative z-10 mt-[0.4em] size-[11px] shrink-0 rounded-full border-2 transition-[background-color,scale] duration-300 motion-safe:group-hover:scale-125"
                    style={{ borderColor: color, background: on ? color : "var(--void)" }}
                  />
                  <span className={`text-[16px] leading-snug transition-colors duration-300 ${on ? "text-ink" : "text-ink/70 group-hover:text-ink"}`}>
                    {h.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <p translate="no" className="mt-8 max-w-[60ch] text-[14px] leading-loose text-fog" aria-label="Tecnologias">
        {project.stack.map((s, i) => {
          const node = nodeFor(s, project.diagram.nodes);
          const on = mine?.key === `s${i}`;
          return (
            <Fragment key={s}>
              {node ? (
                <button
                  type="button"
                  {...bind(`s${i}`, [node])}
                  className={`underline decoration-dotted underline-offset-4 transition-colors ${on ? "text-ink decoration-[var(--c)]" : "text-ink/75 decoration-fog/40 hover:text-ink"}`}
                  style={{ ["--c" as string]: color }}
                >
                  {s}
                </button>
              ) : (
                <span>{s}</span>
              )}
              {i < project.stack.length - 1 && (
                <span aria-hidden className="mx-2 text-edge">
                  /
                </span>
              )}
            </Fragment>
          );
        })}
      </p>

      <div className="mt-8 flex max-w-[60ch] flex-wrap items-center gap-x-6 gap-y-3 border-t border-wire pt-5">
        <a href={`https://github.com/iurymagano/${project.repo}`} target="_blank" rel="noreferrer" translate="no" className="font-mono text-[13px] text-fog transition-colors hover:text-ink">
          <span className="text-ink">{project.repo}</span>
          {stats?.sha && <> @ {stats.sha.slice(0, 7)}</>}
        </a>
        {stats?.commits ? <span className="text-[13px] text-fog">{stats.commits} commits</span> : null}
        <span className="flex gap-5 sm:ml-auto">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="text-[15px] text-ink underline decoration-wire decoration-1 underline-offset-[6px] transition-colors hover:decoration-[var(--c)]"
              style={{ ["--c" as string]: color }}
            >
              {l.label}
            </a>
          ))}
        </span>
      </div>

    </article>
  );
}

export function Work({ repos }: { repos: RepoStats }) {
  const [active, setActive] = useState(0);
  const [focus, setFocus] = useState<Focus>(null);
  const lenis = useLenis();
  const current = projects[active];

  const jump = (slug: string) => {
    const el = document.getElementById(`projeto-${slug}`);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -window.innerHeight * 0.07, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="trabalhos" className="relative px-5 pt-32 sm:px-10 lg:pt-44">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <SplitHeading className="vf text-[clamp(3.5rem,11vw,10rem)] leading-[0.82] tracking-tight" style={{ ["--w" as string]: 125, ["--g" as string]: 850 }}>
          Trabalhos
        </SplitHeading>
        <p className="max-w-[46ch] self-end text-pretty text-[17px] leading-relaxed text-fog">
          Cinco sistemas que levei do banco de dados até a tela. Ao lado de cada um, a arquitetura de verdade, com os dados circulando entre as partes.
        </p>
      </div>

      <div className="mt-10 grid gap-16 lg:mt-0 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0">
          {projects.map((p, i) => (
            <ProjectBlock
              key={p.slug}
              project={p}
              index={i}
              active={i === active}
              onActive={setActive}
              focus={focus}
              setFocus={setFocus}
              stats={repos[p.repo]}
            />
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-[12vh] flex h-[76vh] flex-col justify-center">
            <div className="relative rounded-[32px] border border-wire bg-void-2/50 p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                >
                  <ProjectPanel project={current} focus={focus?.slug === current.slug ? focus.nodes : null} />
                </motion.div>
              </AnimatePresence>
            </div>
            <nav aria-label="Projetos" className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {projects.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => jump(p.slug)}
                  aria-current={i === active}
                  className={`relative py-2 text-sm transition-colors ${i === active ? "text-ink" : "text-fog hover:text-ink"}`}
                >
                  {p.name}
                  {i === active && (
                    <motion.span
                      layoutId="work-indicator"
                      className="absolute bottom-0.5 left-0 h-px w-full"
                      style={{ background: laneById[p.lane].color }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
