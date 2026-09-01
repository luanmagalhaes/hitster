"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TimelineBoard } from "@/components/game/TimelineBoard";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import type { EventRow, PlayerRow, RoomRow, TimelineCardRow } from "@/types/room";

interface TableScreenProps {
  room: RoomRow;
  players: PlayerRow[];
  cards: TimelineCardRow[];
  events: EventRow[];
  remaining: number;
  myId: string | null;
  busy: boolean;
  error: string | null;
  turnStartedAt: string | null;
  turnSeconds: number;
  audio: ReactNode;
  onPlay: () => void;
  onGuess: (input: { slotIndex: number; artistGuess?: string; titleGuess?: string }) => void;
  onSpendTokens: () => void;
  onRemovePlayer: (playerId: string) => void;
  isHost: boolean;
  onLeave: () => void;
}

const eventLabels: Record<string, string> = {
  PLAYER_JOINED: "entrou na sala",
  MATCH_STARTED: "começou a partida",
  TRACK_DRAWN: "puxou uma música",
  TRACK_SKIPPED: "pulou a faixa",
  TOKENS_SPENT: "trocou fichas por carta",
  PLAYER_REMOVED: "tirou alguém da mesa",
  TURN_TIMEOUT: "demorou e perdeu a vez",
  GUESS_CORRECT: "ACERTOU",
  GUESS_WRONG: "ERROU",
  MATCH_WON: "venceu a partida",
};

const eventTones: Record<string, string> = {
  GUESS_CORRECT: "border-ink bg-aqua",
  GUESS_WRONG: "border-ink bg-magenta-soft",
  MATCH_WON: "border-ink bg-sun-light",
};

