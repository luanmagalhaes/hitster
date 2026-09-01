export function plural(count: number, singular: string, many: string): string {
  return count === 1 ? singular : many;
}

export function countLabel(count: number, singular: string, many: string): string {
  return `${count} ${plural(count, singular, many)}`;
}

export function tokens(count: number): string {
  return countLabel(count, "ficha", "fichas");
}

export function cards(count: number): string {
  return countLabel(count, "carta", "cartas");
}

export function verb(count: number, singular: string, many: string): string {
  return count === 1 ? singular : many;
}

export function cardsReturn(count: number): string {
  return `${cards(count)} ${verb(count, "volta", "voltam")} para o monte`;
}
