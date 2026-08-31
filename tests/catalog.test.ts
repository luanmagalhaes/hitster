import { describe, expect, it } from "vitest";
import { allTracks, internationalTracks, nationalTracks, trackById, tracksForDeck } from "@/data/tracks";

describe("catalogo", () => {
  it("tem faixas nos dois baralhos", () => {
    expect(nationalTracks.length).toBeGreaterThan(100);
    expect(internationalTracks.length).toBeGreaterThan(100);
    expect(allTracks).toHaveLength(nationalTracks.length + internationalTracks.length);
  });

  it("nao repete id", () => {
    const ids = allTracks.map((track) => track.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("nao repete a mesma musica do mesmo artista", () => {
    const keys = allTracks.map((track) => `${track.artist}::${track.title}`.toLowerCase());

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("usa anos plausiveis", () => {
    const currentYear = new Date().getFullYear();

    for (const track of allTracks) {
      expect(track.year).toBeGreaterThanOrEqual(1940);
      expect(track.year).toBeLessThanOrEqual(currentYear);
    }
  });

  it("nao deixa artista nem titulo vazio", () => {
    for (const track of allTracks) {
      expect(track.artist.trim().length).toBeGreaterThan(0);
      expect(track.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("marca o baralho de cada faixa", () => {
    expect(nationalTracks.every((track) => track.deck === "NATIONAL")).toBe(true);
    expect(internationalTracks.every((track) => track.deck === "INTERNATIONAL")).toBe(true);
  });

  it("filtra por baralho", () => {
    expect(tracksForDeck("NATIONAL")).toEqual(nationalTracks);
    expect(tracksForDeck("INTERNATIONAL")).toEqual(internationalTracks);
    expect(tracksForDeck("MIXED")).toEqual(allTracks);
  });

  it("acha faixa por id e devolve vazio para id desconhecido", () => {
    expect(trackById(allTracks[0].id)?.title).toBe(allTracks[0].title);
    expect(trackById("nao-existe")).toBeUndefined();
  });

  it("cobre todas as decadas de 1960 a 2020", () => {
    const decades = new Set(allTracks.map((track) => Math.floor(track.year / 10) * 10));

    for (const decade of [1960, 1970, 1980, 1990, 2000, 2010, 2020]) {
      expect(decades.has(decade)).toBe(true);
    }
  });
});
