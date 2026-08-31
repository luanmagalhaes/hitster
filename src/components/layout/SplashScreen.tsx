"use client";

import { useEffect, useState } from "react";
import { Vinyl } from "@/components/ui/Vinyl";
import { copy } from "@/data/copy";

const holdMs = 1750;
const fadeMs = 620;

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const start = window.setTimeout(() => setLeaving(true), holdMs);

    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    if (!leaving) {
      return;
    }

    const finish = window.setTimeout(onDone, fadeMs);

    return () => window.clearTimeout(finish);
  }, [leaving, onDone]);

  return (
    <div
      className={`stage-sun fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden px-8 ${
        leaving ? "animate-curtain-out" : ""
      }`}
    >
      <div className="relative">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-ink/15" />
        <div className="animate-vinyl-drop">
          <Vinyl spinning className="w-40 sm:w-52" />
        </div>
      </div>

      <div className="overflow-hidden">
        <h1 className="display animate-word-rise text-6xl text-ink sm:text-7xl">Vitrola</h1>
      </div>

      <div className="overflow-hidden">
        <p
          className="animate-word-rise text-sm font-semibold uppercase tracking-[0.28em] text-ink/60"
          style={{ animationDelay: "160ms" }}
        >
          {copy.splash.loading}
        </p>
      </div>
    </div>
  );
}
