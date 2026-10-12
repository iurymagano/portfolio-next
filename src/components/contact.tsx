"use client";

import { copyEmail } from "@/lib/events";
import { profile } from "@/data/profile";
import { SplitHeading } from "./split-heading";

export function Contact() {
  return (
    <section id="contato" className="relative px-5 pb-16 pt-40 sm:px-10 lg:pt-56">
      <SplitHeading className="vf max-w-[14ch] text-balance text-[clamp(3rem,10vw,9.5rem)] leading-[0.85] tracking-tight" style={{ ["--w" as string]: 112, ["--g" as string]: 820 }}>
        Bora construir alguma coisa?
      </SplitHeading>
      <p className="mt-8 max-w-[48ch] text-[17px] leading-relaxed text-fog">
        Produto do zero, uma API que precisa escalar ou uma interface que precisa de cuidado: me manda um e-mail.
      </p>

      <button
        type="button"
        onClick={() => copyEmail(profile.email)}
        aria-label={`Copiar o e-mail ${profile.email}`}
        className="group mt-14 block max-w-full text-left"
      >
        <span className="block text-sm text-fog transition-colors group-hover:text-web">Clique para copiar</span>
        <span translate="no" className="mt-2 block overflow-hidden whitespace-nowrap text-[clamp(1.35rem,5.2vw,5.5rem)] leading-none">
          {profile.email.split("").map((c, i) => (
            <span
              key={i}
              className="vf inline-block transition-[font-variation-settings,color] duration-500 [--g:500] [--w:100] group-hover:text-web group-hover:[--g:800] group-hover:[--w:118] group-focus-visible:[--g:800]"
              style={{ transitionDelay: `${i * 14}ms` }}
            >
              {c}
            </span>
          ))}
        </span>
      </button>

      <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
        {[
          { label: "Escrever um e-mail", href: `mailto:${profile.email}` },
          { label: "GitHub", href: profile.github },
          { label: "LinkedIn", href: profile.linkedin },
        ].map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noreferrer"
              className="text-ink underline decoration-wire underline-offset-[6px] transition-colors hover:decoration-web"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
