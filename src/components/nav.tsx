"use client";

import { openPalette } from "@/lib/events";
import { ShortcutKey } from "./shortcut-key";

const links = [
  { href: "#trabalhos", label: "Trabalhos" },
  { href: "#historico", label: "Histórico" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-void via-void/80 to-transparent pb-6">
      <nav className="flex items-center justify-between px-5 py-5 text-[15px] text-ink sm:px-10">
        <a href="#inicio" translate="no" className="font-medium tracking-tight">
          iury magano
        </a>
        <div className="flex items-center gap-7">
          <ul className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="opacity-70 transition-opacity hover:opacity-100">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={openPalette}
            className="group flex items-center gap-2 rounded-full border border-ink/25 px-3.5 py-1.5 transition-colors hover:border-ink"
          >
            <span className="md:hidden">Menu</span>
            <span className="hidden md:inline">Comandos</span>
            <ShortcutKey className="hidden font-mono text-xs opacity-60 md:inline" />
          </button>
        </div>
      </nav>
    </header>
  );
}
