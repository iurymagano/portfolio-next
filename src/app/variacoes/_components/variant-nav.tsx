import { ShortcutKey } from "@/components/shortcut-key";

const links = ["Trabalhos", "Histórico", "Sobre", "Contato"];

// Nav estática das variações: só muda a cor para cada fundo
export function VariantNav({ color, line }: { color: string; line: string }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20" style={{ color }}>
      <nav className="flex items-center justify-between px-5 py-5 text-[15px] sm:px-10">
        <span className="font-medium tracking-tight">iury magano</span>
        <div className="flex items-center gap-7">
          <ul className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <li key={l} className="opacity-70">
                {l}
              </li>
            ))}
          </ul>
          <span className="flex items-center gap-2 rounded-full border px-3.5 py-1.5" style={{ borderColor: line }}>
            <span className="md:hidden">Menu</span>
            <span className="hidden md:inline">Comandos</span>
            <ShortcutKey className="hidden font-mono text-xs opacity-60 md:inline" />
          </span>
        </div>
      </nav>
    </header>
  );
}
