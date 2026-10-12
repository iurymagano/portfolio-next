"use client";

// Eventos de janela para componentes irmãos conversarem sem contexto global
export const openPalette = () => window.dispatchEvent(new Event("palette:open"));

export const toast = (message: string) =>
  window.dispatchEvent(new CustomEvent<string>("toast", { detail: message }));

/** Copia o e-mail; sem área de transferência, abre o cliente de e-mail. Devolve se copiou. */
export async function copyEmail(email: string, { notify = true } = {}) {
  try {
    await navigator.clipboard.writeText(email);
    if (notify) toast("E-mail copiado");
    return true;
  } catch {
    window.location.href = `mailto:${email}`;
    return false;
  }
}
