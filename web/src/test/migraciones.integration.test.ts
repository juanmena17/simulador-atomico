// @vitest-environment node
import { Client } from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";

const urlBase = process.env.DATABASE_URL_PRUEBAS;
if (!urlBase) console.warn("Prueba de migraciones omitida: falta DATABASE_URL_PRUEBAS.");
let esquema: string | undefined;

describe.skipIf(!urlBase)("migraciones repetibles", () => {
  it("aplica dos veces sobre un esquema vacío y crea solo las tablas esperadas", async () => {
    esquema = `prueba_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const urlEsquema = new URL(urlBase!);
    urlEsquema.searchParams.set("schema", esquema);
    const cliente = new Client({ connectionString: urlBase });
    await cliente.connect();
    await cliente.query(`CREATE SCHEMA "${esquema}"`);
    await cliente.end();

    const entorno = { ...process.env, DATABASE_URL: urlEsquema.toString(), DATABASE_URL_UNPOOLED: urlEsquema.toString() };
    const prismaCli = path.resolve(__dirname, "../../node_modules/prisma/build/index.js");
    const ejecutar = () => spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
      cwd: path.resolve(__dirname, "../.."), env: entorno, encoding: "utf8",
    });
    expect(ejecutar().status).toBe(0);
    expect(ejecutar().status).toBe(0);

    const verificador = new Client({ connectionString: urlBase });
    await verificador.connect();
    const filas = await verificador.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name",
      [esquema],
    );
    await verificador.end();
    expect(filas.rows.map((fila) => fila.table_name)).toEqual(["OrbitalCalculado", "SeccionTeorica", "_prisma_migrations"]);
  }, 30000);
});

afterAll(async () => {
  if (!urlBase || !esquema) return;
  const cliente = new Client({ connectionString: urlBase });
  await cliente.connect();
  await cliente.query(`DROP SCHEMA "${esquema}" CASCADE`);
  await cliente.end();
});
