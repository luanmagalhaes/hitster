import { describe, expect, it } from "vitest";
import {
  windowFor,
  secondsUntilSteal,
  stealBlock,
  stealBlockMessage,
  stealPenaltyCards,
  type StealChance,
} from "@/lib/game/steal";

function chance(patch: Partial<StealChance> = {}): StealChance {
  return {
    playing: true,
    trackPlaying: true,
    isMyTurn: false,
    stolenBy: null,
    elapsedSeconds: 31,
    waitSeconds: 30,
    spareCards: 3,
    ...patch,
  };
}

describe("quem pode roubar", () => {
  it("libera depois dos 30 segundos", () => {
    expect(stealBlock(chance())).toBeNull();
  });

  it("segura antes dos 30 segundos", () => {
    expect(stealBlock(chance({ elapsedSeconds: 29.9 }))).toBe("TOO_EARLY");
  });

  it("segura no segundo exato de virada, sem arredondar a favor", () => {
    expect(stealBlock(chance({ elapsedSeconds: 29.999 }))).toBe("TOO_EARLY");
    expect(stealBlock(chance({ elapsedSeconds: 30 }))).toBeNull();
  });

  it("não deixa a pessoa da vez roubar de si mesma", () => {
    expect(stealBlock(chance({ isMyTurn: true }))).toBe("MY_TURN");
  });

  it("recusa quando alguém já roubou", () => {
    expect(stealBlock(chance({ stolenBy: "outro-jogador" }))).toBe("TAKEN");
  });

  it("recusa quem só tem a carta de saída, que não pode ser apostada", () => {
    expect(stealBlock(chance({ spareCards: 0 }))).toBe("NO_CARD");
  });

  it("aceita com exatamente uma carta para apostar", () => {
    expect(stealBlock(chance({ spareCards: stealPenaltyCards }))).toBeNull();
  });

  it("recusa sem música tocando", () => {
    expect(stealBlock(chance({ trackPlaying: false }))).toBe("NOTHING_PLAYING");
  });

  it("recusa fora da partida", () => {
    expect(stealBlock(chance({ playing: false }))).toBe("NOT_PLAYING");
  });

  it("checa a partida antes de qualquer outra coisa", () => {
    expect(stealBlock(chance({ playing: false, isMyTurn: true, spareCards: 0 }))).toBe(
      "NOT_PLAYING",
    );
  });
});

describe("contagem até liberar o roubo", () => {
  it("arredonda para cima, para nunca prometer menos tempo do que existe", () => {
    expect(secondsUntilSteal(0, 30)).toBe(30);
    expect(secondsUntilSteal(29.1, 30)).toBe(1);
    expect(secondsUntilSteal(29.9, 30)).toBe(1);
  });

  it("chega a zero e não fica negativo", () => {
    expect(secondsUntilSteal(30, 30)).toBe(0);
    expect(secondsUntilSteal(120, 30)).toBe(0);
  });
});

describe("mensagens de recusa", () => {
  it("explica cada bloqueio em português", () => {
    expect(stealBlockMessage("TOO_EARLY")).toContain("tempo");
    expect(stealBlockMessage("TAKEN")).toContain("primeiro");
    expect(stealBlockMessage("NO_CARD")).toContain("saída");
  });
});

describe("janela de resposta por modalidade", () => {
  it("no Clássico dá sempre os mesmos 30 segundos", () => {
    expect(windowFor("CLASSIC", 0)).toBe(30);
    expect(windowFor("CLASSIC", 3)).toBe(30);
  });

  it("no Relâmpago começa com 5 segundos para quem está na vez", () => {
    expect(windowFor("LIGHTNING", 0)).toBe(5);
  });

  it("cresce de cinco em cinco a cada roubo", () => {
    expect(windowFor("LIGHTNING", 1)).toBe(10);
    expect(windowFor("LIGHTNING", 2)).toBe(15);
    expect(windowFor("LIGHTNING", 3)).toBe(20);
    expect(windowFor("LIGHTNING", 4)).toBe(25);
  });

  it("para de crescer nos 30 segundos", () => {
    expect(windowFor("LIGHTNING", 5)).toBe(30);
    expect(windowFor("LIGHTNING", 9)).toBe(30);
    expect(windowFor("LIGHTNING", 40)).toBe(30);
  });

  it("nunca devolve janela negativa nem menor que a primeira", () => {
    expect(windowFor("LIGHTNING", -3)).toBe(5);
  });
});
