"use client";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Vinyl } from "@/components/ui/Vinyl";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand, copy } from "@/data/copy";
import { deckOptions } from "@/data/roomOptions";
import type { RecentSeat } from "@/lib/session";

interface HomeScreenProps {
  seats: RecentSeat[];
  onResume: (seat: RecentSeat) => void;
  onForget: (code: string) => void;
  onCreate: () => void;
  onRules: () => void;
  onJoin: () => void;
}

export function HomeScreen({
  seats,
  onResume,
  onForget,
  onCreate,
  onRules,
  onJoin,
}: HomeScreenProps) {
  const lastSeat = seats[0];

  return (
    <Screen wide>
      <div className="flex flex-1 flex-col justify-center gap-10 py-6 lg:flex-row lg:items-center lg:gap-16">
        <header className="animate-sleeve-slide text-center lg:flex-1 lg:text-left">
          <Wordmark size="xl" />
          <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-ink/70 lg:mx-0 lg:text-lg">
            {brand.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mx-auto sm:max-w-sm lg:mx-0">
            {lastSeat ? (
              <div className="animate-sleeve-slide mb-1 rounded-2xl border-2 border-ink bg-aqua p-3.5 text-left">
                <p className="text-xs font-semibold text-ink/75">
                  {`Você estava na sala ${lastSeat.code} como ${lastSeat.name}.`}
                </p>
                <div className="mt-2.5 flex gap-2">
                  <Button variant="ink" fullWidth onClick={() => onResume(lastSeat)}>
                    Voltar pra sala
                  </Button>
                  <Button variant="ghost" onClick={() => onForget(lastSeat.code)}>
                    Esquecer
                  </Button>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={onRules}
              className="display cursor-pointer rounded-xl px-3 py-1.5 text-sm text-ink/60 transition-colors hover:text-ink"
            >
              Como se joga?
            </button>
            <Button variant="ink" size="lg" fullWidth onClick={onCreate}>
              {copy.home.createRoom}
            </Button>
            <Button variant="outline" size="lg" fullWidth onClick={onJoin}>
              {copy.home.joinRoom}
            </Button>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
            {copy.home.footNote}
          </p>
        </header>

        <section className="lg:flex-1">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="display mb-4 text-center text-xl text-ink/70 lg:text-left">
              {copy.decks.title}
            </h2>
            <p className="mb-4 text-center text-xs font-semibold text-ink/50 lg:text-left">
              Você escolhe o baralho dentro da sala, junto com o resto das regras.
            </p>

            <ul className="flex flex-col gap-3">
              {deckOptions.map((option, index) => (
                <li
                  key={option.key}
                  className="animate-sleeve-slide"
                  style={{ animationDelay: `${120 + index * 90}ms` }}
                >
                  <div
                    className={`edge-card group flex w-full items-center gap-4 rounded-3xl border-2 border-ink p-4 text-left ${option.tone}`}
                  >
                    <span className="w-14 shrink-0 transition-transform duration-300 group-hover:rotate-[18deg]">
                      <Vinyl className="w-14" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="display block text-lg">{option.label}</span>
                      <span className="block text-xs opacity-75">{option.hint}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Screen>
  );
}
