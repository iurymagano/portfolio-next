import { stack } from "@/data/profile";
import { AsciiPortrait } from "./ascii-portrait";
import { SplitHeading } from "./split-heading";

export function About() {
  return (
    <section id="sobre" className="relative px-5 pt-40 sm:px-10 lg:pt-56">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <figure className="lg:sticky lg:top-[12vh] lg:self-start">
          <AsciiPortrait src="/img/iury.jpg" alt="Iury no alto de um mirante, com Florianópolis ao fundo" className="aspect-square w-full max-w-[560px] cursor-crosshair touch-none" />
          <figcaption className="mt-4 text-sm text-fog">Passe o cursor ou o dedo sobre o retrato. Florianópolis ao fundo.</figcaption>
        </figure>

        <div>
          <SplitHeading className="vf text-[clamp(3.5rem,11vw,10rem)] leading-[0.82] tracking-tight" style={{ ["--w" as string]: 125, ["--g" as string]: 850 }}>
            Sobre
          </SplitHeading>
          <div className="mt-10 max-w-[58ch] space-y-6 text-pretty text-[19px] leading-relaxed text-ink/90">
            <p>
              Sou o Iury, desenvolvedor full stack em Florianópolis. Comecei em 2021 com HTML, CSS e uma pilha de calculadoras. Hoje construo produtos completos em TypeScript, do schema do banco ao último estado da interface.
            </p>
            <p className="text-fog">
              Gosto de pegar um problema real e levar até produção: entender quem usa, modelar os dados, desenhar a API, cuidar de cada tela e colocar no ar. Já fiz isso na web, no celular, no desktop e, mais recentemente, com IA conversando com pacientes no WhatsApp.
            </p>
          </div>

          <dl className="mt-14 grid max-w-[58ch] grid-cols-[8.5rem_1fr] gap-x-6 gap-y-4 border-t border-wire pt-8 text-[15px]">
            <dt className="text-fog">Construindo</dt>
            <dd className="text-ink">IAzen, a secretária virtual para consultórios</dd>
            <dt className="text-fog">Estudando</dt>
            <dd className="text-ink">Java, Spring e system design</dd>
            <dt className="text-fog">Base</dt>
            <dd className="text-ink">Florianópolis, Santa Catarina</dd>
          </dl>

          <h3 className="mt-20 text-sm text-fog">Ferramentas que uso no dia a dia</h3>
          <dl className="mt-6 max-w-[64ch] divide-y divide-wire border-y border-wire">
            {stack.map((s) => (
              <div key={s.group} className="grid gap-2 py-5 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                <dt className="text-[15px] text-fog">{s.group}</dt>
                <dd translate="no" className="text-[15px] leading-relaxed text-ink">{s.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
