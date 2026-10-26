import { CACHE_ERROR } from "./cabeceras";

export type CodigoError = "orbital_invalido" | "version_no_vigente" | "servicio_no_disponible" | "bd_no_disponible" | "configuracion_incompleta" | "error_interno";

const estados: Record<CodigoError, number> = {
  orbital_invalido: 400, version_no_vigente: 400, servicio_no_disponible: 502,
  bd_no_disponible: 503, configuracion_incompleta: 500, error_interno: 500,
};

export class ErrorApi extends Error {
  readonly codigo: CodigoError;
  readonly estado: number;
  constructor(codigo: CodigoError, mensaje: string) {
    super(mensaje);
    this.name = "ErrorApi";
    this.codigo = codigo;
    this.estado = estados[codigo];
  }
}

export function respuestaError(error: ErrorApi): Response {
  return new Response(JSON.stringify({ error: { codigo: error.codigo, mensaje: error.message } }), {
    status: error.estado,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": CACHE_ERROR },
  });
}

export function errorInterno(): ErrorApi {
  return new ErrorApi("error_interno", "Ocurrió un error interno.");
}
