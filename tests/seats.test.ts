import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.stubGlobal("window", {
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  },
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  history: { replaceState: () => undefined },
  location: { search: "", pathname: "/" },
});

const { forgetSeat, saveSession, seatFor, seatsSnapshot, subscribeSeats } = await import(
  "@/lib/session"
);

describe("assentos guardados", () => {
  beforeEach(() => {
    store.clear();
  });

  it("guarda o assento ao salvar a sessao", () => {
    saveSession({ code: "ABC123", playerId: "p1", accessToken: "t1", name: "Lulu" });

    expect(seatsSnapshot()).toHaveLength(1);
    expect(seatsSnapshot()[0].code).toBe("ABC123");
  });

  it("acha o assento pelo codigo e nome, ignorando caixa", () => {
    saveSession({ code: "ABC123", playerId: "p1", accessToken: "t1", name: "Lulu" });

    expect(seatFor("abc123", "lulu")?.accessToken).toBe("t1");
    expect(seatFor("ABC123", "LULU")?.accessToken).toBe("t1");
    expect(seatFor("ABC123", "Outro")).toBeNull();
  });

  it("esquecer remove de verdade", () => {
    saveSession({ code: "ABC123", playerId: "p1", accessToken: "t1", name: "Lulu" });
    saveSession({ code: "XYZ789", playerId: "p2", accessToken: "t2", name: "Lulu" });

    expect(seatsSnapshot()).toHaveLength(2);

    forgetSeat("ABC123");

    expect(seatsSnapshot()).toHaveLength(1);
    expect(seatsSnapshot()[0].code).toBe("XYZ789");
    expect(seatFor("ABC123", "Lulu")).toBeNull();
  });

  it("avisa quem esta ouvindo quando a lista muda", () => {
    const listener = vi.fn();
    const stop = subscribeSeats(listener);

    saveSession({ code: "ABC123", playerId: "p1", accessToken: "t1", name: "Lulu" });
    expect(listener).toHaveBeenCalled();

    listener.mockClear();
    forgetSeat("ABC123");
    expect(listener).toHaveBeenCalled();

    stop();
  });

  it("devolve a mesma referencia quando nada mudou", () => {
    saveSession({ code: "ABC123", playerId: "p1", accessToken: "t1", name: "Lulu" });

    expect(seatsSnapshot()).toBe(seatsSnapshot());
  });

  it("nao duplica o mesmo jogador na mesma sala", () => {
    saveSession({ code: "ABC123", playerId: "p1", accessToken: "t1", name: "Lulu" });
    saveSession({ code: "ABC123", playerId: "p1", accessToken: "t9", name: "Lulu" });

    expect(seatsSnapshot()).toHaveLength(1);
    expect(seatsSnapshot()[0].accessToken).toBe("t9");
  });
});
