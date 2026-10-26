import { VERSION_ALGORITMO_VIGENTE } from "../api/version";
import type { OrbitalApi } from "../visor/tipos";

export const RAZON_TIEMPO_INTENTO = "intento" as const;
export const RAZON_TIEMPO_TOTAL = "total" as const;

export type CodigoErrorConsulta = "orbital_invalido" | "version_no_vigente" | "servicio_no_disponible" | "bd_no_disponible" | "configuracion_incompleta" | "error_interno" | "red" | "respuesta_invalida" | "tiempo_agotado" | "tiempo_agotado_total" | string;

export class ErrorConsultaOrbital extends Error {
  readonly codigo: CodigoErrorConsulta;

  constructor(codigo: CodigoErrorConsulta) {
    super(`No se pudo consultar el orbital (${codigo}).`);
    this.name = "ErrorConsultaOrbital";
    this.codigo = codigo;
  }
}

function esGrupoValido(valor: unknown): valor is { p: string; l: number[] } {
  if (typeof valor !== "object" || valor === null) return false;
  const grupo = valor as { p?: unknown; l?: unknown };
  return typeof grupo.p === "string" && Array.isArray(grupo.l) && grupo.l.every((anillo) => typeof anillo === "number");
}

function esOrbitalValido(valor: unknown, nPedido: number, lPedido: number): valor is OrbitalApi {
  if (typeof valor !== "object" || valor === null) return false;
  const orbital = valor as Partial<OrbitalApi>;
  return orbital.n === nPedido && orbital.l === lPedido && typeof orbital.n === "number" && typeof orbital.l === "number" &&
    typeof orbital.version === "string" && typeof orbital.extension === "number" &&
    esGrupoValido(orbital.envolvente) && esGrupoValido(orbital.nucleo);
}

type FetchFn = typeof fetch;

export async function pedirOrbital(n: number, l: number, opciones: { fetchFn?: FetchFn; signal?: AbortSignal } = {}): Promise<OrbitalApi> {
  const fetchFn = opciones.fetchFn ?? fetch;
  const signal = opciones.signal;
  const url = `/api/orbital?n=${n}&l=${l}&v=${VERSION_ALGORITMO_VIGENTE}`;
  let respuesta: Response;
  const errorPorAborto = () => new ErrorConsultaOrbital(signal?.reason === RAZON_TIEMPO_TOTAL ? "tiempo_agotado_total" : "tiempo_agotado");
  if (signal?.aborted) throw errorPorAborto();

  try {
    respuesta = await fetchFn(url, signal ? { method: "GET", signal } : { method: "GET" });
  } catch {
    if (signal?.aborted) throw errorPorAborto();
    throw new ErrorConsultaOrbital("red");
  }

  let cuerpo: unknown;
  try {
    cuerpo = await respuesta.json();
  } catch {
    if (signal?.aborted) throw errorPorAborto();
    throw new ErrorConsultaOrbital("respuesta_invalida");
  }

  if (respuesta.status !== 200) {
    const codigo = typeof cuerpo === "object" && cuerpo !== null && "error" in cuerpo &&
      typeof cuerpo.error === "object" && cuerpo.error !== null && "codigo" in cuerpo.error &&
      typeof cuerpo.error.codigo === "string" ? cuerpo.error.codigo : "respuesta_invalida";
    throw new ErrorConsultaOrbital(codigo);
  }

  if (!esOrbitalValido(cuerpo, n, l)) throw new ErrorConsultaOrbital("respuesta_invalida");
  return cuerpo;
}
