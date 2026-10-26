// @vitest-environment node
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { obtenerCliente } from "../lib/db/cliente";
import { ErrorDominioOrbital } from "../lib/db/dominio";
import { guardarOrbital, obtenerOrbital, type ResultadoOrbital } from "../lib/db/orbitales";

const urlPruebas = process.env.DATABASE_URL_PRUEBAS;
if (!urlPruebas) console.warn("Pruebas de orbitales omitidas: falta DATABASE_URL_PRUEBAS.");

const resultado: ResultadoOrbital = {
  n: 3,
  l: 2,
  version: "prueba-1",
  extension: { ancho: 4 },
  envolvente: { p: [1, 2], l: [3, 4] },
  nucleo: { p: [5, 6], l: [7, 8] },
};

describe.skipIf(!urlPruebas)("orbitales en PostgreSQL", () => {
  beforeAll(() => {
    process.env.DATABASE_URL = urlPruebas;
  });
  beforeEach(async () => {
    await obtenerCliente().orbitalCalculado.deleteMany();
  });
  afterAll(async () => {
    await obtenerCliente().orbitalCalculado.deleteMany();
  });

  it("guarda y recupera el resultado idéntico", async () => {
    await guardarOrbital(resultado);
    await expect(obtenerOrbital(3, 2, "prueba-1")).resolves.toEqual(resultado);
  });

  it("devuelve null si el orbital no existe", async () => {
    await expect(obtenerOrbital(3, 2, "ausente")).resolves.toBeNull();
  });

  it("mantiene versiones independientes", async () => {
    await guardarOrbital(resultado);
    await guardarOrbital({ ...resultado, version: "prueba-2" });
    await expect(obtenerOrbital(3, 2, "prueba-1")).resolves.toEqual(resultado);
    await expect(obtenerOrbital(3, 2, "prueba-2")).resolves.toEqual({ ...resultado, version: "prueba-2" });
  });

  it("actualiza la doble escritura sin duplicar", async () => {
    await guardarOrbital(resultado);
    const actualizado = { ...resultado, extension: { ancho: 99 } };
    await guardarOrbital(actualizado);
    expect(await obtenerCliente().orbitalCalculado.count()).toBe(1);
    await expect(obtenerOrbital(3, 2, "prueba-1")).resolves.toEqual(actualizado);
  });

  it("resuelve diez escrituras simultáneas en una sola fila", async () => {
    await Promise.all(Array.from({ length: 10 }, (_, i) => guardarOrbital({ ...resultado, extension: { i } })));
    expect(await obtenerCliente().orbitalCalculado.count()).toBe(1);
  });

  it("rechaza el dominio antes de consultar la base", async () => {
    const cliente = obtenerCliente();
    const consulta = cliente.orbitalCalculado.findUnique;
    cliente.orbitalCalculado.findUnique = (() => { throw new Error("no debe consultar"); }) as typeof consulta;
    try {
      await expect(obtenerOrbital(1, 1, "prueba-1")).rejects.toThrow(ErrorDominioOrbital);
    } finally {
      cliente.orbitalCalculado.findUnique = consulta;
    }
  });
});
