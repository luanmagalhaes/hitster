export interface TimelineSlot {
  index: number;
  lowerYear: number | null;
  upperYear: number | null;
}

export function slotsFor(years: readonly number[]): TimelineSlot[] {
  const sorted = [...years].sort((a, b) => a - b);

  return Array.from({ length: sorted.length + 1 }, (_, index) => ({
    index,
    lowerYear: index === 0 ? null : sorted[index - 1],
    upperYear: index === sorted.length ? null : sorted[index],
  }));
}

export function isSlotCorrect(
  years: readonly number[],
  slotIndex: number,
  year: number,
): boolean {
  const slots = slotsFor(years);
  const slot = slots[slotIndex];

  if (!slot) {
    return false;
  }

  const aboveLower = slot.lowerYear === null || year >= slot.lowerYear;
  const belowUpper = slot.upperYear === null || year <= slot.upperYear;

  return aboveLower && belowUpper;
}

export function correctSlotIndex(years: readonly number[], year: number): number {
  const slots = slotsFor(years);
  const found = slots.findIndex((slot) => {
    const aboveLower = slot.lowerYear === null || year >= slot.lowerYear;
    const belowUpper = slot.upperYear === null || year <= slot.upperYear;

    return aboveLower && belowUpper;
  });

  return found === -1 ? slots.length - 1 : found;
}

export function nextSeat(currentSeat: number, seats: readonly number[]): number {
  const sorted = [...seats].sort((a, b) => a - b);
  const after = sorted.find((seat) => seat > currentSeat);

  return after ?? sorted[0] ?? currentSeat;
}

export function slotLabel(lower: number | null, upper: number | null): string {
  if (lower === null && upper !== null) {
    return `antes de ${upper}`;
  }

  if (upper === null && lower !== null) {
    return `depois de ${lower}`;
  }

  if (lower !== null && upper !== null) {
    return lower === upper ? `em ${lower}` : `entre ${lower} e ${upper}`;
  }

  return "em qualquer ano";
}

export function labelForSlot(years: readonly number[], slotIndex: number): string {
  const slot = slotsFor(years)[slotIndex];

  return slot ? slotLabel(slot.lowerYear, slot.upperYear) : "posição inválida";
}

export function isValidSlot(years: readonly number[], slotIndex: number): boolean {
  return (
    Number.isInteger(slotIndex) && slotIndex >= 0 && slotIndex <= years.length
  );
}
