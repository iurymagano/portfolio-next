import { profile } from "@/data/profile";
import { NeuroField } from "./neuro-field";
import { LocalTime } from "./local-time";
import { ProximityName } from "./proximity-name";

export function Hero({ repos }: { repos: number }) {
  return (
    <section id="inicio" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-8 pt-28 sm:px-10 sm:pb-10">
      <NeuroField className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,black_55%,transparent_98%)]" />

      <div className="relative">
        <div className="text-[clamp(3.5rem,19.5vw,20rem)] text-ink">
          <ProximityName lines={[profile.firstName.toUpperCase(), profile.lastName.toUpperCase()]} />
        </div>

        <div className="mt-8 grid gap-6 border-t border-wire pt-6 text-[15px] sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:gap-10">
          <p className="max-w-[44ch] text-[17px] leading-snug text-ink">
            Desenvolvedor full stack. Construo produtos inteiros, do banco de dados à interface, e coloco no ar.
          </p>
          <p className="leading-snug text-fog">
            {repos} repositórios públicos desde 2021.
            <br />
            TypeScript, React e Node. Agora também Java.
          </p>
          <p className="leading-snug text-fog sm:text-right">
            {profile.city}
            <br />
            <LocalTime timeZone={profile.timeZone} /> por aqui
          </p>
        </div>
      </div>
    </section>
  );
}
