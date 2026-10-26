import { ErrorApi } from "./errores";

export type SeccionApi = { clave: string; orden: number; titulo: string; contenido: string };
export async function atenderContenido(listar: () => Promise<SeccionApi[]>): Promise<SeccionApi[]> {
  try { return await listar(); }
  catch { throw new ErrorApi("bd_no_disponible", "La base de datos no está disponible."); }
}
