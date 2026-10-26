// @vitest-environment node
import { Client } from "pg";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import datos from "../../datos/orbitales.json";
import { GET as GETOrbital } from "../app/api/orbital/route";
import { GET as GETContenido } from "../app/api/contenido/route";

const urlBase = process.env.DATABASE_URL_PRUEBAS;
const entornoGlobal = globalThis as typeof globalThis & { __clientePrisma?: PrismaClient };
const datosOrbital = (datos.orbitales as Array<Record<string, unknown>>).find((dato) => dato.n === 3 && dato.l === 2) ?? datos.orbitales[0];
const pruebaSecreta = "secreto-falso-api";

describe.skipIf(!urlBase)("API con base de datos", () => {
  let esquema = ""; let cliente: PrismaClient; let servidor: Server; let puerto = 0; let llamadas = 0; let modo: "ok" | "error" | "lento" = "ok";
  const urlEsquema = () => { const url = new URL(urlBase!); url.searchParams.set("schema", esquema); url.searchParams.set("options", `-c search_path=${esquema}`); return url.toString(); };
  beforeAll(async () => {
    esquema = `prueba_api_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const creador = new Client({ connectionString: urlBase }); await creador.connect(); await creador.query(`CREATE SCHEMA "${esquema}"`); await creador.end();
    const url = urlEsquema(); const prismaCli = path.resolve(__dirname, "../../node_modules/prisma/build/index.js");
    const migracion = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], { cwd: path.resolve(__dirname, "../.."), env: { ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url }, encoding: "utf8", timeout: 30000 });
    if (migracion.status !== 0) throw new Error("No se pudieron aplicar las migraciones de API.");
    cliente = new PrismaClient({ adapter: new PrismaPg(url, { schema: esquema }) }); entornoGlobal.__clientePrisma = cliente;
    await cliente.seccionTeorica.createMany({ data: [{ clave: "intro", orden: 2, titulo: "Introducción", contenido: "Texto original" }, { clave: "inicio", orden: 1, titulo: "Inicio", contenido: "Contenido inicial" }] });
    servidor = createServer((peticion, respuesta) => { llamadas += 1; if (peticion.headers["x-servicio-secreto"] !== pruebaSecreta) { respuesta.statusCode = 401; respuesta.end(); return; } if (modo === "error") { respuesta.statusCode = 500; respuesta.end(); return; } const enviar = () => { respuesta.statusCode = 200; respuesta.setHeader("Content-Type", "application/json"); respuesta.end(JSON.stringify(datosOrbital)); }; if (modo === "lento") setTimeout(enviar, 100); else enviar(); });
    await new Promise<void>((resolve) => servidor.listen(0, "127.0.0.1", resolve)); const direccion = servidor.address(); if (!direccion || typeof direccion === "string") throw new Error("servidor sin dirección"); puerto = direccion.port;
    process.env.DATABASE_URL = url; process.env.URL_SERVICIO_CALCULO = `http://127.0.0.1:${puerto}`; process.env.SECRETO_SERVICIO = pruebaSecreta;
  });
  afterAll(async () => { await new Promise<void>((resolve) => servidor?.close(() => resolve())); await cliente?.$disconnect(); entornoGlobal.__clientePrisma = undefined; const borrador = new Client({ connectionString: urlBase }); await borrador.connect(); await borrador.query(`DROP SCHEMA IF EXISTS "${esquema}" CASCADE`); await borrador.end(); });

  it("calcula, guarda y luego lee sin repetir llamada", async () => { llamadas = 0; modo = "ok"; const primera = await GETOrbital(new Request("http://localhost/api/orbital?n=3&l=2&v=1")); expect(primera.status).toBe(200); expect(llamadas).toBe(1); expect(primera.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable"); expect(await cliente.orbitalCalculado.findUnique({ where: { n_l_version: { n: 3, l: 2, version: "1" } } })).toBeTruthy(); const segunda = await GETOrbital(new Request("http://localhost/api/orbital?n=3&l=2&v=1")); expect(segunda.status).toBe(200); expect(await segunda.text()).toBe(await primera.clone().text()); expect(llamadas).toBe(1); });
  it.each(["error", "lento"] as const)("servicio %s produce 502 y una llamada", async (estado) => { modo = estado; const respuesta = await GETOrbital(new Request("http://localhost/api/orbital?n=4&l=3&v=1")); expect(respuesta.status).toBe(502); expect((await respuesta.json()).error.codigo).toBe("servicio_no_disponible"); expect(llamadas).toBeGreaterThan(0); modo = "ok"; });
  it("base de datos inalcanzable produce 503 sin llamar al servicio", async () => { const clienteBueno = cliente; const urlBuena = process.env.DATABASE_URL; const clienteMalo = new PrismaClient({ adapter: new PrismaPg("postgresql://postgres:secreto-falso@127.0.0.1:59999/inexistente") }); entornoGlobal.__clientePrisma = clienteMalo; process.env.DATABASE_URL = "postgresql://postgres:secreto-falso@127.0.0.1:59999/inexistente"; llamadas = 0; try { const respuesta = await GETOrbital(new Request("http://localhost/api/orbital?n=4&l=3&v=1")); expect(respuesta.status).toBe(503); expect((await respuesta.json()).error.codigo).toBe("bd_no_disponible"); expect(llamadas).toBe(0); } finally { await clienteMalo.$disconnect(); entornoGlobal.__clientePrisma = clienteBueno; process.env.DATABASE_URL = urlBuena; } });
  it("devuelve contenido ordenado", async () => { const respuesta = await GETContenido(); expect(respuesta.status).toBe(200); expect(respuesta.headers.get("Cache-Control")).toBe("public, max-age=60, s-maxage=60, stale-while-revalidate=300"); expect(await respuesta.json()).toEqual([{ clave: "inicio", orden: 1, titulo: "Inicio", contenido: "Contenido inicial" }, { clave: "intro", orden: 2, titulo: "Introducción", contenido: "Texto original" }]); });
});