export function TableScreen({
  room,
  players,
  cards,
  events,
  remaining,
  myId,
  busy,
  error,
  turnStartedAt,
  turnSeconds,
  audio,
  onPlay,
  onGuess,
  onSpendTokens,
  onRemovePlayer,
  isHost,
  onLeave,
}: TableScreenProps) {
  const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);
  const me = players.find((player) => player.id === myId);
  const turnPlayer = players.find((player) => player.id === room.turn_player_id);
  const myTurn = Boolean(me && room.turn_player_id === me.id);
  const playing = Boolean(room.current_track_id);
  const myCards = cards
    .filter((card) => card.player_id === myId)
    .sort((a, b) => a.year - b.year);
  const secondsLeft = turnStartedAt
    ? Math.max(0, turnSeconds - Math.floor((now - new Date(turnStartedAt).getTime()) / 1000))
    : turnSeconds;
  const ranking = [...players].sort(
    (a, b) => b.timeline_count - a.timeline_count || b.tokens - a.tokens || a.seat - b.seat,
  );

  const pendingRemoval = players.find((player) => player.id === confirmingRemoval);

  return (
    <Screen wide>
      {pendingRemoval ? (
        <ConfirmModal
          title={`Tirar ${pendingRemoval.name} da mesa?`}
          tone="danger"
          busy={busy}
          confirmLabel="Tirar da mesa"
          cancelLabel="Deixa quieto"
          body={
            <>
              <p>
                <strong className="text-ink">{pendingRemoval.name}</strong> sai da partida na hora e
                não consegue voltar para esta sala.
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-xs">
                <li className="rounded-xl bg-sun-light px-3 py-2">
                  As {pendingRemoval.timeline_count} cartas voltam para o monte
                </li>
                {pendingRemoval.id === room.turn_player_id ? (
                  <li className="rounded-xl bg-sun-light px-3 py-2">
                    Era a vez dela, então a vez passa para o próximo
                  </li>
                ) : null}
                {players.length === 2 ? (
                  <li className="rounded-xl bg-magenta-soft px-3 py-2 font-semibold">
                    Vocês ficam só você na mesa, então a partida encerra
                  </li>
                ) : null}
              </ul>
            </>
          }
          onCancel={() => setConfirmingRemoval(null)}
          onConfirm={() => {
            onRemovePlayer(pendingRemoval.id);
            setConfirmingRemoval(null);
          }}
        />
      ) : null}

      <header className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onLeave}
          className="display cursor-pointer rounded-xl px-2 py-1 text-sm text-ink/55 transition-colors hover:text-ink"
        >
          ← Sair
        </button>
        <div className="flex items-center gap-2">
          <span className="display rounded-full border-2 border-ink bg-paper px-3 py-1 text-xs text-ink">
            {room.code}
          </span>
          <span className="display rounded-full border-2 border-ink bg-ink px-3 py-1 text-xs text-sun">
            {remaining} no monte
          </span>
          <Wordmark size="sm" className="hidden opacity-45 sm:inline-block" />
        </div>
      </header>

      <div className="mb-5">{audio}</div>

      {me && me.tokens >= room.token_cost ? (
        <div className="mb-5 rounded-3xl border-2 border-ink bg-aqua p-4 text-ink">
          <span className="display block text-base">
            Você tem {me.tokens} fichas
          </span>
          <span className="mt-1 block text-sm opacity-80">
            Dá para trocar {room.token_cost} fichas por uma carta na posição certa, de graça.
          </span>
          <div className="mt-3">
            <Button variant="ink" fullWidth disabled={busy} onClick={onSpendTokens}>
              {busy ? "Trocando..." : `Trocar ${room.token_cost} fichas por 1 carta`}
            </Button>
          </div>
        </div>
      ) : null}

      <section className="mb-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="display text-lg text-ink">Placar</h2>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            alvo: {room.target_cards} cartas
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {ranking.map((player, index) => {
            const isTurn = player.id === room.turn_player_id;
            const progress = Math.min(100, (player.timeline_count / room.target_cards) * 100);

            return (
              <li
                key={player.id}
                className={`rounded-2xl border-2 border-ink p-3 ${
                  isTurn ? "bg-sun-light" : "bg-paper"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      index === 0 ? "bg-magenta text-cream" : "bg-ink text-sun"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="display block truncate text-ink">
                      {player.name}
                      {player.id === myId ? " (você)" : ""}
                      {isTurn ? " · jogando" : ""}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink/12">
                        <span
                          className="block h-full rounded-full bg-aqua"
                          style={{ width: `${progress}%` }}
                        />
                      </span>
                      <span className="display shrink-0 text-xs text-ink/60">
                        {player.timeline_count}/{room.target_cards}
                      </span>
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="flex gap-1">
                      {Array.from({ length: player.tokens }, (_, slot) => (
                        <span key={slot} className="h-3 w-3 rounded-full bg-magenta" />
                      ))}
                    </span>
                    <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-ink/40">
                      {player.tokens} {player.tokens === 1 ? "ficha" : "fichas"}
                    </span>
                  </span>

                  {isHost && player.id !== myId ? (
                    <button
                      type="button"
                      onClick={() => setConfirmingRemoval(player.id)}
                      disabled={busy}
                      aria-label={`Tirar ${player.name} da mesa`}
                      className="display shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs text-ink/35 transition-colors hover:bg-magenta hover:text-cream disabled:cursor-not-allowed"
                    >
                      tirar
                    </button>
                  ) : null}
                </div>

              </li>
            );
          })}
        </ul>
      </section>

      <div
        className={`mb-5 rounded-3xl border-2 border-ink p-4 ${myTurn ? "bg-magenta text-cream" : "bg-paper text-ink"}`}
      >
        <span className="display block text-lg">
          {myTurn ? "É a sua vez" : `Vez de ${turnPlayer?.name ?? "alguém"}`}
        </span>
        <span className="mt-1 block text-sm opacity-80">
          {myTurn
            ? playing
              ? "Ouça e escolha onde essa música entra na sua linha do tempo."
              : "Toque a próxima música para começar a rodada."
            : "Aguarde a rodada da pessoa. Você pode ir montando o ouvido."}
        </span>

        {!playing && turnStartedAt ? (
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/15">
              <div
                className={`h-full rounded-full ${secondsLeft <= 15 ? "bg-magenta" : "bg-aqua"}`}
                style={{ width: `${(secondsLeft / turnSeconds) * 100}%`, transition: "width 1s linear" }}
              />
            </div>
            <p className="mt-1 text-xs font-semibold opacity-75">
              {myTurn
                ? `${secondsLeft}s para tocar, senão a vez passa`
                : `${secondsLeft}s para ${turnPlayer?.name ?? "a pessoa"} tocar`}
            </p>
          </div>
        ) : null}

        {myTurn && !playing ? (
          <div className="mt-3">
            <Button variant="ink" fullWidth disabled={busy} onClick={onPlay}>
              {busy ? "Puxando..." : "Tocar a próxima"}
            </Button>
          </div>
        ) : null}
      </div>

      <section className="mb-6">
        <h2 className="display mb-3 text-xl text-ink">
          Sua linha do tempo
          <span className="ml-2 text-sm text-ink/50">
            {myCards.length} de {room.target_cards}
          </span>
        </h2>

        <TimelineBoard
          key={room.current_track_id ?? "idle"}
          years={myCards.map((card) => card.year)}
          trackIds={myCards.map((card) => card.track_id)}
          canGuess={myTurn && playing}
          busy={busy}
          onGuess={onGuess}
        />
      </section>

      <div>
        <section>
          <h2 className="display mb-3 text-lg text-ink">Rolou agora</h2>
          <ul className="flex flex-col gap-1.5">
            {events.slice(0, 10).map((event) => {
              const actor = players.find((player) => player.id === event.actor_id);
              const tone = eventTones[event.type] ?? "border-ink/20 bg-paper/70";
              const detailed = event.detail && event.type.startsWith("GUESS");

              return (
                <li
                  key={event.id}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm text-ink ${tone}`}
                >
                  <span className="display">{actor?.name ?? "alguém"}</span>{" "}
                  <span className={detailed ? "display text-xs" : ""}>
                    {eventLabels[event.type] ?? event.type}
                  </span>
                  {detailed ? (
                    <span className="mt-1 block text-xs leading-snug opacity-80">
                      {event.detail}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {error ? (
        <p className="mt-5 rounded-2xl border-2 border-ink bg-magenta-soft p-4 text-sm font-semibold text-ink">
          {error}
        </p>
      ) : null}
    </Screen>
  );
}
