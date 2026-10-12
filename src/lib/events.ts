"use client";

// Eventos de janela para componentes irmãos conversarem sem contexto global
export const openPalette = () => window.dispatchEvent(new Event("palette:open"));

export const toast = (message: string) =>
  window.dispatchEvent(new CustomEvent<string>("toast", { detail: message }));

export async function copyEmail(email: string) {
  try {
    await navigator.clipboard.writeText(email);
    toast("E-mail copiado");
  } catch {
    window.location.href = `mailto:${email}`;
  }
}
