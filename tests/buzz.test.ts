import { describe, expect, it } from "vitest";
import { shouldBuzz } from "@/lib/game/buzz";

describe("quando o celular deve vibrar", () => {
  it("fica quieto na primeira leitura, mesmo sendo minha vez", () => {
    expect(shouldBuzz(null, true)).toBe(false);
  });

  it("vibra quando a vez passa a ser minha", () => {
    expect(shouldBuzz(false, true)).toBe(true);
  });

  it("não vibra de novo enquanto a vez continua minha", () => {
    expect(shouldBuzz(true, true)).toBe(false);
  });

  it("não vibra quando a vez sai de mim", () => {
    expect(shouldBuzz(true, false)).toBe(false);
  });

  it("não vibra na vez de outra pessoa", () => {
    expect(shouldBuzz(false, false)).toBe(false);
  });

  it("não vibra em recarregamento no meio da minha vez", () => {
    expect(shouldBuzz(null, true)).toBe(false);
  });
});
