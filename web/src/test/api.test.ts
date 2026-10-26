// @vitest-environment node
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import datos from "../../datos/orbitales.json";
import { CACHE_CONTENIDO, CACHE_ERROR, CACHE_ORBITAL, cabecerasExito } from "../lib/api/cabeceras";
import { atenderContenido } from "../lib/api/contenido";
import { ErrorApi, respuestaError } from "../lib/api/errores";
import { atenderOrbital } from "../lib/api/orbital";
import { pedirAlServicio } from "../lib/api/servicio";
import { VERSION_ALGORITMO_VIGENTE } from "../lib/api/version";

const entornoOriginal = { url: process.env.URL_SERVICIO_CALCULO, secreto: process.env.SECRETO_SERVICIO };
afterEach(() => {
  if (entornoOriginal.url === undefined) delete process.env.URL_SERVICIO_CALCULO; else process.env.URL_SERVICIO_CALCULO = entornoOriginal.url;
  if (entornoOriginal.secreto === undefined) delete process.env.SECRETO_SERVICIO; else process.env.SECRETO_SERVICIO = entornoOriginal.secreto;
  vi.restoreAllMocks();
});

describe("base de la API", () => {
  it("mantiene la versión sincronizada con los datos", () => expect(VERSION_ALGORITMO_VIGENTE).toBe(datos.version));
  it("expone las cabeceras exactas", () => {
    expect(cabecerasExito(CACHE_ORBITAL).get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(cabecerasExito(CACHE_CONTENIDO).get("Cache-Control")).toBe("public, max-age=60, s-maxage=60, stale-while-revalidate=300");
    expect(respuestaError(new ErrorApi("error_interno", "Ocurrió un error interno.")).headers.get("Cache-Control")).toBe(CACHE_ERROR);
  });
  it("no expone datos internos en los errores", async () => {
    const respuesta = respuestaError(new ErrorApi("servicio_no_disponible", "El servicio de cálculo no está disponible."));
    const cuerpo = await respuesta.text();
    expect(cuerpo).not.toMatch(/postgres|127\.0\.0\.1|secreto|trace/i);
  });
});

describe("cliente del servicio", () => {
  let servidor: Server | undefined;
  afterEach(() => servidor?.close());

  async function iniciar(responder: (headers: Record<string, string>, url: string) => { status?: number; cuerpo: unknown; espera?: number }): Promise<{ base: string; llamadas: () => number; cabecera: () => string | undefined }> {
    let llamadas = 0; let secretoRecibido: string | undefined;
    servidor = createServer((peticion, respuesta) => {
      llamadas += 1; const valorSecreto = peticion.headers["x-servicio-secreto"]; secretoRecibido = Array.isArray(valorSecreto) ? valorSecreto[0] : valorSecreto;
      const resultado = responder({ "x-servicio-secreto": secretoRecibido ?? "" }, peticion.url ?? "");
      const enviar = () => { respuesta.statusCode = resultado.status ?? 200; respuesta.setHeader("Content-Type", "application/json"); respuesta.end(JSON.stringify(resultado.cuerpo)); };
      if (resultado.espera) setTimeout(enviar, resultado.espera); else enviar();
    });
    await new Promise<void>((resolve) => servidor?.listen(0, "127.0.0.1", resolve));
    const direccion = servidor.address();
    if (!direccion || typeof direccion === "string") throw new Error("servidor sin dirección");
    return { base: `http://127.0.0.1:${direccion.port}`, llamadas: () => llamadas, cabecera: () => secretoRecibido };
  }

  const correcto = (n = 3, l = 2, version = "1") => ({ n, l, version, extension: 1, envolvente: { p: "p", l: [1] }, nucleo: { p: "p", l: [1] } });

  it("envía el secreto y acepta una respuesta correcta", async () => {
    const falso = await iniciar(() => ({ cuerpo: correcto() })); process.env.URL_SERVICIO_CALCULO = falso.base; process.env.SECRETO_SERVICIO = "secreto-falso";
    await expect(pedirAlServicio(3, 2, "1")).resolves.toMatchObject({ n: 3, l: 2 }); expect(falso.llamadas()).toBe(1); expect(falso.cabecera()).toBe("secreto-falso");
  });
  it.each([401, 500])("traduce HTTP %s", async (status) => { const falso = await iniciar(() => ({ status, cuerpo: {} })); process.env.URL_SERVICIO_CALCULO = falso.base; process.env.SECRETO_SERVICIO = "secreto-falso"; await expect(pedirAlServicio(3, 2, "1")).rejects.toMatchObject({ codigo: "servicio_no_disponible" }); expect(falso.llamadas()).toBe(1); });
  it("traduce timeout, JSON inválido y versión distinta", async () => {
    const falso = await iniciar(() => ({ cuerpo: "no-json", espera: 50 })); process.env.URL_SERVICIO_CALCULO = falso.base; process.env.SECRETO_SERVICIO = "secreto-falso";
    await expect(pedirAlServicio(3, 2, "1", 5)).rejects.toMatchObject({ codigo: "servicio_no_disponible" });
    servidor?.close(); servidor = undefined;
    const otro = await iniciar(() => ({ cuerpo: correcto(3, 2, "2") })); process.env.URL_SERVICIO_CALCULO = otro.base;
    await expect(pedirAlServicio(3, 2, "1")).rejects.toMatchObject({ codigo: "servicio_no_disponible" });
  });
  it("nombra solo la configuración faltante", async () => { delete process.env.URL_SERVICIO_CALCULO; process.env.SECRETO_SERVICIO = "falso"; await expect(pedirAlServicio(3, 2, "1")).rejects.toMatchObject({ codigo: "configuracion_incompleta", message: expect.stringContaining("URL_SERVICIO_CALCULO") }); process.env.URL_SERVICIO_CALCULO = "http://url-falsa.invalid"; delete process.env.SECRETO_SERVICIO; await expect(pedirAlServicio(3, 2, "1")).rejects.toMatchObject({ codigo: "configuracion_incompleta", message: expect.stringContaining("SECRETO_SERVICIO") }); });
});

describe("casos de uso", () => {
  const dependencias = () => ({ versionVigente: "1", leer: vi.fn(), guardar: vi.fn().mockResolvedValue(undefined), pedirAlServicio: vi.fn().mockResolvedValue({ n: 3, l: 2, version: "1", extension: 1, envolvente: { p: [], l: [] }, nucleo: { p: [], l: [] } }) });
  it("rechaza versión y entrada antes de acceder a dependencias", async () => { const d = dependencias(); await expect(atenderOrbital({ n: 1, l: 0, version: "2" }, d)).rejects.toMatchObject({ codigo: "version_no_vigente" }); await expect(atenderOrbital({ n: 1.5, l: 0, version: "1" }, d)).rejects.toMatchObject({ codigo: "orbital_invalido" }); await expect(atenderOrbital({ n: 1, l: 1, version: "1" }, d)).rejects.toMatchObject({ codigo: "orbital_invalido" }); expect(d.leer).not.toHaveBeenCalled(); });
  it("devuelve orbital guardado sin llamar al servicio", async () => { const d = dependencias(); d.leer.mockResolvedValue({ guardado: true }); await expect(atenderOrbital({ n: 1, l: 0, version: "1" }, d)).resolves.toEqual({ datos: { guardado: true }, nuevo: false }); expect(d.pedirAlServicio).not.toHaveBeenCalled(); });
  it("calcula y guarda orbital faltante", async () => { const d = dependencias(); d.leer.mockResolvedValue(null); await expect(atenderOrbital({ n: 3, l: 2, version: "1" }, d)).resolves.toMatchObject({ nuevo: true }); expect(d.pedirAlServicio).toHaveBeenCalledOnce(); expect(d.guardar).toHaveBeenCalledOnce(); });
  it("continúa si falla el guardado y distingue fallo de lectura", async () => { const d = dependencias(); d.leer.mockResolvedValue(null); d.guardar.mockRejectedValue(new Error("fallo")); const error = vi.spyOn(console, "error").mockImplementation(() => undefined); await expect(atenderOrbital({ n: 3, l: 2, version: "1" }, d)).resolves.toMatchObject({ nuevo: true }); expect(error).toHaveBeenCalledOnce(); d.leer.mockRejectedValue(new Error("BD")); await expect(atenderOrbital({ n: 3, l: 2, version: "1" }, d)).rejects.toMatchObject({ codigo: "bd_no_disponible" }); expect(d.pedirAlServicio).toHaveBeenCalledOnce(); });
  it("lista contenido y traduce error de BD", async () => { const filas = [{ clave: "b", orden: 2, titulo: "B", contenido: "b" }, { clave: "a", orden: 1, titulo: "A", contenido: "a" }]; await expect(atenderContenido(async () => filas)).resolves.toHaveLength(2); await expect(atenderContenido(async () => { throw new Error("BD"); })).rejects.toMatchObject({ codigo: "bd_no_disponible" }); });
});
