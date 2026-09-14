"use client";

import { Thief } from "@/components/ui/Thief";
import { stealPenaltyCards } from "@/lib/game/steal";
import { cards } from "@/utils/plural";

interface StealModalProps {
  victimName: string;
  spareCards: number;
  onDismiss: () => void;
}

export function StealModal({ victimName, spareCards, onDismiss }: StealModalProps) {
  const broke = spareCards < stealPenaltyCards;

  return (
    <div className="fixed inset-0 z-[56] flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div className="animate-sleeve-slide flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className="flex shrink-0 items-center gap-3 bg-magenta p-5 text-cream">
          <Thief className="w-16 shrink-0" winking />
          <span className="min-w-0">
            <span className="display block text-xl leading-tight">Dá pra roubar!</span>
            <span className="mt-1 block text-sm opacity-90">
              {victimName} está enrolando com essa música
            </span>
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-start gap-2.5 rounded-2xl border-2 border-ink bg-aqua px-3 py-2.5 text-ink">
              <span className="display shrink-0">✓</span>
              <span>
                Se <strong>acertar</strong>, leva a carta e as fichas igual se fosse a sua vez.
              </span>
            </li>
            <li className="flex items-start gap-2.5 rounded-2xl border-2 border-ink bg-magenta-soft px-3 py-2.5 text-ink">
              <span className="display shrink-0">✗</span>
              <span>
                Se <strong>errar</strong>, perde {cards(stealPenaltyCards)} da sua linha do tempo.
              </span>
            </li>
          </ul>

          <p className="mt-3 text-xs text-ink/60">
            A música entra na <strong>sua</strong> linha do tempo, não na dela. Você tem{" "}
            {cards(spareCards)} para apostar, fora a de saída.
          </p>

          {broke ? (
            <p className="mt-3 rounded-2xl border-2 border-ink bg-sun-light px-3 py-2.5 text-xs font-semibold text-ink">
              Você só tem a carta de saída, e ela não entra na aposta. Ganhe uma carta na sua vez para
              poder roubar.
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            {broke ? null : (
              <p className="rounded-2xl border-2 border-dashed border-ink/35 px-3 py-2.5 text-center text-xs font-semibold text-ink">
                O ladrãozinho apareceu em algum canto da tela.
                <br />
                Ache e toque nele antes dos outros.
              </p>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="display cursor-pointer rounded-xl px-3 py-2 text-sm text-ink/55 transition-colors hover:text-ink"
            >
              Deixa quieto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
