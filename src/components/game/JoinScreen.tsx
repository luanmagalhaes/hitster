"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { copy } from "@/data/copy";
import type { DeckKind } from "@/types/track";

interface JoinScreenProps {
  mode: "CREATE" | "JOIN";
  deck: DeckKind;
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (input: { name: string; code: string }) => void;
}

const deckLabels: Record<DeckKind, string> = {
  NATIONAL: copy.decks.national,
  INTERNATIONAL: copy.decks.international,
  MIXED: copy.decks.mixed,
};

export function JoinScreen({ mode, deck, busy, error, onBack, onSubmit }: JoinScreenProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const creating = mode === "CREATE";
  const ready = name.trim().length > 0 && (creating || code.trim().length === 6);

  return (
    <Screen
      footer={
        <Button
          variant="ink"
          size="lg"
          fullWidth
          disabled={busy || !ready}
          onClick={() => onSubmit({ name: name.trim(), code: code.trim().toUpperCase() })}
        >
          {busy ? "Um instante..." : creating ? "Criar a sala" : "Entrar"}
        </Button>
      }
    >
      <header className="mb-7">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="display cursor-pointer rounded-xl px-2 py-1 text-sm text-ink/60 transition-colors hover:text-ink"
          >
            ← {copy.common.back}
          </button>
          <Wordmark size="sm" className="opacity-50" />
        </div>
        <h1 className="display text-4xl text-ink">{creating ? "Criar sala" : "Entrar na sala"}</h1>
        <p className="mt-2 text-sm text-ink/60">
          {creating
            ? `Baralho escolhido: ${deckLabels[deck]}. Você vira a vitrola da mesa.`
            : "Peça o código de 6 letras pra quem criou."}
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {creating ? null : (
          <label className="block">
            <span className="display mb-2 block text-xs uppercase tracking-[0.18em] text-ink/55">
              Código da sala
            </span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              autoComplete="off"
              className="display w-full rounded-2xl border-2 border-ink bg-paper px-4 py-4 text-2xl tracking-[0.3em] text-ink outline-none placeholder:text-ink/25 focus:ring-4 focus:ring-ink/20"
            />
          </label>
        )}

        <label className="block">
          <span className="display mb-2 block text-xs uppercase tracking-[0.18em] text-ink/55">
            Seu nome
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Como aparece na mesa"
            maxLength={24}
            autoComplete="off"
            className="w-full rounded-2xl border-2 border-ink bg-paper px-4 py-4 text-lg text-ink outline-none placeholder:text-ink/30 focus:ring-4 focus:ring-ink/20"
          />
        </label>

        {error ? (
          <p className="rounded-2xl border-2 border-ink bg-magenta-soft p-4 text-sm font-semibold text-ink">
            {error}
          </p>
        ) : null}
      </div>
    </Screen>
  );
}
