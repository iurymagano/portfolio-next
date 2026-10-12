import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Iury Magano, desenvolvedor full stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const archivo = await readFile(join(process.cwd(), "assets/Archivo-ExpandedExtraBold.ttf"));
const mono = await readFile(join(process.cwd(), "assets/JetBrainsMono-Regular.ttf"));

const lanes = ["#ffb547", "#5ce1e6", "#a78bfa", "#ff6b9a", "#7e86a8"];

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#05060b", padding: 72, position: "relative" }}>
        {/* branches do histórico como assinatura visual */}
        <div style={{ position: "absolute", right: 96, top: 0, bottom: 0, display: "flex", gap: 30 }}>
          {lanes.map((c, i) => (
            <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80 + i * 70 }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, border: `4px solid ${c}`, background: "#05060b" }} />
              <div style={{ width: 3, flex: 1, background: c, opacity: 0.55 }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1 }}>
          <div style={{ fontFamily: "Mono", fontSize: 26, color: "#5ce1e6" }}>git log --author=&quot;Iury Magano&quot;</div>
          <div style={{ fontFamily: "Archivo", fontSize: 150, lineHeight: 0.9, color: "#eef0f7", marginTop: 28, letterSpacing: -4 }}>IURY</div>
          <div style={{ fontFamily: "Archivo", fontSize: 150, lineHeight: 0.9, color: "#eef0f7", letterSpacing: -4 }}>MAGANO</div>
          <div style={{ fontFamily: "Mono", fontSize: 28, color: "#8b90a8", marginTop: 36 }}>Desenvolvedor full stack em Florianópolis</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: archivo, style: "normal", weight: 800 },
        { name: "Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
