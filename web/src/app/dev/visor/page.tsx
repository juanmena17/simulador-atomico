import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { ViewerArea } from "../../../components/ViewerArea";
import VisorOrbital, { MedidorVisor, type OrientacionInicial } from "../../../components/VisorOrbital";
import type { OrbitalApi } from "../../../lib/visor/tipos";

export const dynamic = "force-dynamic";

type ParametrosBusqueda = { [clave: string]: string | string[] | undefined };
type DatosOrbitales = { version: string | number; orbitales: OrbitalApi[] };

function primero(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

function numero(valor: string | string[] | undefined, defecto: number): number {
  const resultado = Number(primero(valor));
  return Number.isFinite(resultado) ? resultado : defecto;
}

function cargarDatos(): DatosOrbitales {
  const ruta = join(process.cwd(), "datos", "orbitales.json");
  return JSON.parse(readFileSync(ruta, "utf8")) as DatosOrbitales;
}

export default async function PaginaVisor({ searchParams }: { searchParams: Promise<ParametrosBusqueda> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const parametros = await searchParams;
  const datos = cargarDatos();
  const n = numero(parametros.n, 1);
  const l = numero(parametros.l, 0);
  const orbital = datos.orbitales.find((candidato) => candidato.n === n && candidato.l === l);
  if (!orbital) notFound();
  const orientacion: OrientacionInicial = { rx: numero(parametros.rx, 25), ry: numero(parametros.ry, -30), rz: numero(parametros.rz, 0) };
  const medir = primero(parametros.medir) === "1";
  return <main className="p-4">
    <div style={{ height: "80vh", width: "100%" }}>
      <ViewerArea><VisorOrbital orbital={orbital} orientacionInicial={orientacion} /></ViewerArea>
    </div>
    <p className="mt-2 text-xs text-neutral-500">n={orbital.n} l={orbital.l} versión={orbital.version}</p>
    {medir ? <MedidorVisor orbital={orbital} /> : null}
  </main>;
}
