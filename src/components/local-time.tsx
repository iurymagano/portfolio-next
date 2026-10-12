"use client";

import { useEffect, useState } from "react";

export function LocalTime({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [timeZone]);

  return <time className="tabular-nums">{time ?? "--:--"}</time>;
}
