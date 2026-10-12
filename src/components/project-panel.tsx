"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/projects";
import { laneById } from "@/lib/lanes";
import { EASE_OUT } from "@/lib/motion";
import { ArchDiagram } from "./arch-diagram";

type View = "telas" | "arquitetura";

// troca de conteúdo: opacidade com um desfoque leve para não mostrar os dois estados sobrepostos
const swap = {
  initial: { opacity: 0, filter: "blur(2px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(2px)" },
  transition: { duration: 0.2, ease: EASE_OUT },
};

/**
 * Painel do projeto: prints reais ou a arquitetura. Quando um destaque do texto recebe o
 * cursor (focus), a arquitetura aparece sozinha para mostrar as peças acesas.
 */
export function ProjectPanel({
  project,
  focus,
}: {
  project: Project;
  focus?: string[] | null;
}) {
  const hasScreens = project.screens.length > 0;
  const [view, setView] = useState<View>(hasScreens ? "telas" : "arquitetura");
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const color = laneById[project.lane].color;
  const showArch = !hasScreens || view === "arquitetura" || !!focus;
  const screen = project.screens[idx];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        {hasScreens ? (
          <div
            role="group"
            aria-label="O que mostrar"
            className="flex rounded-full border border-wire p-1"
          >
            {(["telas", "arquitetura"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={!showArch === (v === "telas")}
                onClick={() => setView(v)}
                className={`min-h-9 rounded-full px-4 text-sm transition-[color,background-color,scale] duration-150 ease-out motion-safe:active:scale-[0.96] ${
                  !showArch === (v === "telas")
                    ? "bg-ink/10 text-ink"
                    : "text-fog hover:text-ink"
                }`}
              >
                {v === "telas"
                  ? `Telas (${project.screens.length})`
                  : "Arquitetura"}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-fog">Arquitetura</p>
        )}
        <p className="truncate text-sm text-fog" aria-live="polite">
          {showArch
            ? focus
              ? "Peças envolvidas"
              : "Dados circulando entre as partes"
            : screen.label}
        </p>
      </div>

      <div className="relative aspect-[16/10]">
        <AnimatePresence mode="popLayout" initial={false}>
          {showArch ? (
            <motion.div
              key="arch"
              {...swap}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArchDiagram
                title={project.name}
                nodes={project.diagram.nodes}
                edges={project.diagram.edges}
                focus={focus}
              />
            </motion.div>
          ) : (
            <motion.button
              key={screen.src}
              {...swap}
              type="button"
              onClick={() => setZoom(true)}
              aria-label={`Ampliar a tela ${screen.label} do ${project.name}`}
              className="group absolute inset-0 cursor-zoom-in overflow-hidden rounded-xl outline outline-1 -outline-offset-1 outline-white/10"
            >
              <Image
                src={screen.src}
                alt={`${project.name}: ${screen.label}`}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-[1.02]"
                style={{ objectPosition: screen.position ?? "top" }}
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* a linha de miniaturas sempre reserva espaço: o painel fixo não muda de altura ao trocar de vista */}
      <div className="mt-4 h-[42px] sm:h-[50px]">
        {!showArch && project.screens.length > 1 && (
          <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Telas">
            {project.screens.map((s, i) => (
              <li key={s.src}>
                <button
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Ver tela: ${s.label}`}
                  aria-pressed={i === idx}
                  className="relative block aspect-[16/10] w-16 shrink-0 overflow-hidden sm:w-20 rounded-md outline outline-1 -outline-offset-1 transition-[outline-color,opacity,scale] duration-150 ease-out motion-safe:active:scale-[0.96]"
                  style={{
                    outlineColor: i === idx ? color : "rgb(255 255 255 / 0.1)",
                    opacity: i === idx ? 1 : 0.55,
                  }}
                >
                  <Image
                    src={s.src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* portal no body: dentro do painel fixo ele ficaria preso no contexto de empilhamento do painel */}
      {zoom &&
        createPortal(
          <Lightbox
            project={project}
            index={idx}
            onIndex={setIdx}
            onClose={() => setZoom(false)}
          />,
          document.body,
        )}
    </div>
  );
}

function Lightbox({
  project,
  index,
  onIndex,
  onClose,
}: {
  project: Project;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const total = project.screens.length;
  const screen = project.screens[index];

  // ao abrir: trava a rolagem e foca o "Fechar"; ao fechar: devolve o foco para quem abriu
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    lenis?.stop();
    closeRef.current?.focus();
    return () => {
      lenis?.start();
      opener?.focus?.();
    };
  }, [lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex((index + 1) % total);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + total) % total);
      else if (e.key === "Tab") {
        // o Tab circula só entre os botões do diálogo
        const items = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>("button") ?? [],
        );
        if (!items.length) return;
        const at = items.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey
          ? at <= 0
            ? items.length - 1
            : at - 1
          : (at + 1) % items.length;
        e.preventDefault();
        items[next].focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, total, onIndex, onClose]);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name}: ${screen.label}`}
      className="fixed inset-0 z-[85] flex flex-col items-center justify-center gap-5 bg-void/90 p-4 backdrop-blur-md sm:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="relative w-full max-w-6xl"
        style={{ aspectRatio: `${screen.w} / ${screen.h}`, maxHeight: "78vh" }}
        initial={{ opacity: 0, transform: "scale(0.96)" }}
        animate={{ opacity: 1, transform: "scale(1)" }}
        transition={{ duration: 0.24, ease: EASE_OUT }}
      >
        <Image
          key={screen.src}
          src={screen.src}
          alt={`${project.name}: ${screen.label}`}
          fill
          sizes="100vw"
          className="rounded-xl object-contain outline outline-1 -outline-offset-1 outline-white/10"
        />
      </motion.div>
      <div className="flex w-full max-w-6xl items-center justify-between gap-4 text-sm text-fog">
        <p>
          <span className="text-ink">{project.name}:</span> {screen.label}
          {total > 1 && (
            <span className="tabular-nums">
              {" "}
              ({index + 1} de {total})
            </span>
          )}
        </p>
        <div className="flex gap-2">
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => onIndex((index - 1 + total) % total)}
                className="min-h-10 rounded-full border border-wire px-4 text-ink transition-[border-color,scale] duration-150 ease-out hover:border-ink motion-safe:active:scale-[0.96]"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => onIndex((index + 1) % total)}
                className="min-h-10 rounded-full border border-wire px-4 text-ink transition-[border-color,scale] duration-150 ease-out hover:border-ink motion-safe:active:scale-[0.96]"
              >
                Próxima
              </button>
            </>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-full bg-ink px-4 text-void transition-[scale] duration-150 ease-out motion-safe:active:scale-[0.96]"
          >
            Fechar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
