import { describe, expect, it, vi } from "vitest";
import { ErrorConsultaOrbital, pedirOrbital, RAZON_TIEMPO_INTENTO, RAZON_TIEMPO_TOTAL } from "../lib/seleccion/cliente-api";
import { VERSION_ALGORITMO_VIGENTE } from "../lib/api/version";
import type { OrbitalApi } from "../lib/visor/tipos";

const orbital: OrbitalApi = { n: 1, l: 0, version: VERSION_ALGORITMO_VIGENTE, extension: 1, envolvente: { p: "a", l: [1] }, nucleo: { p: "b", l: [2] } };
const respuesta = (status: number, cuerpo: unknown) => ({ status, json: vi.fn().mockResolvedValue(cuerpo) }) as unknown as Response;

describe("cliente de orbitales", () => {
  it("hace una petición GET con la URL exacta y devuelve la respuesta válida", async () => {
    const fetchFn = vi.fn().mockResolvedValue(respuesta(200, orbital));
    await expect(pedirOrbital(1, 0, { fetchFn })).resolves.toEqual(orbital);
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(fetchFn).toHaveBeenCalledWith(`/api/orbital?n=1&l=0&v=${VERSION_ALGORITMO_VIGENTE}`, { method: "GET" });
  });

  it.each(["orbital_invalido", "servicio_no_disponible", "bd_no_disponible"])("propaga el código %s", async (codigo) => {
    const fetchFn = vi.fn().mockResolvedValue(respuesta(502, { error: { codigo } }));
    await expect(pedirOrbital(1, 0, { fetchFn })).rejects.toMatchObject({ codigo });
  });

  it("distingue red y respuestas inválidas", async () => {
    await expect(pedirOrbital(1, 0, { fetchFn: vi.fn().mockRejectedValue(new Error("caída")) })).rejects.toMatchObject({ codigo: "red" });
    await expect(pedirOrbital(1, 0, { fetchFn: vi.fn().mockResolvedValue(respuesta(200, { n: 2 })) })).rejects.toMatchObject({ codigo: "respuesta_invalida" });
    await expect(pedirOrbital(1, 0, { fetchFn: vi.fn().mockResolvedValue({ status: 200, json: vi.fn().mockRejectedValue(new Error()) } as unknown as Response) })).rejects.toBeInstanceOf(ErrorConsultaOrbital);
  });
  it.each([
    [RAZON_TIEMPO_INTENTO, "tiempo_agotado"],
    [RAZON_TIEMPO_TOTAL, "tiempo_agotado_total"],
    ["otra", "tiempo_agotado"],
  ])("traduce la razón de aborto %s", async (razon, codigo) => {
    const controlador = new AbortController();
    controlador.abort(razon);
    const fetchFn = vi.fn();
    await expect(pedirOrbital(1, 0, { fetchFn, signal: controlador.signal })).rejects.toMatchObject({ codigo });
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
