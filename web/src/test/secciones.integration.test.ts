// @vitest-environment node
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { obtenerCliente } from "../lib/db/cliente";
import { guardarSeccion, listarSecciones } from "../lib/db/secciones";

const urlPruebas = process.env.DATABASE_URL_PRUEBAS;
if (!urlPruebas) console.warn("Pruebas de secciones omitidas: falta DATABASE_URL_PRUEBAS.");

describe.skipIf(!urlPruebas)("secciones teóricas en PostgreSQL", () => {
  beforeAll(() => { process.env.DATABASE_URL = urlPruebas; });
  beforeEach(async () => { await obtenerCliente().seccionTeorica.deleteMany(); });
  afterAll(async () => { await obtenerCliente().seccionTeorica.deleteMany(); });

  it("lista por orden ascendente", async () => {
    await guardarSeccion({ clave: "tres", orden: 3, titulo: "Tres", contenido: "3" });
    await guardarSeccion({ clave: "uno", orden: 1, titulo: "Uno", contenido: "1" });
    await guardarSeccion({ clave: "dos", orden: 2, titulo: "Dos", contenido: "2" });
    expect((await listarSecciones()).map((seccion) => seccion.orden)).toEqual([1, 2, 3]);
  });

  it("conserva el Markdown, saltos, fórmulas y tildes", async () => {
    const contenido = "Línea uno\n\n**negrita** y Ψ(r, θ, φ)\n\náéíóú ñ";
    await guardarSeccion({ clave: "markdown", orden: 1, titulo: "Teoría", contenido });
    expect((await listarSecciones())[0].contenido).toBe(contenido);
  });

  it("actualiza por clave sin duplicar", async () => {
    await guardarSeccion({ clave: "estable", orden: 1, titulo: "Antes", contenido: "a" });
    await guardarSeccion({ clave: "estable", orden: 2, titulo: "Después", contenido: "b" });
    expect(await obtenerCliente().seccionTeorica.count()).toBe(1);
    expect((await listarSecciones())[0]).toMatchObject({ clave: "estable", titulo: "Después", contenido: "b" });
  });
});
