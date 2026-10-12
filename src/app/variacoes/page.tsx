import type { Metadata } from "next";
import { ScaledFrame } from "./_components/scaled-frame";

export const metadata: Metadata = { title: "Variações da home", robots: { index: false } };

const options = [
  {
    href: "/",
    name: "Atual",
    text: "Fundo escuro com o campo de glifos. Fica aqui só para comparar.",
  },
  {
    href: "/variacoes/planta",
    name: "Planta",
    text: "Azul-cobalto em papel quadriculado, como um desenho técnico. A pilha interface, API e banco aparece cotada como “full stack”.",
  },
  {
    href: "/variacoes/galhos",
    name: "Galhos",
    text: "Fundo claro. Seu nome à esquerda e, à direita, um git log em tamanho de cartaz: as cinco branches em cores, os 13 repositórios mais recentes e o HEAD pulsando no topo. As curvas ligam as partes de um mesmo sistema.",
  },
  {
    href: "/variacoes/aurora",
    name: "Aurora",
    text: "Cor em movimento sobre índigo. Cada mancha é uma branch, do tamanho da quantidade de repositórios dela, e a maior segue o cursor.",
  },
  {
    href: "/variacoes/retrato",
    name: "Retrato",
    text: "Pôster dividido: sua foto em meio-tom, pontos escuros como impressão de cartaz, e o nome num painel âmbar. Perto do cursor, os pontos ganham a cor original da foto.",
  },
];

export default function Variacoes() {
  return (
    <main className="min-h-screen px-5 py-16 sm:px-10" style={{ background: "#e7e9ee", color: "#0e1222" }}>
      <h1 className="vf text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] tracking-tight" style={{ ["--w" as string]: 115, ["--g" as string]: 800 }}>
        Variações da home
      </h1>
      <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed" style={{ color: "#5b6178" }}>
        Cada prévia está funcionando de verdade: mexa o mouse dentro dela. Abra em tela cheia para ver no tamanho real. A direção escolhida vai para o site inteiro, não só para a home.
      </p>

      <ol className="mt-14 grid gap-x-10 gap-y-16 lg:grid-cols-2">
        {options.map((o) => (
          <li key={o.name}>
            <ScaledFrame src={o.href} title={`Prévia: ${o.name}`} />
            <div className="mt-5 flex items-baseline justify-between gap-6">
              <h2 className="text-2xl font-semibold tracking-tight">{o.name}</h2>
              <a href={o.href} target="_blank" rel="noreferrer" className="shrink-0 text-[15px] underline decoration-1 underline-offset-[6px]" style={{ textDecorationColor: "#9aa0b5" }}>
                Abrir em tela cheia
              </a>
            </div>
            <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed" style={{ color: "#5b6178" }}>
              {o.text}
            </p>
          </li>
        ))}
      </ol>
    </main>
  );
}
