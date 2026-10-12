/**
 * Nome de projeto com glitch de RGB no hover do mouse: duas cópias do próprio texto (rosa e
 * ciano das branches) deslizam em faixas recortadas. Feito em CSS, e não com a vfx-js, porque
 * a captura em SVG da vfx-js não carrega as fontes do site e desenhava o nome em Arial.
 * Só existe com mouse, sem movimento reduzido e sem pausa (ver .glitch no globals.css).
 */
export function GlitchName({ text }: { text: string }) {
  return (
    <span className="glitch relative inline-block" data-text={text}>
      {text}
    </span>
  );
}
