import { describe, expect, it } from "vitest";
import { orbitalLabelFromL, shellLabelFromN } from "../lib/quantum-labels";

describe("etiquetas cuánticas", () => {
  it("deriva las capas K a O para n de 1 a 5", () => {
    expect([1, 2, 3, 4, 5].map(shellLabelFromN)).toEqual(["K", "L", "M", "N", "O"]);
  });

  it("deriva los orbitales s a g para l de 0 a 4", () => {
    expect([0, 1, 2, 3, 4].map((l) => orbitalLabelFromL(l))).toEqual(["s", "p", "d", "f", "g"]);
  });

  it("rechaza valores fuera de rango, no enteros y l incompatible con n", () => {
    for (const n of [0, 6, 1.5, NaN]) expect(() => shellLabelFromN(n)).toThrow(RangeError);
    for (const l of [-1, 5, 1.5, NaN]) expect(() => orbitalLabelFromL(l)).toThrow(RangeError);
    expect(() => orbitalLabelFromL(1, 1)).toThrow(RangeError);
    expect(() => orbitalLabelFromL(0, 1.5)).toThrow(RangeError);
  });
});
