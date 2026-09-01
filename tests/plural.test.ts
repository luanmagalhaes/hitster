import { describe, expect, it } from "vitest";
import { cards, cardsReturn, countLabel, plural, tokens, verb } from "@/utils/plural";

describe("plural", () => {
  it("usa singular so no um", () => {
    expect(plural(1, "ficha", "fichas")).toBe("ficha");
    expect(plural(0, "ficha", "fichas")).toBe("fichas");
    expect(plural(2, "ficha", "fichas")).toBe("fichas");
    expect(plural(10, "ficha", "fichas")).toBe("fichas");
  });

  it("monta a contagem com a palavra certa", () => {
    expect(countLabel(1, "carta", "cartas")).toBe("1 carta");
    expect(countLabel(3, "carta", "cartas")).toBe("3 cartas");
  });

  it("cobre os casos do jogo", () => {
    expect(tokens(0)).toBe("0 fichas");
    expect(tokens(1)).toBe("1 ficha");
    expect(tokens(2)).toBe("2 fichas");
    expect(cards(1)).toBe("1 carta");
    expect(cards(4)).toBe("4 cartas");
  });
});

describe("concordancia verbal", () => {
  it("conjuga o verbo com a contagem", () => {
    expect(verb(1, "volta", "voltam")).toBe("volta");
    expect(verb(0, "volta", "voltam")).toBe("voltam");
    expect(verb(3, "volta", "voltam")).toBe("voltam");
  });

  it("monta a frase de devolucao sem erro de concordancia", () => {
    expect(cardsReturn(1)).toBe("1 carta volta para o monte");
    expect(cardsReturn(2)).toBe("2 cartas voltam para o monte");
    expect(cardsReturn(0)).toBe("0 cartas voltam para o monte");
  });
});
