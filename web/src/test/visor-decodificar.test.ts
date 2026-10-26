import { describe, expect, it } from "vitest";
import datos from "../../datos/orbitales.json";
import { decodificarGrupo } from "../lib/visor/decodificar";
import type { OrbitalApi } from "../lib/visor/tipos";

const orbitales = (datos as { orbitales: OrbitalApi[] }).orbitales;

describe("decodificación de orbitales", () => {
  it("decodifica los 15 orbitales reales, anillos y puntos", () => {
    expect(orbitales).toHaveLength(15);
    for (const orbital of orbitales) {
      for (const grupo of [orbital.envolvente, orbital.nucleo]) {
        const resultado = decodificarGrupo(grupo);
        expect(resultado.anillos).toHaveLength(grupo.l.length);
        expect(resultado.anillos.reduce((n, anillo) => n + anillo.length / 3, 0)).toBe(grupo.l.reduce((n, longitud) => n + longitud, 0));
      }
    }
  });

  it("recupera cada entero little-endian con error de escala acotado", () => {
    const grupo = orbitales[14].envolvente;
    const resultado = decodificarGrupo(grupo);
    const bytes = Buffer.from(grupo.p, "base64");
    const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 0;
    for (const anillo of resultado.anillos) {
      for (let i = 0; i < anillo.length; i += 1) {
        const independiente = vista.getInt16(offset, true) / 32767;
        expect(Math.abs(anillo[i] - independiente)).toBeLessThanOrEqual(1 / 32767);
        offset += 2;
      }
    }
  });

  it("acepta un grupo vacío", () => {
    expect(decodificarGrupo({ p: "", l: [] })).toEqual({ anillos: [] });
  });

  it("rechaza bytes cuyo tamaño no coincide con las longitudes", () => {
    expect(() => decodificarGrupo({ p: "AA==", l: [1] })).toThrow(/bytes/);
  });
});
