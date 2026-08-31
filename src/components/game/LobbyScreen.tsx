"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { copy } from "@/data/copy";
import type { PlayerRow, RoomRow } from "@/types/room";

interface LobbyScreenProps {
  room: RoomRow;
  players: PlayerRow[];
  isHost: boolean;
  busy: boolean;
  error: string | null;
  onStart: () => void;
  onLeave: () => void;
}

const deckLabels: Record<string, string> = {
  NATIONAL: copy.decks.national,
  INTERNATIONAL: copy.decks.international,
  MIXED: copy.decks.mixed,
};

export function LobbyScreen({
  room,
  players,
  isHost,
  busy,
  error,
  onStart,
  onLeave,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);
  const enough = players.length >= 2;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Screen
      wide
      footer={
        isHost ? (
          <Button variant="ink" size="lg" fullWidth disabled={busy || !enough} onClick={onStart}>
            {enough ? "Começar a partida" : "Precisa de mais um jogador"}
          </Button>
        ) : (
          <p className="text-center text-sm font-semibold text-ink/60">
            Esperando o host começar...
          </p>
        )
      }
    >
      <header className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onLeave}
          className="display cursor-pointer rounded-xl px-2 py-1 text-sm text-ink/60 transition-colors hover:text-ink"
        >
          ← Sair
        </button>
        <Wordmark size="sm" className="opacity-50" />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <button
          type="button"
          onClick={copyCode}
          className="edge-card cursor-pointer rounded-3xl border-2 border-ink bg-aqua p-6 text-center text-ink transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.55),0_7px_0_var(--color-ink),0_20px_30px_-14px_rgba(16,16,20,0.6)] active:translate-y-[2px]"
        >
          <span className="display block text-xs uppercase tracking-[0.2em] opacity-65">
            Código da sala
          </span>
          <span className="display mt-1 block text-5xl tracking-[0.2em] sm:text-6xl">
            {room.code}
          </span>
          <span className="mt-2 block text-xs font-semibold opacity-70">
            {copied ? "Código copiado!" : "Toque para copiar"}
          </span>
        </button>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="display text-xl text-ink">Na mesa</h2>
            <span className="text-sm font-semibold text-ink/55">{players.length} de 10</span>
          </div>

          <ul className="flex flex-col gap-2">
            {players.map((player, index) => (
              <li
                key={player.id}
                className="animate-sleeve-slide flex items-center gap-3 rounded-2xl border-2 border-ink bg-paper p-3"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-sun">
                  {player.seat}
                </span>
                <span className="display min-w-0 flex-1 truncate text-ink">{player.name}</span>
                {player.is_host ? (
                  <span className="display rounded-full bg-magenta px-2.5 py-1 text-[0.6rem] text-cream">
                    vitrola
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-2xl border-2 border-ink bg-sun-light p-3 text-xs font-semibold text-ink/70">
            Baralho: {deckLabels[room.deck] ?? room.deck} · alvo de {room.target_cards} cartas
          </p>

          {error ? (
            <p className="mt-3 rounded-2xl border-2 border-ink bg-magenta-soft p-3 text-sm font-semibold text-ink">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </Screen>
  );
}
