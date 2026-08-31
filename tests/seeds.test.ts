import { describe, expect, it } from "vitest";
import { allTracks, nationalTracks } from "@/data/tracks";
import { difficultyPresets, pickSpreadSeeds } from "@/lib/game/seeds";
import { createSeededRng } from "@/utils/shuffle";

describe("sementes da mesa", () => {
  it("devolve a quantidade pedida", () => {
    for (const count of [1, 3, 5]) {
      expect(pickSpreadSeeds(allTracks, count, createSeededRng(7))).toHaveLength(count);
    }
  });

  it("nao repete faixa na mesma mao", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const chosen = pickSpreadSeeds(allTracks, 5, createSeededRng(seed));
      const ids = chosen.map((track) => track.id);

      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("devolve as cartas em ordem de ano", () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const years = pickSpreadSeeds(allTracks, 5, createSeededRng(seed)).map((t) => t.year);

      expect([...years].sort((a, b) => a - b)).toEqual(years);
    }
  });

  it("nao repete ano dentro da mesma mao na maioria das partidas", () => {
    let distinct = 0;

    for (let seed = 1; seed <= 50; seed += 1) {
      const years = pickSpreadSeeds(allTracks, 3, createSeededRng(seed)).map((t) => t.year);

      if (new Set(years).size === years.length) {
        distinct += 1;
      }
    }

    expect(distinct).toBeGreaterThanOrEqual(45);
  });

  it("espalha as sementes por decadas diferentes", () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const decades = pickSpreadSeeds(allTracks, 3, createSeededRng(seed)).map((track) =>
        Math.floor(track.year / 10) * 10,
      );

      expect(new Set(decades).size).toBe(decades.length);
    }
  });

  it("funciona com um baralho so", () => {
    expect(pickSpreadSeeds(nationalTracks, 5, createSeededRng(3))).toHaveLength(5);
  });

  it("nao estoura quando pedem mais cartas do que existem", () => {
    const tiny = allTracks.slice(0, 2);

    expect(pickSpreadSeeds(tiny, 5, createSeededRng(1)).length).toBeLessThanOrEqual(2);
  });

  it("mantem os modos coerentes entre si", () => {
    expect(difficultyPresets.CLASSIC.seedCards).toBeLessThan(difficultyPresets.QUICK.seedCards);
    expect(difficultyPresets.QUICK.seedCards).toBeLessThan(difficultyPresets.MARATHON.seedCards);
    expect(difficultyPresets.MARATHON.targetCards).toBeGreaterThan(
      difficultyPresets.CLASSIC.targetCards,
    );
  });

  it("o classico e o mais fiel: uma carta de saida", () => {
    expect(difficultyPresets.CLASSIC.seedCards).toBe(1);
    expect(difficultyPresets.CLASSIC.targetCards).toBe(10);
  });

  it("o rapido encurta a partida em vez de dificultar", () => {
    expect(difficultyPresets.QUICK.targetCards).toBeLessThan(
      difficultyPresets.CLASSIC.targetCards,
    );
  });

  it("cabe o pior caso: 10 jogadores na maratona", () => {
    const needed = difficultyPresets.MARATHON.seedCards * 10;

    expect(nationalTracks.length).toBeGreaterThan(needed);
    expect(allTracks.length).toBeGreaterThan(needed);
  });
});
