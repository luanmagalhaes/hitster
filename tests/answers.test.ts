import { describe, expect, it } from "vitest";
import { answerMatches, closeEnough, editDistance, normalize } from "@/lib/deezer";

describe("distancia de edicao", () => {
  it("conta zero para textos iguais", () => {
    expect(editDistance("queen", "queen")).toBe(0);
  });

  it("conta uma troca de letras vizinhas como um erro", () => {
    expect(editDistance("whiteny", "whitney")).toBe(1);
  });

  it("conta letra faltando, sobrando e trocada", () => {
    expect(editDistance("beyonce", "beyoncee")).toBe(1);
    expect(editDistance("adele", "adel")).toBe(1);
    expect(editDistance("nirvana", "nirvena")).toBe(1);
  });
});

describe("tolerancia de digitacao", () => {
  it("aceita erro pequeno em palavra longa", () => {
    expect(closeEnough("whiteny houston", "whitney houston")).toBe(true);
    expect(closeEnough("bohemian rapsody", "bohemian rhapsody")).toBe(true);
  });

  it("exige exatidao em palavra muito curta", () => {
    expect(closeEnough("abba", "abba")).toBe(true);
    expect(closeEnough("aba", "abba")).toBe(false);
  });

  it("nao aceita nomes realmente diferentes", () => {
    expect(closeEnough("queen", "prince")).toBe(false);
    expect(closeEnough("madonna", "rihanna")).toBe(false);
  });
});

describe("comparacao de resposta do jogador", () => {
  it("aceita o caso que motivou a mudanca", () => {
    expect(answerMatches("whiteny houston", "Whitney Houston")).toBe(true);
    expect(answerMatches("Whiteny Houston", "Whitney Houston")).toBe(true);
  });

  it("aceita acento faltando e caixa diferente", () => {
    expect(answerMatches("legiao urbana", "Legião Urbana")).toBe(true);
    expect(answerMatches("RACIONAIS", "Racionais MC's")).toBe(true);
  });

  it("aceita nome parcial de artista", () => {
    expect(answerMatches("michael", "Michael Jackson")).toBe(true);
    expect(answerMatches("legiao", "Legião Urbana")).toBe(true);
  });

  it("aceita titulo com erro de digitacao", () => {
    expect(answerMatches("tempo perdidoo", "Tempo Perdido")).toBe(true);
    expect(answerMatches("evidencias", "Evidências")).toBe(true);
    expect(answerMatches("dancing quen", "Dancing Queen")).toBe(true);
  });

  it("recusa resposta errada de verdade", () => {
    expect(answerMatches("queen", "Legião Urbana")).toBe(false);
    expect(answerMatches("asa branca", "Tempo Perdido")).toBe(false);
    expect(answerMatches("djavan", "Djonga")).toBe(false);
  });

  it("recusa palpite vazio ou minusculo", () => {
    expect(answerMatches("", "Tempo Perdido")).toBe(false);
    expect(answerMatches("  ", "Tempo Perdido")).toBe(false);
    expect(answerMatches("a", "Anitta")).toBe(false);
  });

  it("normaliza tirando acento, parenteses e marcacoes de versao", () => {
    expect(normalize("Diário de um Detento (Ao Vivo)")).toBe("diario de um detento");
    expect(normalize("Believe - Remastered")).toBe("believe");
  });
});

describe("texto do palpite no modal", () => {
  const cases: Array<[string | null | undefined, string]> = [
    ["Arctic Monkeys", "“Arctic Monkeys”"],
    ["  Queen  ", "“Queen”"],
    [null, "outro nome"],
    [undefined, "outro nome"],
    ["", "outro nome"],
    ["   ", "outro nome"],
  ];

  it.each(cases)("formata %s como %s", (value, expected) => {
    const clean = value?.trim();

    expect(clean ? `“${clean}”` : "outro nome").toBe(expected);
  });
});
