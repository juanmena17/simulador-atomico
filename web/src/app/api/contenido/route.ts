import { listarSecciones } from "../../../lib/db/secciones";
import { atenderContenido } from "../../../lib/api/contenido";
import { CACHE_CONTENIDO, cabecerasExito, serializarJson } from "../../../lib/api/cabeceras";
import { ErrorApi, errorInterno, respuestaError } from "../../../lib/api/errores";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const secciones = await atenderContenido(async () => (await listarSecciones()).map(({ clave, orden, titulo, contenido }) => ({ clave, orden, titulo, contenido })));
    return new Response(serializarJson(secciones), { status: 200, headers: cabecerasExito(CACHE_CONTENIDO) });
  } catch (error) {
    return respuestaError(error instanceof ErrorApi ? error : errorInterno());
  }
}
