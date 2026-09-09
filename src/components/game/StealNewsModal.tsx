"use client";

import { Button } from "@/components/ui/Button";
import { Thief } from "@/components/ui/Thief";
import { stealPenaltyCards } from "@/lib/game/steal";
import { cards } from "@/utils/plural";
import type { StealNews } from "@/types/room";

interface StealNewsModalProps {
  news: StealNews;
  myId: string | null;
  onClose: () => void;
}

export function StealNewsModal({ news, myId, onClose }: StealNewsModalProps) {
  const robbed = myId === news.victimId;
  const thief = myId === news.thiefId;

  const title = robbed
    ? "Você se ferrou! AHAHAHAH"
    : thief
      ? "Roubou! Agora crava"
      : `${news.thiefName} roubou!`;

  const body = robbed
    ? `${news.thiefName} cansou de esperar e roubou a sua música. Agora é ela que responde — e se errar, perde ${cards(stealPenaltyCards)}.`
    : thief
      ? `A música é sua agora. Escolha onde ela entra na sua linha do tempo. Errar custa ${cards(stealPenaltyCards)} sua.`
      : `${news.thiefName} roubou a música de ${news.victimName}. Agora é com ela.`;

  return (
    <div className="fixed inset-0 z-[57] flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div className="animate-sleeve-slide w-full max-w-sm overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div
          className={`flex items-center gap-3 p-5 ${
            robbed ? "bg-magenta text-cream" : thief ? "bg-aqua text-ink" : "bg-sun text-ink"
          }`}
        >
          <Thief className="w-16 shrink-0" winking={!robbed} />
          <span className="display text-xl leading-tight">{title}</span>
        </div>

        <div className="p-5">
          <p className="text-sm text-ink/75">{body}</p>

          {robbed ? (
            <p className="mt-3 rounded-2xl border-2 border-ink bg-sun-light px-3 py-2.5 text-xs font-semibold text-ink">
              Na próxima, responda antes dos 30 segundos e ninguém tira nada de você.
            </p>
          ) : null}

          <div className="mt-4">
            <Button variant="ink" size="lg" fullWidth onClick={onClose}>
              {robbed ? "Tá bom, vai" : "Bora"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
