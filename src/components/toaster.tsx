"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function Toaster() {
  const [message, setMessage] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    let timer = 0;
    const onToast = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      setMessage({ id: Date.now(), text });
      clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(null), 2200);
    };
    window.addEventListener("toast", onToast);
    return () => {
      window.removeEventListener("toast", onToast);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.p
            key={message.id}
            initial={{ transform: "translateY(24px)", opacity: 0, filter: "blur(6px)" }}
            animate={{ transform: "translateY(0px)", opacity: 1, filter: "blur(0px)" }}
            exit={{ transform: "translateY(12px)", opacity: 0 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
            className="rounded-full border border-wire bg-void-2 px-5 py-2.5 text-sm text-ink shadow-[0_0_40px_-8px_var(--lane-web)]"
          >
            {message.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
