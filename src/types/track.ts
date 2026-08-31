export const DeckKind = {
  National: "NATIONAL",
  International: "INTERNATIONAL",
  Mixed: "MIXED",
} as const;

export type DeckKind = (typeof DeckKind)[keyof typeof DeckKind];

export interface Track {
  id: string;
  artist: string;
  title: string;
  year: number;
  deck: "NATIONAL" | "INTERNATIONAL";
}
