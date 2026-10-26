import type { Prisma, PrismaClient } from "@prisma/client";
import { obtenerCliente } from "../db/cliente";
import type { Origenes, SeccionOrigen } from "./leer-origenes";

export type ResumenCarga = { orbitales: { creados: number; actualizados: number }; secciones: { creadas: number; actualizadas: number } };

export async function cargarOrigenes(origenes: Origenes, cliente: PrismaClient = obtenerCliente()): Promise<ResumenCarga> {
  const orbitales = origenes.orbitales as { version: string; orbitales: Array<Record<string, unknown>> };
  return cliente.$transaction(async (tx) => {
    const resumen: ResumenCarga = { orbitales: { creados: 0, actualizados: 0 }, secciones: { creadas: 0, actualizadas: 0 } };
    for (const resultado of orbitales.orbitales) {
      const n = resultado.n as number; const l = resultado.l as number; const version = resultado.version as string;
      const existente = await tx.orbitalCalculado.findUnique({ where: { n_l_version: { n, l, version } }, select: { n: true } });
      const datos = resultado as unknown as Prisma.InputJsonValue;
      await tx.orbitalCalculado.upsert({ where: { n_l_version: { n, l, version } }, create: { n, l, version, datos }, update: { datos } });
      if (existente) resumen.orbitales.actualizados += 1; else resumen.orbitales.creados += 1;
    }
    for (const seccion of origenes.secciones) {
      const datos = seccion as Required<SeccionOrigen>;
      const existente = await tx.seccionTeorica.findUnique({ where: { clave: datos.clave }, select: { clave: true } });
      await tx.seccionTeorica.upsert({ where: { clave: datos.clave }, create: { clave: datos.clave, orden: datos.orden, titulo: datos.titulo, contenido: datos.contenido }, update: { orden: datos.orden, titulo: datos.titulo, contenido: datos.contenido } });
      if (existente) resumen.secciones.actualizadas += 1; else resumen.secciones.creadas += 1;
    }
    return resumen;
  }, { maxWait: 30_000, timeout: 120_000 });
}
