"use client";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand, copy } from "@/data/copy";
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
    <Screen>
      <div className="flex flex-1 flex-col justify-center py-6">
        <header className="animate-sleeve-slide mx-auto max-w-md text-center">
          <Wordmark size="xl" />
          <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-ink/70">
            {brand.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-3">
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
      </div>
    </Screen>
  );
}
