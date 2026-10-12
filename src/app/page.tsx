import { About } from "@/components/about";
import { Boot } from "@/components/boot";
import { CommandPalette } from "@/components/command-palette";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { HistoryGraph } from "@/components/history-graph";
import { Nav } from "@/components/nav";
import { ScrambleOnView } from "@/components/scramble-on-view";
import { ShortcutKey } from "@/components/shortcut-key";
import { SplitHeading } from "@/components/split-heading";
import { MotionToggle } from "@/components/motion-toggle";
import { Toaster } from "@/components/toaster";
import { Work } from "@/components/work";
import { getHistory } from "@/lib/github";

const synced = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

export default async function Home() {
  const { commits, fetchedAt } = await getHistory();
  const totalCommits = commits.reduce((n, c) => n + (c.commits ?? 0), 0);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-void"
      >
        Pular para o conteúdo
      </a>
      <Boot repos={commits.length} commits={totalCommits} />
      <Nav />

      <main id="conteudo">
        <Hero repos={commits.length} />
        <Work repos={Object.fromEntries(commits.map((c) => [c.name, { sha: c.sha, commits: c.commits }]))} />

        <section id="historico" className="relative px-5 pt-40 sm:px-10 lg:pt-56">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <SplitHeading className="vf text-[clamp(3.5rem,11vw,10rem)] leading-[0.82] tracking-tight" style={{ ["--w" as string]: 125, ["--g" as string]: 850 }}>
              Histórico
            </SplitHeading>
            <div className="self-end">
              <ScrambleOnView text='git log --graph --author="Iury Magano"' className="font-mono text-sm text-web" />
              <p className="mt-4 max-w-[48ch] text-[17px] leading-relaxed text-fog">
                Todos os {commits.length} repositórios públicos, do mais novo ao primeiro, cada um na branch do que ele é. As curvas ligam as partes de um mesmo sistema.
              </p>
            </div>
          </div>
          <div className="mt-16">
            <HistoryGraph
              commits={commits.map(({ name, message, url, homepageUrl, language, createdAt, sha, commits, lane }) => ({
                name,
                message,
                url,
                homepageUrl,
                language,
                createdAt,
                sha,
                commits,
                lane,
              }))}
            />
          </div>
        </section>

        <About />
        <Contact />
      </main>

      <footer className="flex flex-col gap-3 border-t border-wire px-5 py-8 text-sm text-fog sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>Feito por Iury Magano com Next.js, Motion e Lenis.</p>
        <p>Histórico sincronizado com o GitHub em {synced.format(new Date(fetchedAt))}.</p>
        <p className="hidden sm:block">
          Aperte <ShortcutKey className="font-mono text-ink" /> para navegar pelo teclado.
        </p>
        <MotionToggle />
      </footer>

      <CommandPalette repos={commits.map((c) => ({ name: c.name, url: c.url, message: c.message, lane: c.lane }))} />
      <Toaster />
    </>
  );
}
