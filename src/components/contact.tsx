"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { copyEmail } from "@/lib/events";
import { profile } from "@/data/profile";
import { Magnetic } from "./magnetic";
import { SplitHeading } from "./split-heading";

// troca de ícone contextual: escala 0.25 → 1, opacidade e desfoque, mola sem quique
const swap = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: { type: "spring", duration: 0.3, bounce: 0 },
} as const;

function CopyIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const onCopy = async () => {
    const ok = await copyEmail(profile.email, { notify: false });
    if (!ok) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="contato" className="relative px-5 pb-16 pt-40 sm:px-10 lg:pt-56">
      <SplitHeading className="vf max-w-[14ch] text-balance text-[clamp(3rem,10vw,9.5rem)] leading-[0.85] tracking-tight" style={{ ["--w" as string]: 112, ["--g" as string]: 820 }}>
        Bora construir alguma coisa?
      </SplitHeading>
      <p className="mt-8 max-w-[48ch] text-pretty text-[17px] leading-relaxed text-fog">
        Produto do zero, uma API que precisa escalar ou uma interface que precisa de cuidado: me manda um e-mail.
      </p>

      <Magnetic className="mt-14 w-fit max-w-full" intensity={0.18} range={420}>
        <button type="button" onClick={onCopy} aria-label={`Copiar o e-mail ${profile.email}`} className="group block max-w-full text-left">
          <span aria-live="polite" className={`flex h-5 items-center gap-2 text-sm transition-colors ${copied ? "text-web" : "text-fog group-hover:text-web"}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={copied ? "ok" : "copy"} {...swap} className="flex items-center gap-2">
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? (
                  "Copiado"
                ) : (
                  <span>
                    <span className="pointer-coarse:hidden">Clique</span>
                    <span className="hidden pointer-coarse:inline">Toque</span> para copiar
                  </span>
                )}
              </motion.span>
            </AnimatePresence>
          </span>
          <span translate="no" className="mt-2 block overflow-hidden whitespace-nowrap text-[clamp(1.35rem,5.2vw,5.5rem)] leading-none">
            {profile.email.split("").map((c, i) => (
              <span
                key={i}
                className="vf inline-block transition-[font-variation-settings,color] duration-500 [--g:500] [--w:100] group-hover:text-web motion-safe:group-hover:[--g:800] motion-safe:group-hover:[--w:118] group-focus-visible:[--g:800]"
                style={{ transitionDelay: `${i * 14}ms` }}
              >
                {c}
              </span>
            ))}
          </span>
        </button>
      </Magnetic>

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
              className="inline-block py-2 text-ink underline decoration-wire underline-offset-[6px] transition-colors hover:decoration-web"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
