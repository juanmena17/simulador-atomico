// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { crearClienteParaPruebas, ejecutarConErrorBD, obtenerCliente } from "../lib/db/cliente";
import { validarDominioOrbital, ErrorDominioOrbital } from "../lib/db/dominio";

afterEach(() => {
  delete process.env.DATABASE_URL;
});

describe("dominio de orbitales", () => {
  it.each([[1, 0], [5, 4]])("acepta n=%i, l=%i", (n, l) => {
    expect(() => validarDominioOrbital(n, l)).not.toThrow();
  });

  it.each([[0, 0], [6, 0], [1, 1], [2.5, 0], [2, 1.5]])("rechaza n=%i, l=%i", (n, l) => {
    expect(() => validarDominioOrbital(n, l)).toThrow(ErrorDominioOrbital);
  });
});

describe("configuración y errores de conexión", () => {
  it("nombra DATABASE_URL sin exponer una dirección cuando falta", () => {
    delete process.env.DATABASE_URL;
    expect(() => obtenerCliente()).toThrowError(/DATABASE_URL/);
    expect(() => obtenerCliente()).not.toThrowError(/postgresql:\/\//);
  });

  it("relanza un error genérico sin credenciales ni host", async () => {
    const urlFalsa = ["postgresql://usuario:", "secreto", "@127.0.0.1:59999/prueba"].join("");
    const cliente = crearClienteParaPruebas(urlFalsa);
    try {
      await expect(ejecutarConErrorBD(() => cliente.$queryRaw`SELECT 1`)).rejects.toThrow("Error de conexión con la base de datos.");
      await expect(ejecutarConErrorBD(() => cliente.$queryRaw`SELECT 1`)).rejects.not.toThrow(/secreto|127\.0\.0\.1|59999/);
    } finally {
      await cliente.$disconnect();
    }
  });
});
