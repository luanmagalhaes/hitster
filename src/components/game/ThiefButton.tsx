"use client";

import { useEffect, useMemo, useState } from "react";
import { Thief } from "@/components/ui/Thief";

interface ThiefButtonProps {
  seed: string;
  disabled: boolean;
  onSteal: () => void;
}

type Edge = "top" | "bottom" | "left" | "right";

const edges: Edge[] = ["top", "bottom", "left", "right"];

function spotFor(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const edge = edges[hash % edges.length];
  const along = 12 + ((hash >>> 3) % 66);

  return { edge, along };
}

const enters: Record<Edge, string> = {
  top: "-translate-y-[130%]",
  bottom: "translate-y-[130%]",
  left: "-translate-x-[130%]",
  right: "translate-x-[130%]",
};

export function ThiefButton({ seed, disabled, onSteal }: ThiefButtonProps) {
  const { edge, along } = useMemo(() => spotFor(seed), [seed]);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShown(true), 60);

    return () => window.clearTimeout(timer);
  }, []);

  const place =
    edge === "top"
      ? { top: "calc(var(--safe-top) + 0.5rem)", left: `${along}%` }
      : edge === "bottom"
        ? { bottom: "calc(var(--safe-bottom) + 0.5rem)", left: `${along}%` }
        : edge === "left"
          ? { left: "0.5rem", top: `${along}%` }
          : { right: "0.5rem", top: `${along}%` };

  return (
    <button
      type="button"
      onClick={onSteal}
      disabled={disabled}
      aria-label="Roubar esta música"
      style={place}
      className={`fixed z-[58] cursor-pointer rounded-2xl border-4 border-ink bg-magenta p-2 shadow-[0_6px_0_var(--color-ink)] transition-transform duration-500 ease-out hover:scale-110 active:scale-95 disabled:opacity-50 ${
        shown ? "translate-x-0 translate-y-0" : enters[edge]
      }`}
    >
      <Thief className="w-14 sm:w-16" winking />
      <span className="display mt-0.5 block text-[0.6rem] uppercase tracking-wider text-cream">
        roubar
      </span>
    </button>
  );
}
