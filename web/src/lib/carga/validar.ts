import { validarDominioOrbital } from "../db/dominio";
import type { Origenes, SeccionOrigen } from "./leer-origenes";

export class ErrorValidacionCarga extends Error {
  readonly problemas: string[];

  constructor(problemas: string[]) {
    super(`Errores de validación de carga:\n${problemas.map((problema) => `- ${problema}`).join("\n")}`);
    this.name = "ErrorValidacionCarga";
    this.problemas = problemas;
  }
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function validarForma(resultado: Record<string, unknown>, indice: number, problemas: string[]) {
  if (typeof resultado.extension !== "number" || !Number.isFinite(resultado.extension)) problemas.push(`orbital ${indice}: extension debe ser numérica`);
  for (const grupo of ["envolvente", "nucleo"]) {
    const valor = resultado[grupo];
    if (!esObjeto(valor) || typeof valor.p !== "string" || !Array.isArray(valor.l)) problemas.push(`orbital ${indice}: ${grupo} debe tener p string y l array`);
  }
}

export function validarOrigenes(origenes: Origenes): void {
  const problemas: string[] = [];
  const raiz = esObjeto(origenes.orbitales) ? origenes.orbitales : {};
  const version = typeof raiz.version === "string" && raiz.version.length > 0 ? raiz.version : undefined;
  if (!version) problemas.push("la versión raíz debe ser un texto no vacío");
  const orbitales = Array.isArray(raiz.orbitales) ? raiz.orbitales : [];
  if (orbitales.length !== 15) problemas.push(`se esperaban exactamente 15 orbitales, hay ${orbitales.length}`);
  const vistos = new Set<string>();
  for (const [indice, valor] of orbitales.entries()) {
    if (!esObjeto(valor)) { problemas.push(`orbital ${indice}: debe ser un objeto`); continue; }
    const n = valor.n;
    const l = valor.l;
    try { validarDominioOrbital(n, l); } catch { problemas.push(`orbital ${indice}: fuera de dominio (n=${String(n)}, l=${String(l)})`); }
    const clave = `${String(n)},${String(l)}`;
    if (vistos.has(clave)) problemas.push(`orbital ${indice}: combinación repetida ${clave}`);
    vistos.add(clave);
    if (typeof valor.version !== "string" || valor.version !== version) problemas.push(`orbital ${indice}: versión distinta de la raíz`);
    validarForma(valor, indice, problemas);
  }
  for (let n = 1; n <= 5; n += 1) for (let l = 0; l < n; l += 1) {
    if (!vistos.has(`${n},${l}`)) problemas.push(`falta orbital n=${n}, l=${l}`);
  }

  const secciones = Array.isArray(origenes.secciones) ? origenes.secciones : [];
  const claves = new Set<string>();
  const ordenes = new Set<number>();
  for (const [indice, seccion] of secciones.entries()) {
    validarSeccion(seccion, indice, problemas, claves, ordenes);
  }
  if (secciones.length !== 3) problemas.push(`se esperaban exactamente 3 secciones, hay ${secciones.length}`);
  if (problemas.length) throw new ErrorValidacionCarga(problemas);
}

function validarSeccion(seccion: SeccionOrigen, indice: number, problemas: string[], claves: Set<string>, ordenes: Set<number>) {
  if (!seccion || typeof seccion !== "object") { problemas.push(`sección ${indice}: debe ser un objeto`); return; }
  if (!seccion.clave?.trim()) problemas.push(`sección ${indice}: falta clave`);
  else if (claves.has(seccion.clave)) problemas.push(`sección ${indice}: clave repetida ${seccion.clave}`);
  else claves.add(seccion.clave);
  const orden = seccion.orden;
  if (typeof orden !== "number" || !Number.isInteger(orden) || orden < 1) problemas.push(`sección ${indice}: orden debe ser entero positivo`);
  else if (ordenes.has(orden)) problemas.push(`sección ${indice}: orden repetido ${orden}`);
  else ordenes.add(orden);
  if (!seccion.titulo?.trim()) problemas.push(`sección ${indice}: falta título`);
  if (!seccion.contenido?.trim()) problemas.push(`sección ${indice}: falta contenido`);
}
