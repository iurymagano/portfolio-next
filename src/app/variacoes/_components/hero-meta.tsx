import { LocalTime } from "@/components/local-time";
import { profile } from "@/data/profile";

// Linha de apresentação compartilhada pelas variações; cada uma passa suas cores
export function HeroMeta({ repos, ink, muted, line }: { repos: number; ink: string; muted: string; line: string }) {
  return (
    <div
      className="grid gap-6 border-t pt-6 text-[15px] sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:gap-10"
      style={{ borderColor: line }}
    >
      <p className="max-w-[44ch] text-[17px] leading-snug" style={{ color: ink }}>
        Desenvolvedor full stack. Construo produtos inteiros, do banco de dados à interface, e coloco no ar.
      </p>
      <p className="leading-snug" style={{ color: muted }}>
        {repos} repositórios públicos desde 2021.
        <br />
        TypeScript, React e Node. Agora também Java.
      </p>
      <p className="leading-snug sm:text-right" style={{ color: muted }}>
        {profile.city}
        <br />
        <LocalTime timeZone={profile.timeZone} /> por aqui
      </p>
    </div>
  );
}
