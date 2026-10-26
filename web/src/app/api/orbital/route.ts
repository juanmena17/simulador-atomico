import { obtenerOrbital, guardarOrbital } from "../../../lib/db/orbitales";
import { pedirAlServicio } from "../../../lib/api/servicio";
import { atenderOrbital } from "../../../lib/api/orbital";
import { VERSION_ALGORITMO_VIGENTE } from "../../../lib/api/version";
import { CACHE_ORBITAL, cabecerasExito, serializarJson } from "../../../lib/api/cabeceras";
import { ErrorApi, errorInterno, respuestaError } from "../../../lib/api/errores";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    const parametros = new URL(request.url).searchParams;
    const nTexto = parametros.get("n");
    const lTexto = parametros.get("l");
    const convertir = (valor: string | null): unknown => valor !== null && /^-?\d+$/.test(valor) ? Number(valor) : valor;
    const resultado = await atenderOrbital({ n: convertir(nTexto), l: convertir(lTexto), version: parametros.get("v") }, {
      leer: obtenerOrbital, guardar: guardarOrbital, pedirAlServicio, versionVigente: VERSION_ALGORITMO_VIGENTE,
    });
    return new Response(serializarJson(resultado.datos), { status: 200, headers: cabecerasExito(CACHE_ORBITAL) });
  } catch (error) {
    const apiError = error instanceof ErrorApi ? error : errorInterno();
    return respuestaError(apiError);
  }
}
