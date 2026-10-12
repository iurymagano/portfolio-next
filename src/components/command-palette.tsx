"use client";

import { useLenis } from "lenis/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { copyEmail, toast } from "@/lib/events";
import { setPaused, usePaused } from "@/lib/motion-pref";
import { laneById, type LaneId } from "@/lib/lanes";
import { profile } from "@/data/profile";

export type PaletteRepo = {
  name: string;
  url: string;
  message: string;
  lane: LaneId;
};

type Item = {
  id: string;
  group: "Ir para" | "Ações" | "Repositórios";
  label: string;
  detail?: string;
  color?: string;
  keywords?: string;
  secret?: boolean;
  run: () => void;
};

const sections = [
  { id: "inicio", label: "Início" },
  { id: "trabalhos", label: "Trabalhos" },
  { id: "historico", label: "Histórico" },
  { id: "sobre", label: "Sobre" },
  { id: "contato", label: "Contato" },
];

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function CommandPalette({ repos }: { repos: PaletteRepo[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const lenis = useLenis();
  const paused = usePaused();
  const opener = useRef<HTMLElement | null>(null);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => {
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis)
        lenis.scrollTo(el, {
          offset: id === "inicio" ? 0 : -40,
          duration: 1.4,
        });
      else el.scrollIntoView({ behavior: "smooth" });
    };
    const external = (href: string) => () =>
      window.open(href, "_blank", "noopener,noreferrer");

    return [
      ...sections.map((s) => ({
        id: `go-${s.id}`,
        group: "Ir para" as const,
        label: s.label,
        run: go(s.id),
      })),
      {
        id: "email",
        group: "Ações",
        label: "Copiar e-mail",
        detail: profile.email,
        run: () => copyEmail(profile.email),
      },
      {
        id: "github",
        group: "Ações",
        label: "Abrir GitHub",
        detail: "github.com/iurymagano",
        run: external(profile.github),
      },
      {
        id: "linkedin",
        group: "Ações",
        label: "Abrir LinkedIn",
        keywords: "linkedin",
        run: external(profile.linkedin),
      },
      {
        id: "motion",
        group: "Ações",
        label: paused ? "Retomar animações" : "Pausar animações",
        keywords: "animação movimento parar pausar retomar",
        run: () => setPaused(!paused),
      },
      {
        id: "blame",
        group: "Ações",
        label: "git blame",
        keywords: "git blame autor",
        secret: true,
        run: () => toast(`Todas as ${repos.length} branches: ${profile.name}`),
      },
      ...repos.map((r) => ({
        id: `repo-${r.name}`,
        group: "Repositórios" as const,
        label: r.name,
        detail: r.message,
        color: laneById[r.lane].color,
        keywords: `${r.message} ${laneById[r.lane].label}`,
        run: external(r.url),
      })),
    ];
  }, [repos, lenis, paused]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q)
      return items
        .filter((i) => !i.secret && i.group !== "Repositórios")
        .concat(items.filter((i) => i.group === "Repositórios").slice(0, 6));
    return items.filter((i) => {
      const hay = normalize(`${i.label} ${i.detail ?? ""} ${i.keywords ?? ""}`);
      if (i.secret)
        return normalize(i.keywords ?? "").includes(q) && q.length >= 5;
      return q.split(/\s+/).every((part) => hay.includes(part));
    });
  }, [items, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      // guarda quem abriu para devolver o foco ao fechar
      opener.current = document.activeElement as HTMLElement | null;
      lenis?.stop();
      requestAnimationFrame(() => input.current?.focus());
    } else {
      lenis?.start();
      opener.current?.focus?.();
      opener.current = null;
    }
  }, [open, lenis]);

  useEffect(() => {
    list.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (item: Item | undefined) => {
    if (!item) return;
    close();
    // deixa o painel sair antes de rolar
    window.setTimeout(item.run, 120);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      close();
    } else if (e.key === "Tab") {
      // o campo é o único elemento focável: o foco não sai do diálogo
      e.preventDefault();
    }
  };

  let lastGroup = "";

  // sem animação de abrir/fechar: é acionada pelo teclado muitas vezes por dia (como o Raycast)
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex items-start justify-center bg-void/70 px-4 pt-[12vh] backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-wire bg-void-2 shadow-[0_30px_120px_-20px_rgba(92,225,230,0.25)]"
      >
        <div className="flex items-center gap-3 border-b border-wire px-4 transition-colors focus-within:border-web/60">
          <span className="shrink-0 whitespace-nowrap font-mono text-sm text-web">
            ~ $
          </span>
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Procure uma seção, ação ou repositório…"
            aria-label="Comando ou repositório"
            autoComplete="off"
            spellCheck={false}
            className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-fog focus-visible:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={
              results[active] ? `opt-${results[active].id}` : undefined
            }
          />
          <kbd className="rounded border border-wire px-1.5 py-0.5 font-mono text-[11px] text-fog">
            esc
          </kbd>
        </div>
        <ul
          ref={list}
          id="palette-list"
          role="listbox"
          className="max-h-[52vh] overflow-y-auto overscroll-contain p-2"
          data-lenis-prevent
        >
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-fog">
              Nada com “{query}”. Tente o nome de um repositório, como tasktray.
            </li>
          )}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {header && (
                  <p className="px-3 pb-1 pt-3 text-xs text-fog">{header}</p>
                )}
                <div
                  id={`opt-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(item)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${
                    i === active ? "bg-wire/80 text-ink" : "text-ink/80"
                  }`}
                >
                  {item.color ? (
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: item.color }}
                    />
                  ) : (
                    <span className="size-2 shrink-0 rounded-full border border-fog/60" />
                  )}
                  <span
                    translate={item.group === "Repositórios" ? "no" : undefined}
                    className={
                      item.group === "Repositórios"
                        ? "font-mono text-[13px]"
                        : "text-[15px]"
                    }
                  >
                    {item.label}
                  </span>
                  {item.detail && (
                    <span className="ml-auto truncate pl-4 text-sm text-fog">
                      {item.detail}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
