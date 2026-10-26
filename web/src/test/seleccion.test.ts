import { describe, expect, it } from "vitest";
import { esCombinacionValida, lDisponible, L_VALORES, nDisponible, N_VALORES } from "../lib/seleccion/combinaciones";

describe("combinaciones de orbitales", () => {
  it("acepta las 15 combinaciones válidas y rechaza las demás", () => {
    expect(N_VALORES.flatMap((n) => L_VALORES.filter((l) => esCombinacionValida(n, l)))).toHaveLength(15);
    for (const n of N_VALORES) for (const l of L_VALORES) expect(esCombinacionValida(n, l)).toBe(l < n);
  });

  it("habilita exactamente las opciones que conservan l < n", () => {
    for (const n of N_VALORES) for (const l of L_VALORES) if (esCombinacionValida(n, l)) {
      expect(N_VALORES.filter((valor) => nDisponible(valor, l))).toEqual(N_VALORES.filter((valor) => valor > l));
      expect(L_VALORES.filter((valor) => lDisponible(valor, n))).toEqual(L_VALORES.filter((valor) => valor < n));
      for (const valor of N_VALORES) if (nDisponible(valor, l)) expect(esCombinacionValida(valor, l)).toBe(true);
      for (const valor of L_VALORES) if (lDisponible(valor, n)) expect(esCombinacionValida(n, valor)).toBe(true);
    }
  });
});
