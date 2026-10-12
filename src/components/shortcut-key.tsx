"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// ⌘K no Mac, Ctrl K no resto; o servidor renderiza ⌘K
export function ShortcutKey({ className }: { className?: string }) {
  const mac = useSyncExternalStore(
    subscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => true,
  );
  return <kbd className={className}>{mac ? "⌘K" : "Ctrl K"}</kbd>;
}
