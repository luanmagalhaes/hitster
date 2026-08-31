import { describe, expect, it } from "vitest";
import {
  correctSlotIndex,
  isSlotCorrect,
  isValidSlot,
  labelForSlot,
  nextSeat,
  slotLabel,
  slotsFor,
} from "@/lib/game/timeline";

describe("slots da linha do tempo", () => {
  it("cria um slot a mais que o numero de cartas", () => {
    expect(slotsFor([])).toHaveLength(1);
    expect(slotsFor([1990])).toHaveLength(2);
    expect(slotsFor([1990, 2000, 2010])).toHaveLength(4);
  });

  it("abre o primeiro slot para baixo e o ultimo para cima", () => {
    const slots = slotsFor([1990, 2000]);

    expect(slots[0]).toEqual({ index: 0, lowerYear: null, upperYear: 1990 });
    expect(slots[2]).toEqual({ index: 2, lowerYear: 2000, upperYear: null });
  });

  it("ordena as cartas antes de montar os slots", () => {
    const slots = slotsFor([2010, 1980, 1995]);

    expect(slots.map((slot) => slot.upperYear)).toEqual([1980, 1995, 2010, null]);
  });
});

describe("validacao de posicao", () => {
  const years = [1990, 2000, 2010];

  it("aceita o intervalo correto", () => {
    expect(isSlotCorrect(years, 0, 1975)).toBe(true);
    expect(isSlotCorrect(years, 1, 1995)).toBe(true);
    expect(isSlotCorrect(years, 2, 2005)).toBe(true);
    expect(isSlotCorrect(years, 3, 2020)).toBe(true);
  });

  it("recusa o intervalo errado", () => {
    expect(isSlotCorrect(years, 0, 1995)).toBe(false);
    expect(isSlotCorrect(years, 3, 1995)).toBe(false);
    expect(isSlotCorrect(years, 1, 2020)).toBe(false);
  });

  it("aceita o ano exato de uma borda nos dois slots vizinhos", () => {
    expect(isSlotCorrect(years, 0, 1990)).toBe(true);
    expect(isSlotCorrect(years, 1, 1990)).toBe(true);
  });

  it("aceita qualquer ano quando a linha esta vazia", () => {
    expect(isSlotCorrect([], 0, 1950)).toBe(true);
    expect(isSlotCorrect([], 0, 2024)).toBe(true);
  });

  it("recusa indice fora do alcance em vez de estourar", () => {
    expect(isSlotCorrect(years, 99, 1995)).toBe(false);
    expect(isSlotCorrect(years, -1, 1995)).toBe(false);
    expect(isSlotCorrect(years, Number.NaN, 1995)).toBe(false);
  });
});

describe("slot correto para o ano", () => {
  const years = [1990, 2000, 2010];

  it("aponta o intervalo onde o ano cabe", () => {
    expect(correctSlotIndex(years, 1975)).toBe(0);
    expect(correctSlotIndex(years, 1995)).toBe(1);
    expect(correctSlotIndex(years, 2005)).toBe(2);
    expect(correctSlotIndex(years, 2020)).toBe(3);
  });

  it("funciona com a linha vazia", () => {
    expect(correctSlotIndex([], 1999)).toBe(0);
  });
});

describe("rotulo do intervalo", () => {
  it("descreve os tres formatos", () => {
    expect(slotLabel(null, 1990)).toBe("antes de 1990");
    expect(slotLabel(2010, null)).toBe("depois de 2010");
    expect(slotLabel(1990, 2000)).toBe("entre 1990 e 2000");
    expect(slotLabel(1990, 1990)).toBe("em 1990");
  });

  it("descreve o slot pelo indice", () => {
    expect(labelForSlot([1990, 2000], 0)).toBe("antes de 1990");
    expect(labelForSlot([1990, 2000], 1)).toBe("entre 1990 e 2000");
    expect(labelForSlot([1990, 2000], 2)).toBe("depois de 2000");
  });

  it("avisa quando o indice nao existe", () => {
    expect(labelForSlot([1990], 9)).toBe("posição inválida");
  });
});

describe("rotacao de turno", () => {
  it("passa para o proximo assento", () => {
    expect(nextSeat(1, [1, 2, 3])).toBe(2);
    expect(nextSeat(2, [1, 2, 3])).toBe(3);
  });

  it("volta para o primeiro depois do ultimo", () => {
    expect(nextSeat(3, [1, 2, 3])).toBe(1);
  });

  it("pula assentos que nao existem mais", () => {
    expect(nextSeat(2, [1, 4, 7])).toBe(4);
    expect(nextSeat(7, [1, 4, 7])).toBe(1);
  });

  it("mantem o assento quando joga sozinho", () => {
    expect(nextSeat(1, [1])).toBe(1);
  });
});

describe("validacao do indice enviado pelo cliente", () => {
  const years = [1990, 2000];

  it("aceita todos os slots reais", () => {
    expect(isValidSlot(years, 0)).toBe(true);
    expect(isValidSlot(years, 1)).toBe(true);
    expect(isValidSlot(years, 2)).toBe(true);
  });

  it("recusa indice acima do ultimo slot", () => {
    expect(isValidSlot(years, 3)).toBe(false);
    expect(isValidSlot(years, 99)).toBe(false);
  });

  it("recusa negativo, quebrado e nao numero", () => {
    expect(isValidSlot(years, -1)).toBe(false);
    expect(isValidSlot(years, 1.5)).toBe(false);
    expect(isValidSlot(years, Number.NaN)).toBe(false);
    expect(isValidSlot(years, Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("aceita o unico slot da linha vazia", () => {
    expect(isValidSlot([], 0)).toBe(true);
    expect(isValidSlot([], 1)).toBe(false);
  });
});
