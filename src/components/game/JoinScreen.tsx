"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { copy } from "@/data/copy";
import type { DeckKind } from "@/types/track";

const levels = [
  { key: "CLASSIC", label: "Clássico", hint: "1 carta · alvo 10 · como no original" },
  { key: "QUICK", label: "Rápido", hint: "3 cartas · alvo 8 · partida curta" },
  { key: "MARATHON", label: "Maratona", hint: "5 cartas · alvo 12 · jogo longo" },
];

interface JoinScreenProps {
  mode: "CREATE" | "JOIN";
  deck: DeckKind;
  difficulty: string;
  onDifficulty: (value: string) => void;
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

export function JoinScreen({
  mode,
  deck,
  difficulty,
  onDifficulty,
  busy,
  error,
  onBack,
  onSubmit,
}: JoinScreenProps) {
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
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            lang="pt-BR"
            className="w-full rounded-2xl border-2 border-ink bg-paper px-4 py-4 text-lg text-ink outline-none placeholder:text-ink/30 focus:ring-4 focus:ring-ink/20"
          />
        </label>

        {creating ? (
          <div>
            <span className="display mb-2 block text-xs uppercase tracking-[0.18em] text-ink/55">
              Modo de jogo
            </span>
            <div className="grid gap-2 sm:grid-cols-3">
              {levels.map((level) => (
                <button
                  key={level.key}
                  type="button"
                  onClick={() => onDifficulty(level.key)}
                  aria-pressed={difficulty === level.key}
                  className={`display cursor-pointer rounded-2xl border-2 border-ink px-3 py-3 text-center transition-all duration-150 hover:-translate-y-[2px] ${
                    difficulty === level.key
                      ? "bg-magenta text-cream shadow-[0_5px_0_var(--color-ink)]"
                      : "bg-paper text-ink hover:bg-sun-light"
                  }`}
                >
                  <span className="block text-sm">{level.label}</span>
                  <span className="mt-0.5 block text-[0.6rem] font-semibold opacity-70">
                    {level.hint}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink/55">
              No Clássico você começa com uma carta só e o jogo aperta sozinho: cada carta que entra
              cria um intervalo novo e menor. Começar com mais cartas encurta a partida.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border-2 border-ink bg-magenta-soft p-4 text-sm font-semibold text-ink">
            {error}
          </p>
        ) : null}
      </div>
    </Screen>
  );
}
