import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Iury Magano, desenvolvedor full stack",
  description:
    "Portfólio do Iury Magano, desenvolvedor full stack em Florianópolis. Produtos completos em TypeScript, React, Next.js, Node e NestJS.",
  openGraph: {
    title: "Iury Magano, desenvolvedor full stack",
    description: "Produtos completos, do banco de dados à interface. Florianópolis.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060b",
};

// Marca a sessão para o boot rodar só na primeira visita
// e reaplica a pausa de animações salva no navegador
const bootFlag = `try{var d=document.documentElement;if(sessionStorage.getItem("booted"))d.setAttribute("data-booted","");else sessionStorage.setItem("booted","1");if(localStorage.getItem("motion-paused"))d.dataset.motion="paused"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${jetbrains.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootFlag }} />
      </head>
      <body className="grain min-h-full overflow-x-clip">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
