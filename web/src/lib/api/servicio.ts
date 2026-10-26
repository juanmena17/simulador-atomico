import { ErrorApi } from "./errores";

export type ResultadoServicio = {
  n: number; l: number; version: string; extension: unknown;
  envolvente: { p: unknown; l: unknown }; nucleo: { p: unknown; l: unknown };
};

function esResultado(valor: unknown, n: number, l: number, version: string): valor is ResultadoServicio {
  if (!valor || typeof valor !== "object") return false;
  const dato = valor as Record<string, unknown>;
  const envolvente = dato.envolvente as Record<string, unknown> | undefined;
  const nucleo = dato.nucleo as Record<string, unknown> | undefined;
  return dato.n === n && dato.l === l && dato.version === version && "extension" in dato &&
    !!envolvente && "p" in envolvente && "l" in envolvente && !!nucleo && "p" in nucleo && "l" in nucleo;
}

export async function pedirAlServicio(n: number, l: number, version: string, tiempoMaximoMs = 20_000): Promise<ResultadoServicio> {
  const base = process.env.URL_SERVICIO_CALCULO;
  if (!base) throw new ErrorApi("configuracion_incompleta", "Falta la variable URL_SERVICIO_CALCULO.");
  const secreto = process.env.SECRETO_SERVICIO;
  if (!secreto) throw new ErrorApi("configuracion_incompleta", "Falta la variable SECRETO_SERVICIO.");

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), tiempoMaximoMs);
  try {
    const url = new URL("/orbital", base);
    url.searchParams.set("n", String(n)); url.searchParams.set("l", String(l));
    const respuesta = await fetch(url, { headers: { "X-Servicio-Secreto": secreto }, signal: controlador.signal });
    if (respuesta.status !== 200) throw new Error("http");
    const datos: unknown = await respuesta.json();
    if (!esResultado(datos, n, l, version)) throw new Error("forma");
    return datos;
  } catch {
    throw new ErrorApi("servicio_no_disponible", "El servicio de cálculo no está disponible.");
  } finally {
    clearTimeout(temporizador);
  }
}
