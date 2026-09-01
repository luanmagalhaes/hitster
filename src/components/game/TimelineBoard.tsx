"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { trackById } from "@/data/tracks";
import { slotLabel, slotsFor } from "@/lib/game/timeline";

export interface TimelineCard {
  year: number;
  trackId: string;
  isSeed: boolean;
}

interface TimelineBoardProps {
  cards: readonly TimelineCard[];
  canGuess: boolean;
  busy: boolean;
  onGuess: (input: { slotIndex: number; artistGuess?: string; titleGuess?: string }) => void;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function TimelineBoard({
  cards: given,
  canGuess,
  busy,
  onGuess,
}: TimelineBoardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [artistGuess, setArtistGuess] = useState("");
  const [titleGuess, setTitleGuess] = useState("");
  const cards = [...given].sort((a, b) => a.year - b.year);
  const slots = slotsFor(cards.map((card) => card.year));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="display mb-2 block text-xs uppercase tracking-[0.18em] text-ink/50">
          Suas cartas
        </span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {cards.length === 0 ? (
            <p className="text-sm text-ink/50">Nenhuma carta ainda.</p>
          ) : (
            cards.map((card) =>
              card.isSeed ? (
                <div
                  key={card.trackId}
                  className="edge-card flex w-[7.5rem] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-ink bg-grape p-3 text-cream"
                  title="Carta de saída"
                >
                  <span className="display text-3xl leading-none">{card.year}</span>
                  <span className="mt-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] opacity-75">
                    saída
                  </span>
                </div>
              ) : (
                <div
                  key={card.trackId}
                  className="edge-card flex w-[7.5rem] shrink-0 flex-col rounded-2xl border-2 border-ink bg-aqua p-3 text-ink"
                >
                  <span className="display text-2xl leading-none">{card.year}</span>
                  <span className="mt-1.5 truncate text-[0.65rem] font-semibold leading-tight">
                    {trackById(card.trackId)?.artist ?? ""}
                  </span>
                  <span className="truncate text-[0.65rem] leading-tight opacity-60">
                    {trackById(card.trackId)?.title ?? ""}
                  </span>
                </div>
              ),
            )
          )}
        </div>
      </div>

      {canGuess ? (
        <div>
          <span className="display mb-2 block text-xs uppercase tracking-[0.18em] text-ink/50">
            Onde essa música entra?
          </span>

          <div className="grid gap-2 sm:grid-cols-2">
            {slots.map((slot) => {
              const active = selected === slot.index;

              return (
                <button
                  key={slot.index}
                  type="button"
                  disabled={busy}
                  onClick={() => setSelected(slot.index)}
                  aria-pressed={active}
                  className={`display w-full cursor-pointer rounded-2xl border-2 border-ink px-4 py-4 text-center text-sm transition-all duration-150 hover:-translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-45 ${
                    active
                      ? "bg-magenta text-cream shadow-[0_5px_0_var(--color-ink)]"
                      : "bg-paper text-ink hover:bg-sun-light"
                  }`}
                >
                  {capitalize(slotLabel(slot.lowerYear, slot.upperYear))}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border-2 border-ink bg-sun-light p-4">
            <span className="display block text-xs uppercase tracking-[0.18em] text-ink/60">
              Quer apostar mais? (opcional)
            </span>
            <p className="mt-1 text-xs text-ink/60">
              Cada acerto vale <strong>1 ficha</strong>. Cravar artista <strong>e</strong> música
              vale <strong>2</strong>.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                value={artistGuess}
                onChange={(event) => setArtistGuess(event.target.value)}
                placeholder="Artista"
                maxLength={60}
                className="w-full rounded-xl border-2 border-ink bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/35 focus:ring-4 focus:ring-ink/15"
              />
              <input
                value={titleGuess}
                onChange={(event) => setTitleGuess(event.target.value)}
                placeholder="Nome da música"
                maxLength={80}
                className="w-full rounded-xl border-2 border-ink bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/35 focus:ring-4 focus:ring-ink/15"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="ink"
              size="lg"
              fullWidth
              disabled={busy || selected === null}
              onClick={() => {
                if (selected !== null) {
                  onGuess({
                    slotIndex: selected,
                    artistGuess: artistGuess.trim() || undefined,
                    titleGuess: titleGuess.trim() || undefined,
                  });
                  setSelected(null);
                  setArtistGuess("");
                  setTitleGuess("");
                }
              }}
            >
              {selected === null
                ? "Escolha uma posição"
                : busy
                  ? "Conferindo..."
                  : `Cravar: ${capitalize(slotLabel(slots[selected].lowerYear, slots[selected].upperYear))}`}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
