"use client";

import { useEffect, useRef } from "react";
import { alertKind, buzz, canBuzz, shouldBuzz } from "@/lib/game/buzz";
import { playChime, unlockChime } from "@/lib/game/chime";

export function useTurnBuzz(isMyTurn: boolean, playing: boolean) {
  const known = useRef<boolean | null>(null);

  useEffect(() => {
    if (canBuzz()) {
      return;
    }

    const prime = () => unlockChime();

    window.addEventListener("pointerdown", prime, { once: true });

    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  useEffect(() => {
    if (!playing) {
      known.current = null;

      return;
    }

    const previous = known.current;

    known.current = isMyTurn;

    if (!shouldBuzz(previous, isMyTurn)) {
      return;
    }

    if (alertKind(canBuzz()) === "VIBRATE") {
      buzz();

      return;
    }

    playChime();
  }, [isMyTurn, playing]);
}
