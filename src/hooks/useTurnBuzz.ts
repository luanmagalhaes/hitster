"use client";

import { useEffect, useRef } from "react";
import { buzz, shouldBuzz } from "@/lib/game/buzz";

export function useTurnBuzz(isMyTurn: boolean, playing: boolean) {
  const known = useRef<boolean | null>(null);

  useEffect(() => {
    if (!playing) {
      known.current = null;

      return;
    }

    const previous = known.current;

    known.current = isMyTurn;

    if (shouldBuzz(previous, isMyTurn)) {
      buzz();
    }
  }, [isMyTurn, playing]);
}
