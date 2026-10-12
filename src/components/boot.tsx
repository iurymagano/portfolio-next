/**
 * Sequência de abertura. É só CSS: cada linha aparece com um atraso e a tela
 * inteira recolhe sozinha, então nunca trava a página mesmo sem JavaScript.
 * O script inline do layout esconde o boot nas visitas seguintes da sessão.
 */
export function Boot({ repos, commits }: { repos: number; commits: number }) {
  const lines: { text: string; kind: "cmd" | "out" | "ok"; at: number }[] = [
    { text: "git clone github.com/iurymagano", kind: "cmd", at: 0.1 },
    { text: `Recebendo ${repos} repositórios`, kind: "out", at: 0.45 },
    { text: `${commits} commits, desde julho de 2021`, kind: "out", at: 0.7 },
    { text: "pnpm build", kind: "cmd", at: 1.0 },
    { text: "Compilado. Abrindo.", kind: "ok", at: 1.45 },
  ];

  return (
    <div
      aria-hidden
      className="boot fixed inset-0 z-[70] flex items-end bg-void px-5 pb-10 font-mono text-[13px] leading-7 sm:px-10 sm:pb-14 sm:text-sm"
    >
      <div>
        {lines.map((l) => (
          <p key={l.text} className="boot-line" style={{ animationDelay: `${l.at}s` }}>
            {l.kind === "cmd" && <span className="text-web">~ $ </span>}
            <span className={l.kind === "cmd" ? "text-ink" : l.kind === "ok" ? "text-produto" : "text-fog"}>
              {l.kind !== "cmd" && "  "}
              {l.text}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}
