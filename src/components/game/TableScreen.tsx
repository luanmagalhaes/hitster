"use client";

import type { ReactNode } from "react";
import { TimelineBoard } from "@/components/game/TimelineBoard";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import type { GuessResult } from "@/lib/api";
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
  lastResult: GuessResult | null;
  audio: ReactNode;
  onPlay: () => void;
  onGuess: (input: { slotIndex: number; artistGuess?: string; titleGuess?: string }) => void;
  onSpendTokens: () => void;
  onLeave: () => void;
}

const eventLabels: Record<string, string> = {
  PLAYER_JOINED: "entrou na sala",
  MATCH_STARTED: "começou a partida",
  TRACK_DRAWN: "puxou uma música",
  TRACK_SKIPPED: "pulou a faixa",
  TOKENS_SPENT: "trocou fichas por carta",
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
  lastResult,
  audio,
  onPlay,
  onGuess,
  onSpendTokens,
  onLeave,
}: TableScreenProps) {
  const me = players.find((player) => player.id === myId);
  const turnPlayer = players.find((player) => player.id === room.turn_player_id);
  const myTurn = Boolean(me && room.turn_player_id === me.id);
  const playing = Boolean(room.current_track_id);
  const myCards = cards
    .filter((card) => card.player_id === myId)
    .sort((a, b) => a.year - b.year);
  const ranking = [...players].sort(
    (a, b) => b.timeline_count - a.timeline_count || b.tokens - a.tokens || a.seat - b.seat,
  );

  return (
    <Screen wide>
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

        {myTurn && !playing ? (
          <div className="mt-3">
            <Button variant="ink" fullWidth disabled={busy} onClick={onPlay}>
              {busy ? "Puxando..." : "Tocar a próxima"}
            </Button>
          </div>
        ) : null}
      </div>

      {lastResult ? (
        <div className="animate-sleeve-slide mb-5 overflow-hidden rounded-3xl border-2 border-ink">
          <div
            className={`p-4 ${lastResult.correct ? "bg-aqua" : "bg-magenta"} ${lastResult.correct ? "text-ink" : "text-cream"}`}
          >
            <span className="display block text-2xl">
              {lastResult.correct ? "Acertou a posição!" : "Errou a posição"}
            </span>
            <span className="mt-1 block text-sm opacity-85">
              {lastResult.track.artist} — {lastResult.track.title}
            </span>
            <span className="display mt-1 block text-4xl">{lastResult.track.year}</span>
          </div>

          <div className="bg-paper p-4 text-ink">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="display shrink-0 text-base">
                  {lastResult.correct ? "✓" : "✗"}
                </span>
                <span>
                  Você pôs <strong>{lastResult.chosenLabel}</strong>
                  {lastResult.correct ? (
                    " e a carta é sua."
                  ) : (
                    <>
                      , mas {lastResult.track.year} fica{" "}
                      <strong>{lastResult.correctLabel}</strong>. A carta volta pro monte.
                    </>
                  )}
                </span>
              </div>

              {lastResult.artistTried || lastResult.titleTried ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="display shrink-0 text-base">
                      {lastResult.artistHit ? "✓" : "✗"}
                    </span>
                    <span>
                      Artista: {lastResult.artistHit ? "certo" : "errado"} — era{" "}
                      <strong>{lastResult.track.artist}</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="display shrink-0 text-base">
                      {lastResult.titleHit ? "✓" : "✗"}
                    </span>
                    <span>
                      Música: {lastResult.titleHit ? "certo" : "errado"} — era{" "}
                      <strong>{lastResult.track.title}</strong>
                    </span>
                  </div>
                </>
              ) : null}

              {lastResult.bonusReason ? (
                <p
                  className={`mt-1 rounded-xl border-2 border-ink px-3 py-2 text-xs font-semibold ${
                    lastResult.earnedTokens > 0 ? "bg-aqua" : "bg-sun-light"
                  }`}
                >
                  {lastResult.bonusReason}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

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
