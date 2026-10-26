// @vitest-environment node
import { Client } from "pg";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { cargarOrigenes } from "../lib/carga/cargar";
import { leerOrigenes, type Origenes } from "../lib/carga/leer-origenes";
import { ErrorValidacionCarga, validarOrigenes } from "../lib/carga/validar";

const urlBase = process.env.DATABASE_URL_PRUEBAS;
if (!urlBase) console.warn("Pruebas de carga omitidas: falta DATABASE_URL_PRUEBAS.");

const esquemas: string[] = [];
const directorioDatos = path.resolve(__dirname, "../../datos");

function crearUrlEsquema(esquema: string): string {
  const url = new URL(urlBase!);
  url.searchParams.set("schema", esquema);
  url.searchParams.set("options", `-c search_path=${esquema}`);
  return url.toString();
}

async function migrarEsquema(url: string): Promise<void> {
  const prismaCli = path.resolve(__dirname, "../../node_modules/prisma/build/index.js");
  const resultado = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    cwd: path.resolve(__dirname, "../.."),
    env: { ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url },
    encoding: "utf8",
    timeout: 30000,
  });
  if (resultado.status !== 0) throw new Error("No se pudieron aplicar las migraciones de prueba.");
}

function crearClienteEsquema(url: string, esquema: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg(url, { schema: esquema }) });
}

