export const CACHE_ORBITAL = "public, max-age=31536000, immutable";
export const CACHE_CONTENIDO = "public, max-age=60, s-maxage=60, stale-while-revalidate=300";
export const CACHE_ERROR = "no-store";

export function cabecerasExito(cacheControl: string): Headers {
  return new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": cacheControl });
}

export function serializarJson(datos: unknown): string {
  return JSON.stringify(datos, (_clave, valor: unknown) => {
    if (!valor || typeof valor !== "object" || Array.isArray(valor)) return valor;
    return Object.fromEntries(Object.entries(valor as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)));
  });
}
