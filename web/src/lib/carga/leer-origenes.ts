import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

export type Origenes = {
  orbitales: unknown;
  secciones: SeccionOrigen[];
};

export type SeccionOrigen = {
  clave?: string;
  orden?: number;
  titulo?: string;
  contenido: string;
  archivo?: string;
};

function analizarMarkdown(texto: string, archivo: string): SeccionOrigen {
  const lineas = texto.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lineas[0] !== "---") {
    return { contenido: texto.trim(), archivo };
  }
  const fin = lineas.indexOf("---", 1);
  if (fin < 0) return { contenido: texto.trim(), archivo };
  const cabecera: Record<string, string> = {};
  for (const linea of lineas.slice(1, fin)) {
    const separador = linea.indexOf(":");
    if (separador >= 0) cabecera[linea.slice(0, separador).trim()] = linea.slice(separador + 1).trim();
  }
  const resultado: SeccionOrigen = { ...cabecera, contenido: lineas.slice(fin + 1).join("\n").trim(), archivo };
  if (cabecera.orden !== undefined) resultado.orden = Number(cabecera.orden);
  return resultado;
}

export async function leerOrigenes(opciones: { directorioDatos?: string; rutaOrbitales?: string; directorioSecciones?: string } = {}): Promise<Origenes> {
  const directorioDatos = resolve(opciones.directorioDatos ?? join(process.cwd(), "datos"));
  const rutaOrbitales = opciones.rutaOrbitales ?? join(directorioDatos, "orbitales.json");
  const rutaSecciones = opciones.directorioSecciones ?? join(directorioDatos, "secciones");
  const datosOrbitales = JSON.parse(await readFile(rutaOrbitales, "utf8"));
  const archivos = (await readdir(rutaSecciones)).filter((archivo) => archivo.endsWith(".md")).sort();
  const secciones = await Promise.all(archivos.map(async (archivo) => analizarMarkdown(
    await readFile(join(rutaSecciones, archivo), "utf8"), archivo,
  )));
  return { orbitales: datosOrbitales, secciones };
}
