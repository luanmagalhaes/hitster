"use client";

import { deckOptions, levelOptions, paceOptions } from "@/data/roomOptions";
import type { RoomRow } from "@/types/room";

interface RoomSetupProps {
  room: RoomRow;
  canEdit: boolean;
  busy: boolean;
  pending: string | null;
  onChange: (patch: { deck?: string; difficulty?: string; mode?: string }) => void;
}

interface GroupProps {
  title: string;
  hint: string;
  options: Array<{ key: string; head: string; label: string; hint: string }>;
  chosen: string;
  tone: string;
  canEdit: boolean;
  busy: boolean;
  onPick: (key: string) => void;
}

function Group({ title, hint, options, chosen, tone, canEdit, busy, onPick }: GroupProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="display text-xs uppercase tracking-[0.18em] text-ink/55">{title}</span>
        <span className="text-[0.65rem] font-semibold text-ink/40">{hint}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const picked = chosen === option.key;

          return (
            <button
              key={option.key}
              type="button"
              disabled={!canEdit || busy}
              onClick={() => onPick(option.key)}
              aria-pressed={picked}
              className={`display rounded-2xl border-2 border-ink px-2 py-2 text-center transition-all duration-150 ${
                picked ? `${tone} shadow-[0_5px_0_var(--color-ink)]` : "bg-paper text-ink"
              } ${
                canEdit && !busy
                  ? "cursor-pointer hover:-translate-y-[2px] enabled:hover:brightness-105"
                  : "cursor-default"
              } ${!canEdit && !picked ? "opacity-45" : ""}`}
            >
              <span className="block text-base leading-none">{option.head}</span>
              <span className="mt-1 block text-[0.6rem] font-semibold leading-tight sm:text-[0.68rem]">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-1.5 text-[0.7rem] font-semibold leading-snug text-ink/60">
        {options.find((option) => option.key === chosen)?.hint}
      </p>
    </div>
  );
}

export function RoomSetup({ room, canEdit, busy, pending, onChange }: RoomSetupProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border-2 border-ink bg-cream p-4">
      <div>
        <h2 className="display text-xl text-ink">Regras da mesa</h2>
        <p className="mt-0.5 text-xs font-semibold text-ink/55">
          {canEdit
            ? "Escolha antes de começar. Todo mundo na sala vê a mudança na hora."
            : "Quem abriu a sala escolhe. Você vê tudo aqui antes de começar."}
        </p>
      </div>

      <Group
        title="Baralho"
        hint={`${deckOptions.length} opções`}
        options={deckOptions}
        chosen={room.deck}
        tone="bg-aqua text-ink"
        canEdit={canEdit}
        busy={busy}
        onPick={(deck) => onChange({ deck })}
      />

      <Group
        title="Cartas de saída"
        hint="Quantas você já recebe"
        options={levelOptions}
        chosen={room.difficulty}
        tone="bg-magenta text-cream"
        canEdit={canEdit}
        busy={busy}
        onPick={(difficulty) => onChange({ difficulty })}
      />

      <Group
        title="Ritmo do roubo"
        hint="Janela até liberar"
        options={paceOptions}
        chosen={room.mode}
        tone="bg-grape text-cream"
        canEdit={canEdit}
        busy={busy}
        onPick={(mode) => onChange({ mode })}
      />

      {pending ? (
        <p className="rounded-2xl border-2 border-ink bg-magenta-soft p-3 text-xs font-semibold text-ink">
          {pending}
        </p>
      ) : null}
    </section>
  );
}
