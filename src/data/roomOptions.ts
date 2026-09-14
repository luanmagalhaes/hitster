import { copy } from "@/data/copy";
import type { DeckKind } from "@/types/track";

export interface RoomOption<T extends string> {
  key: T;
  head: string;
  label: string;
  hint: string;
}

export const deckOptions: Array<RoomOption<DeckKind> & { tone: string }> = [
  {
    key: "NATIONAL",
    head: "BR",
    label: copy.decks.national,
    hint: copy.decks.nationalHint,
    tone: "bg-aqua",
  },
  {
    key: "INTERNATIONAL",
    head: "INT",
    label: copy.decks.international,
    hint: copy.decks.internationalHint,
    tone: "bg-magenta text-cream",
  },
  {
    key: "MIXED",
    head: "MIX",
    label: copy.decks.mixed,
    hint: copy.decks.mixedHint,
    tone: "bg-ink text-sun",
  },
];

export const levelOptions: Array<RoomOption<string> & { standard: boolean }> = [
  {
    key: "CLASSIC",
    head: "1 carta",
    label: "Clássico",
    hint: "Alvo 10 · Aperta sozinho",
    standard: true,
  },
  {
    key: "QUICK",
    head: "3 cartas",
    label: "Rápido",
    hint: "Alvo 8 · Já começa apertado",
    standard: false,
  },
  {
    key: "MARATHON",
    head: "5 cartas",
    label: "Maratona",
    hint: "Alvo 12 · O mais difícil",
    standard: false,
  },
];

export const paceOptions: Array<RoomOption<"CLASSIC" | "LIGHTNING">> = [
  {
    key: "CLASSIC",
    head: "30s",
    label: "Clássico",
    hint: "Quem está na vez tem 30 segundos antes de liberar o roubo",
  },
  {
    key: "LIGHTNING",
    head: "5s",
    label: "Relâmpago",
    hint: "Começa com 5 e cada roubo dá 5 a mais, até 30",
  },
];

export const deckLabels: Record<string, string> = {
  NATIONAL: copy.decks.national,
  INTERNATIONAL: copy.decks.international,
  MIXED: copy.decks.mixed,
};

export const levelLabels: Record<string, string> = {
  CLASSIC: "Clássico",
  QUICK: "Rápido",
  MARATHON: "Maratona",
};
