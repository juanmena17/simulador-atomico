import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export class ErrorConfiguracionBD extends Error {
  constructor() {
    super("Falta la variable de entorno DATABASE_URL para acceder a la base de datos.");
    this.name = "ErrorConfiguracionBD";
  }
}

type ClienteGlobal = typeof globalThis & {
  __clientePrisma?: PrismaClient;
};

function crearCliente(url: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export function obtenerCliente(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new ErrorConfiguracionBD();
  }

  const entorno = globalThis as ClienteGlobal;
  entorno.__clientePrisma ??= crearCliente(url);
  return entorno.__clientePrisma;
}

export async function ejecutarConErrorBD<T>(operacion: () => Promise<T>): Promise<T> {
  try {
    return await operacion();
  } catch (error) {
    if (error instanceof ErrorConfiguracionBD) {
      throw error;
    }
    throw new Error("Error de conexión con la base de datos.");
  }
}

export function crearClienteParaPruebas(url: string): PrismaClient {
  return crearCliente(url);
}