async function crearEsquema(): Promise<{ esquema: string; url: string }> {
  const esquema = `prueba_carga_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const cliente = new Client({ connectionString: urlBase });
  await cliente.connect();
  await cliente.query(`CREATE SCHEMA "${esquema}"`);
  await cliente.end();
  const url = crearUrlEsquema(esquema);
  try {
    await migrarEsquema(url);
  } catch (error) {
    await eliminarEsquema(esquema);
    throw error;
  }
  esquemas.push(esquema);
  return { esquema, url };
}

async function eliminarEsquema(esquema: string): Promise<void> {
  const cliente = new Client({ connectionString: urlBase });
  await cliente.connect();
  await cliente.query(`DROP SCHEMA IF EXISTS "${esquema}" CASCADE`);
  await cliente.end();
}

async function limpiarEsquemasResiduales(): Promise<void> {
  const cliente = new Client({ connectionString: urlBase });
  await cliente.connect();
  const resultado = await cliente.query<{ schema_name: string }>("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'prueba_carga_%'");
  for (const fila of resultado.rows) await cliente.query(`DROP SCHEMA IF EXISTS "${fila.schema_name}" CASCADE`);
  await cliente.end();
}

async function conBase<T>(operacion: (origenes: Origenes, cliente: PrismaClient) => Promise<T>): Promise<T> {
  const { esquema, url } = await crearEsquema();
  const cliente = crearClienteEsquema(url, esquema);
  try {
    return await operacion(await leerOrigenes({ directorioDatos }), cliente);
  } finally {
    await cliente.$disconnect();
    await eliminarEsquema(esquema);
    esquemas.splice(esquemas.indexOf(esquema), 1);
  }
}

function copiarOrigenes(origenes: Origenes): Origenes {
  return structuredClone(origenes);
}

describe.skipIf(!urlBase)("carga inicial de datos", () => {
  beforeAll(limpiarEsquemasResiduales);
  it("carga una base vacía con 15 orbitales y 3 secciones", async () => {
    await conBase(async (origenes, cliente) => {
      const resumen = await cargarOrigenes(origenes, cliente);
      expect(resumen).toEqual({ orbitales: { creados: 15, actualizados: 0 }, secciones: { creadas: 3, actualizadas: 0 } });
      await expect(cliente.orbitalCalculado.count()).resolves.toBe(15);
      await expect(cliente.seccionTeorica.count()).resolves.toBe(3);
    });
  });

  it("es idempotente en la segunda ejecución", async () => {
    await conBase(async (origenes, cliente) => {
      await cargarOrigenes(origenes, cliente);
      const resumen = await cargarOrigenes(origenes, cliente);
      expect(resumen).toEqual({ orbitales: { creados: 0, actualizados: 15 }, secciones: { creadas: 0, actualizadas: 3 } });
      await expect(cliente.orbitalCalculado.count()).resolves.toBe(15);
      await expect(cliente.seccionTeorica.count()).resolves.toBe(3);
    });
  });

  it("guarda el contenido idéntico al de los archivos de origen", async () => {
    await conBase(async (origenes, cliente) => {
      await cargarOrigenes(origenes, cliente);
      const orbitales = await cliente.orbitalCalculado.findMany({ orderBy: [{ n: "asc" }, { l: "asc" }] });
      const origenOrbitales = origenes.orbitales as { orbitales: Array<Record<string, unknown>> };
      expect(orbitales.map((fila) => fila.datos)).toEqual(origenOrbitales.orbitales);
      const secciones = await cliente.seccionTeorica.findMany({ orderBy: { orden: "asc" } });
      expect(secciones.map(({ clave, orden, titulo, contenido }) => ({ clave, orden, titulo, contenido }))).toEqual(origenes.secciones.map(({ clave, orden, titulo, contenido }) => ({ clave, orden, titulo, contenido })));
    });
  });

  it("actualiza un orbital y una sección sin duplicarlos", async () => {
    await conBase(async (origenes, cliente) => {
      await cargarOrigenes(origenes, cliente);
      const modificado = copiarOrigenes(origenes);
      (modificado.orbitales as { orbitales: Array<Record<string, unknown>> }).orbitales[0] = {
        ...(modificado.orbitales as { orbitales: Array<Record<string, unknown>> }).orbitales[0], extension: 999,
      };
      modificado.secciones[0].contenido += "\nTexto añadido para la prueba.";
      const resumen = await cargarOrigenes(modificado, cliente);
      expect(resumen).toEqual({ orbitales: { creados: 0, actualizados: 15 }, secciones: { creadas: 0, actualizadas: 3 } });
      await expect(cliente.orbitalCalculado.count()).resolves.toBe(15);
      await expect(cliente.seccionTeorica.count()).resolves.toBe(3);
      await expect(cliente.orbitalCalculado.findUnique({ where: { n_l_version: { n: 1, l: 0, version: "1" } } })).resolves.toBeTruthy();
      await expect(cliente.seccionTeorica.findUnique({ where: { clave: modificado.secciones[0].clave } })).resolves.toMatchObject({ contenido: modificado.secciones[0].contenido });
    });
  });

  it("valida antes de escribir y deja la base vacía", async () => {
    await conBase(async (origenes, cliente) => {
      const invalido = copiarOrigenes(origenes);
      const orbitales = (invalido.orbitales as { orbitales: Array<Record<string, unknown>> }).orbitales;
      orbitales[0] = { ...orbitales[0], n: 1, l: 1 };
      expect(() => validarOrigenes(invalido)).toThrow(ErrorValidacionCarga);
      expect(() => validarOrigenes(invalido)).toThrow(/n=1, l=1/);
      await expect(cliente.orbitalCalculado.count()).resolves.toBe(0);
      await expect(cliente.seccionTeorica.count()).resolves.toBe(0);
    });
    await conBase(async (origenes, cliente) => {
      const invalido = copiarOrigenes(origenes);
      (invalido.orbitales as { orbitales: Array<Record<string, unknown>> }).orbitales.pop();
      expect(() => validarOrigenes(invalido)).toThrow(/exactamente 15/);
      await expect(cliente.orbitalCalculado.count()).resolves.toBe(0);
    });
  });

  it("revierte toda la transacción si falla después de escribir orbitales", async () => {
    await conBase(async (origenes, cliente) => {
      await cliente.seccionTeorica.create({ data: { clave: "conflicto", orden: 2, titulo: "Conflicto", contenido: "Conflicto" } });
      await expect(cargarOrigenes(origenes, cliente)).rejects.toThrow();
      await expect(cliente.orbitalCalculado.count()).resolves.toBe(0);
      await expect(cliente.seccionTeorica.count()).resolves.toBe(1);
    });
  });
});

afterAll(async () => {
  for (const esquema of [...esquemas]) await eliminarEsquema(esquema);
  if (!urlBase) return;
  await limpiarEsquemasResiduales();
  const cliente = new Client({ connectionString: urlBase });
  await cliente.connect();
  const resultado = await cliente.query<{ schema_name: string }>("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'prueba_carga_%'");
  await cliente.end();
  expect(resultado.rows).toEqual([]);
});
