"use client";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Vinyl } from "@/components/ui/Vinyl";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand, copy } from "@/data/copy";

const decks = [
  { key: "NATIONAL", label: copy.decks.national, hint: copy.decks.nationalHint, tone: "bg-aqua" },
  {
    key: "INTERNATIONAL",
    label: copy.decks.international,
    hint: copy.decks.internationalHint,
    tone: "bg-magenta text-cream",
  },
  { key: "MIXED", label: copy.decks.mixed, hint: copy.decks.mixedHint, tone: "bg-ink text-sun" },
];

export function HomeScreen() {
  return (
    <Screen wide>
      <div className="flex flex-1 flex-col justify-center gap-10 py-6 lg:flex-row lg:items-center lg:gap-16">
        <header className="animate-sleeve-slide text-center lg:flex-1 lg:text-left">
          <Wordmark size="xl" />
          <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-ink/70 lg:mx-0 lg:text-lg">
            {brand.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mx-auto sm:max-w-sm lg:mx-0">
            <Button variant="ink" size="lg" fullWidth>
              {copy.home.createRoom}
            </Button>
            <Button variant="outline" size="lg" fullWidth>
              {copy.home.joinRoom}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost">{copy.home.howToPlay}</Button>
              <Button variant="ghost">{copy.home.scoreboard}</Button>
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
            {copy.home.footNote}
          </p>
        </header>

        <section className="lg:flex-1">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -left-6 top-8 hidden w-32 lg:block">
              <Vinyl spinning className="w-32 opacity-90" />
            </div>

            <h2 className="display mb-4 text-center text-xl text-ink/70 lg:text-left">
              {copy.decks.title}
            </h2>

            <ul className="flex flex-col gap-3">
              {decks.map((deck, index) => (
                <li
                  key={deck.key}
                  className="animate-sleeve-slide"
                  style={{ animationDelay: `${120 + index * 90}ms` }}
                >
                  <button
                    type="button"
                    className={`edge-card group transition-[transform,box-shadow] duration-200 ease-[var(--ease-snap)] flex w-full cursor-pointer items-center gap-4 rounded-3xl border-2 border-ink p-4 text-left hover:-translate-y-[3px] hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.55),0_7px_0_var(--color-ink),0_20px_30px_-14px_rgba(16,16,20,0.6)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink active:translate-y-[2px] ${deck.tone}`}
                  >
                    <span className="w-14 shrink-0 transition-transform duration-300 group-hover:rotate-[18deg]">
                      <Vinyl className="w-14" />
                    </span>
                    <span className="min-w-0">
                      <span className="display block text-lg">{deck.label}</span>
                      <span className="block text-xs opacity-75">{deck.hint}</span>
                    </span>
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
