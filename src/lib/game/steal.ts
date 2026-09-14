export const stealPenaltyCards = 1;

export const classicWindow = 30;
export const lightningFirstWindow = 5;
export const lightningStep = 5;
export const lightningCeiling = 30;

export type GameMode = "CLASSIC" | "LIGHTNING";

export function windowFor(mode: GameMode, stealCount: number): number {
  if (mode === "CLASSIC") {
    return classicWindow;
  }

  const taken = Math.max(0, stealCount);

  return Math.min(lightningCeiling, lightningFirstWindow + taken * lightningStep);
}

export type StealBlock =
  | "NOT_PLAYING"
  | "NOTHING_PLAYING"
  | "MY_TURN"
  | "TAKEN"
  | "TOO_EARLY"
  | "NO_CARD";

export interface StealChance {
  playing: boolean;
  trackPlaying: boolean;
  isMyTurn: boolean;
  stolenBy: string | null;
  elapsedSeconds: number;
  waitSeconds: number;
  spareCards: number;
}

export const modeLabels: Record<GameMode, string> = {
  CLASSIC: "Clássico",
  LIGHTNING: "Relâmpago",
};

export function secondsUntilSteal(elapsedSeconds: number, waitSeconds: number): number {
  return Math.max(0, Math.ceil(waitSeconds - elapsedSeconds));
}

export function stealBlock(chance: StealChance): StealBlock | null {
  if (!chance.playing) {
    return "NOT_PLAYING";
  }

  if (!chance.trackPlaying) {
    return "NOTHING_PLAYING";
  }

  if (chance.isMyTurn) {
    return "MY_TURN";
  }

  if (chance.stolenBy) {
    return "TAKEN";
  }

  if (chance.elapsedSeconds < chance.waitSeconds) {
    return "TOO_EARLY";
  }

  if (chance.spareCards < stealPenaltyCards) {
    return "NO_CARD";
  }

  return null;
}

export function stealBlockMessage(block: StealBlock): string {
  const messages: Record<StealBlock, string> = {
    NOT_PLAYING: "A partida não está em andamento",
    NOTHING_PLAYING: "Nenhuma música está tocando",
    MY_TURN: "A vez é sua, não há o que roubar",
    TAKEN: "Outra pessoa roubou primeiro",
    TOO_EARLY: "Ainda dá tempo de quem está na vez responder",
    NO_CARD: "Você só tem a carta de saída, e ela não pode ser apostada",
  };

  return messages[block];
}
