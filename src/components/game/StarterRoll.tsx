"use client";

import { useEffect, useState } from "react";
import { Dice } from "@/components/game/Dice";
import { Button } from "@/components/ui/Button";

const rollMs = 1900;
const tickMs = 90;

interface StarterRollProps {
  starterName: string;
  isMe: boolean;
  onDone: () => void;
}

export function StarterRoll({ starterName, isMe, onDone }: StarterRollProps) {
  const [face, setFace] = useState(1);
  const [rolling, setRolling] = useState(true);

  useEffect(() => {
    const spin = window.setInterval(() => {
      setFace(1 + Math.floor(Math.random() * 6));
    }, tickMs);

    const stop = window.setTimeout(() => {
      window.clearInterval(spin);
      setRolling(false);
    }, rollMs);

    return () => {
      window.clearInterval(spin);
      window.clearTimeout(stop);
    };
  }, []);

  return (
    <div className="stage-sun fixed inset-0 z-[60] flex flex-col items-center justify-center gap-7 px-8 text-center">
      <span className="display text-sm uppercase tracking-[0.28em] text-ink/55">
        {rolling ? "Rolando o dado" : "Quem começa"}
      </span>

      <div className={rolling ? "animate-dice-shake" : "animate-dice-roll"}>
        <Dice face={face} className="w-32 sm:w-40" />
      </div>

      {rolling ? (
        <span className="display text-2xl text-ink/35">...</span>
      ) : (
        <div className="animate-name-pop">
          <span className="display block rounded-2xl border-4 border-ink bg-magenta px-6 py-3 text-3xl text-cream shadow-[0_8px_0_var(--color-ink)] sm:text-4xl">
            {isMe ? "Você começa!" : starterName}
          </span>
          {isMe ? null : (
            <span className="display mt-3 block text-base text-ink/60">começa a partida</span>
          )}
        </div>
      )}

      {rolling ? null : (
        <div className="w-full max-w-[15rem]">
          <Button variant="ink" fullWidth onClick={onDone}>
            Bora
          </Button>
        </div>
      )}
    </div>
  );
}
