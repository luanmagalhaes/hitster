export type TurnAlert = "VIBRATE" | "CHIME";

export function alertKind(canVibrate: boolean): TurnAlert {
  return canVibrate ? "VIBRATE" : "CHIME";
}

export function shouldBuzz(previous: boolean | null, isMyTurn: boolean): boolean {
  if (previous === null) {
    return false;
  }

  return isMyTurn && !previous;
}

export function canBuzz(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function buzz(): boolean {
  if (!canBuzz()) {
    return false;
  }

  try {
    return navigator.vibrate(220);
  } catch {
    return false;
  }
}
