import { ErrorConfiguracionBD } from "../db/cliente";
import { ErrorDominioOrbital, validarDominioOrbital } from "../db/dominio";
import { ErrorApi } from "./errores";
import type { ResultadoServicio } from "./servicio";

export type ParametrosOrbital = { n: unknown; l: unknown; version: unknown };
export type DependenciasOrbital = {
  leer: (n: number, l: number, version: string) => Promise<unknown | null>;
  guardar: (resultado: ResultadoServicio) => Promise<void>;
  pedirAlServicio: (n: number, l: number, version: string) => Promise<ResultadoServicio>;
  versionVigente: string;
};

export async function atenderOrbital(parametros: ParametrosOrbital, deps: DependenciasOrbital): Promise<{ datos: unknown; nuevo: boolean }> {
  if (parametros.version !== deps.versionVigente) throw new ErrorApi("version_no_vigente", `La versión del algoritmo no está vigente. La versión vigente es ${deps.versionVigente}.`);
  const n = typeof parametros.n === "number" ? parametros.n : Number.NaN;
  const l = typeof parametros.l === "number" ? parametros.l : Number.NaN;
  if (!Number.isInteger(n) || !Number.isInteger(l)) throw new ErrorApi("orbital_invalido", "La combinación del orbital no es válida.");
  try { validarDominioOrbital(n, l); } catch (error) { if (error instanceof ErrorDominioOrbital) throw new ErrorApi("orbital_invalido", "La combinación del orbital no es válida."); throw error; }

  let guardado: unknown | null;
  try { guardado = await deps.leer(n, l, deps.versionVigente); }
  catch (error) { if (error instanceof ErrorConfiguracionBD) throw new ErrorApi("bd_no_disponible", "La base de datos no está disponible."); throw new ErrorApi("bd_no_disponible", "La base de datos no está disponible."); }
  if (guardado !== null) return { datos: guardado, nuevo: false };

  const resultado = await deps.pedirAlServicio(n, l, deps.versionVigente);
  try { await deps.guardar(resultado); } catch { console.error("No se pudo guardar el orbital calculado."); }
  return { datos: resultado, nuevo: true };
}
