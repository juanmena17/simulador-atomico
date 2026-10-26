import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorConsultaOrbital } from "../lib/seleccion/cliente-api";
import { CLASIFICACION_CODIGOS, pedirOrbitalConReintentos } from "../lib/seleccion/reintentos";
import type { OrbitalApi } from "../lib/visor/tipos";

const orbital = { n: 1, l: 0 } as OrbitalApi;

afterEach(() => vi.useRealTimers());

describe("reintentos de orbital", () => {
  it("reintenta un fallo de servidor después de 500 ms", async () => {
    vi.useFakeTimers();
    const pedir = vi.fn()
      .mockRejectedValueOnce(new ErrorConsultaOrbital("servicio_no_disponible"))
      .mockResolvedValueOnce(orbital);
    const resultado = pedirOrbitalConReintentos(1, 0, { pedir });
    await Promise.resolve();
    expect(pedir).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(500);
    await expect(resultado).resolves.toBe(orbital);
    expect(pedir).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("no reintenta errores no recuperables", async () => {
    vi.useFakeTimers();
    const pedir = vi.fn().mockRejectedValue(new ErrorConsultaOrbital("orbital_invalido"));
    await expect(pedirOrbitalConReintentos(1, 0, { pedir })).rejects.toMatchObject({ codigo: "orbital_invalido" });
    expect(pedir).toHaveBeenCalledOnce();
    expect(CLASIFICACION_CODIGOS.orbital_invalido).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
