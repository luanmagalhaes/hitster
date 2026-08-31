"use client";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Vinyl } from "@/components/ui/Vinyl";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand, copy } from "@/data/copy";
import type { DeckKind } from "@/types/track";

const decks: Array<{ key: DeckKind; label: string; hint: string; tone: string }> = [
  { key: "NATIONAL", label: copy.decks.national, hint: copy.decks.nationalHint, tone: "bg-aqua" },
  {
    key: "INTERNATIONAL",
    label: copy.decks.international,
    hint: copy.decks.internationalHint,
    tone: "bg-magenta text-cream",
  },
  { key: "MIXED", label: copy.decks.mixed, hint: copy.decks.mixedHint, tone: "bg-ink text-sun" },
];

interface HomeScreenProps {
  deck: DeckKind;
  onDeck: (deck: DeckKind) => void;
  onCreate: () => void;
  onJoin: () => void;
}

export function HomeScreen({ deck, onDeck, onCreate, onJoin }: HomeScreenProps) {
  return (
    <Screen wide>
      <div className="flex flex-1 flex-col justify-center gap-10 py-6 lg:flex-row lg:items-center lg:gap-16">
        <header className="animate-sleeve-slide text-center lg:flex-1 lg:text-left">
          <Wordmark size="xl" />
          <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-ink/70 lg:mx-0 lg:text-lg">
            {brand.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mx-auto sm:max-w-sm lg:mx-0">
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

            <ul className="flex flex-col gap-3">
              {decks.map((option, index) => (
                <li
                  key={option.key}
                  className="animate-sleeve-slide"
                  style={{ animationDelay: `${120 + index * 90}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => onDeck(option.key)}
                    aria-pressed={deck === option.key}
                    className={`edge-card group flex w-full cursor-pointer items-center gap-4 rounded-3xl border-2 p-4 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.55),0_7px_0_var(--color-ink),0_20px_30px_-14px_rgba(16,16,20,0.6)] active:translate-y-[2px] ${option.tone} ${
                      deck === option.key
                        ? "border-ink ring-4 ring-ink/25"
                        : "border-ink opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="w-14 shrink-0 transition-transform duration-300 group-hover:rotate-[18deg]">
                      <Vinyl className="w-14" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="display block text-lg">{option.label}</span>
                      <span className="block text-xs opacity-75">{option.hint}</span>
                    </span>
                    {deck === option.key ? (
                      <span className="display shrink-0 rounded-full bg-ink px-2.5 py-1 text-[0.6rem] text-sun">
                        escolhido
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Screen>
  );
}
