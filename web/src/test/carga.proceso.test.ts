// @vitest-environment node
import { Client } from "pg";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const urlBase = process.env.DATABASE_URL_PRUEBAS;
if (!urlBase) console.warn("Pruebas de proceso de carga omitidas: falta DATABASE_URL_PRUEBAS.");
const esquemas: string[] = [];
const binarioTsx = path.resolve(__dirname, `../../node_modules/.bin/tsx${process.platform === "win32" ? ".cmd" : ""}`);
const tsxDisponible = spawnSync(binarioTsx, ["--version"], { encoding: "utf8", shell: process.platform === "win32", timeout: 15000 }).status === 0;
if (!tsxDisponible) console.warn("Pruebas de proceso de carga omitidas: tsx no puede iniciarse en este entorno.");

function crearUrlEsquema(esquema: string): string {
  const url = new URL(urlBase!);
  url.searchParams.set("schema", esquema);
  url.searchParams.set("options", `-c search_path=${esquema}`);
  return url.toString();
}

function ejecutarProceso(entorno: NodeJS.ProcessEnv) {
  return spawnSync(binarioTsx, ["scripts/cargar-datos.ts"], {
    cwd: path.resolve(__dirname, "../.."),
    env: entorno,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: 60000,
  });
}

async function prepararEsquema(): Promise<{ esquema: string; url: string }> {
  const esquema = `prueba_proceso_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const url = crearUrlEsquema(esquema);
  const cliente = new Client({ connectionString: urlBase });
  await cliente.connect();
  await cliente.query(`CREATE SCHEMA "${esquema}"`);
  await cliente.end();
  const prismaCli = path.resolve(__dirname, "../../node_modules/prisma/build/index.js");
  const migracion = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], { cwd: path.resolve(__dirname, "../.."), env: { ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url }, encoding: "utf8", timeout: 30000 });
  if (migracion.status !== 0) throw new Error("No se pudieron aplicar las migraciones de prueba.");
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
  const resultado = await cliente.query<{ schema_name: string }>("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'prueba_proceso_%'");
  for (const fila of resultado.rows) await cliente.query(`DROP SCHEMA IF EXISTS "${fila.schema_name}" CASCADE`);
  await cliente.end();
}

describe("carga de datos como proceso", () => {
  beforeAll(async () => { if (urlBase) await limpiarEsquemasResiduales(); });
  it.skipIf(!urlBase || !tsxDisponible)("termina correctamente y no expone la URL", async () => {
    const { esquema, url } = await prepararEsquema();
    try {
      const resultado = ejecutarProceso({ ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url });
      expect(resultado.status).toBe(0);
      expect(`${resultado.stdout}\n${resultado.stderr}`).not.toContain(new URL(url).password);
      expect(`${resultado.stdout}\n${resultado.stderr}`).not.toContain(new URL(url).host);
    } finally {
      await eliminarEsquema(esquema);
      esquemas.splice(esquemas.indexOf(esquema), 1);
    }
  }, 90000);

  it.skipIf(!urlBase || !tsxDisponible)("sin DATABASE_URL falla y no escribe", async () => {
    const { esquema } = await prepararEsquema();
    try {
      const entorno = { ...process.env, DATABASE_URL: undefined, DATABASE_URL_UNPOOLED: undefined };
      const resultado = ejecutarProceso(entorno);
      expect(resultado.status).not.toBe(0);
      expect(`${resultado.stdout}\n${resultado.stderr}`).toContain("DATABASE_URL");
      const cliente = new Client({ connectionString: crearUrlEsquema(esquema) });
      await cliente.connect();
      await expect(cliente.query("SELECT COUNT(*)::int AS total FROM \"OrbitalCalculado\"")).resolves.toMatchObject({ rows: [{ total: 0 }] });
      await cliente.end();
    } finally {
      await eliminarEsquema(esquema);
      esquemas.splice(esquemas.indexOf(esquema), 1);
    }
  }, 90000);

  it.skipIf(!tsxDisponible)("oculta credenciales y destino ante una conexión inválida", () => {
    const resultado = ejecutarProceso({ ...process.env, DATABASE_URL: "postgresql://postgres:clave-falsa-xyz@localhost:5999/simulador", DATABASE_URL_UNPOOLED: undefined });
    const salida = `${resultado.stdout}\n${resultado.stderr}`;
    expect(resultado.status).not.toBe(0);
    expect(salida).not.toContain("clave-falsa-xyz");
    expect(salida).not.toContain("5999");
    expect(salida).not.toContain("localhost");
  }, 90000);
});

afterAll(async () => {
  for (const esquema of [...esquemas]) await eliminarEsquema(esquema);
  if (!urlBase) return;
  await limpiarEsquemasResiduales();
  const cliente = new Client({ connectionString: urlBase });
  await cliente.connect();
  const resultado = await cliente.query<{ schema_name: string }>("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'prueba_proceso_%'");
  await cliente.end();
  expect(resultado.rows).toEqual([]);
});
