"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// GSAP só roda no navegador; no SSR o módulo é importado mas nada é registrado
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);
  // mesmas curvas do globals.css (--ease-ui-*)
  CustomEase.create("ui.out", "0.23, 1, 0.32, 1");
  CustomEase.create("ui.inOut", "0.77, 0, 0.175, 1");
}

/** Condição do gsap.matchMedia para animar: sistema sem movimento reduzido */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
