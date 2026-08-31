"use client";

import { useEffect, useState } from "react";
import { WinnerBurst } from "@/components/game/WinnerBurst";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { trackById } from "@/data/tracks";
import type { PlayerRow, TimelineCardRow } from "@/types/room";

interface VictoryScreenProps {
  players: PlayerRow[];
  cards: TimelineCardRow[];
  winnerId: string | null;
  myId: string | null;
  onExit: () => void;
}

export function VictoryScreen({ players, cards, winnerId, myId, onExit }: VictoryScreenProps) {
  const [showBurst, setShowBurst] = useState(true);
  const winner = players.find((player) => player.id === winnerId);
  const ranking = [...players].sort((a, b) => b.timeline_count - a.timeline_count);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowBurst(false), 3400);

    return () => window.clearTimeout(timer);
  }, []);

  if (showBurst) {
    return (
      <div className="stage-sun relative min-h-dvh">
        <WinnerBurst name={winner?.name ?? "Alguém"} isMe={winnerId === myId} />
        <button
          type="button"
          onClick={() => setShowBurst(false)}
          className="display absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer rounded-xl bg-ink/85 px-4 py-2 text-xs text-sun"
        >
          ver o placar
        </button>
      </div>
    );
  }

  return (
    <Screen
      wide
      footer={
        <Button variant="ink" size="lg" fullWidth onClick={onExit}>
          Sair da sala
        </Button>
      }
    >
      <header className="mb-7 text-center">
        <Wordmark size="md" />
        <h1 className="display mt-6 text-4xl text-ink sm:text-5xl">
          {winnerId === myId ? "Você venceu!" : `${winner?.name ?? "Alguém"} venceu`}
        </h1>
        <p className="mt-2 text-sm text-ink/60">Linha do tempo fechada na ordem certa.</p>
      </header>

      <ul className="flex flex-col gap-3">
        {ranking.map((player, index) => {
          const mine = cards
            .filter((card) => card.player_id === player.id)
            .sort((a, b) => a.year - b.year);

          return (
            <li
              key={player.id}
              className={`rounded-3xl border-2 border-ink p-4 ${
                player.id === winnerId ? "bg-aqua" : "bg-paper"
              }`}
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="display flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-sun">
                  {index + 1}
                </span>
                <span className="display flex-1 truncate text-lg text-ink">
                  {player.name}
                  {player.id === myId ? " (você)" : ""}
                </span>
                <span className="display text-2xl text-ink">{player.timeline_count}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {mine.map((card) => (
                  <span
                    key={card.id}
                    className="rounded-lg border border-ink/30 bg-sun-light px-2 py-1 text-[0.65rem] font-semibold text-ink"
                    title={`${trackById(card.track_id)?.artist ?? ""} — ${trackById(card.track_id)?.title ?? ""}`}
                  >
                    {card.year}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
