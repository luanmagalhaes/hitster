export const stealPenalty = 2;
export const stealStake = 2;

export type StealBlock =
  | "NOT_PLAYING"
  | "NOTHING_PLAYING"
  | "MY_TURN"
  | "TAKEN"
  | "TOO_EARLY"
  | "NO_STAKE";

export interface StealChance {
  playing: boolean;
  trackPlaying: boolean;
  isMyTurn: boolean;
  stolenBy: string | null;
  elapsedSeconds: number;
  waitSeconds: number;
  tokens: number;
}

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

  if (chance.tokens < stealStake) {
    return "NO_STAKE";
  }

  return null;
}

export function stealBlockMessage(block: StealBlock): string {
  const messages: Record<StealBlock, string> = {
    NOT_PLAYING: "a partida não está em andamento",
    NOTHING_PLAYING: "nenhuma música está tocando",
    MY_TURN: "a vez é sua, não há o que roubar",
    TAKEN: "outra pessoa roubou primeiro",
    TOO_EARLY: "ainda dá tempo de quem está na vez responder",
    NO_STAKE: `precisa de ${stealStake} fichas para arriscar o roubo`,
  };

  return messages[block];
}
