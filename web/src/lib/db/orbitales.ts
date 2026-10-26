import type { Prisma } from "@prisma/client";
import { ejecutarConErrorBD, obtenerCliente } from "./cliente";
import { validarDominioOrbital } from "./dominio";

export type ResultadoOrbital = {
  n: number;
  l: number;
  version: string;
  extension: unknown;
  envolvente: { p: unknown; l: unknown };
  nucleo: { p: unknown; l: unknown };
};

export async function obtenerOrbital(n: number, l: number, version: string): Promise<Prisma.JsonValue | null> {
  validarDominioOrbital(n, l);
  return ejecutarConErrorBD(async () => {
    const fila = await obtenerCliente().orbitalCalculado.findUnique({
      where: { n_l_version: { n, l, version } },
      select: { datos: true },
    });
    return fila?.datos ?? null;
  });
}

export async function guardarOrbital(resultado: ResultadoOrbital): Promise<void> {
  validarDominioOrbital(resultado.n, resultado.l);
  const datos = resultado as unknown as Prisma.InputJsonValue;
  const escribir = () => obtenerCliente().orbitalCalculado.upsert({
    where: { n_l_version: { n: resultado.n, l: resultado.l, version: resultado.version } },
    create: { n: resultado.n, l: resultado.l, version: resultado.version, datos },
    update: { datos },
  });

  return ejecutarConErrorBD(async () => {
    try {
      await escribir();
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") {
        throw error;
      }
      await escribir();
    }
  });
}
