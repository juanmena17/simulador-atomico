import { describe, expect, it } from "vitest";
import path from "node:path";
import { leerOrigenes } from "../lib/carga/leer-origenes";
import { ErrorValidacionCarga, validarOrigenes } from "../lib/carga/validar";

const datos = () => leerOrigenes({ directorioDatos: path.resolve(process.cwd(), "datos") });

describe("orígenes de carga", () => {
  it("lee y valida los datos reales", async () => {
    await expect(datos().then((origenes) => validarOrigenes(origenes))).resolves.toBeUndefined();
  });

  it("acumula orbital fuera de dominio, versión mezclada, repetido y faltante", async () => {
    const origenes = await datos();
    const orbitales = origenes.orbitales as { version: string; orbitales: Array<Record<string, unknown>> };
    orbitales.orbitales = orbitales.orbitales.slice(0, 14);
    orbitales.orbitales.push({ ...orbitales.orbitales[0], n: 1, l: 1, version: "otra" });
    expect(() => validarOrigenes(origenes)).toThrowError(ErrorValidacionCarga);
    try { validarOrigenes(origenes); } catch (error) {
      expect((error as ErrorValidacionCarga).problemas.join(" ")).toMatch(/fuera de dominio|versión distinta|repetida|falta orbital/);
    }
  });

  it("detecta secciones sin título, orden, contenido y orden repetido", async () => {
    const origenes = await datos();
    origenes.secciones[0] = { clave: "uno", orden: 1, titulo: "", contenido: "" };
    origenes.secciones[1] = { clave: "dos", orden: 1, contenido: "texto" };
    expect(() => validarOrigenes(origenes)).toThrow(/título|orden repetido|contenido/);
  });
});
