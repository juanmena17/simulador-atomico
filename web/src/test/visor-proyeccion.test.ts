import { describe, expect, it } from "vitest";
import datos from "../../datos/orbitales.json";
import { decodificarGrupo } from "../lib/visor/decodificar";
import { aMatriz3x3, normalizar, type Matriz3x3 } from "../lib/visor/rotacion";
import { ordenarPorProfundidad, proyectar } from "../lib/visor/proyeccion";
import type { OrbitalApi } from "../lib/visor/tipos";

const identidad: Matriz3x3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

describe("proyección", () => {
  it("centra y aplica perspectiva", () => {
    const salida = proyectar([new Float32Array([0, 0, 0, 0.5, 0, 0.5])], identidad, 800, 600);
    expect(salida[0].puntos[0]).toBeCloseTo(400);
    expect(salida[0].puntos[1]).toBeCloseTo(300);
    const cerca = Math.abs(salida[0].puntos[2] - 400);
    expect(cerca).toBeGreaterThan(0.46 * 300 * 0.5);
  });

  it("ordena de menor a mayor profundidad", () => {
    const anillos = [{ puntos: new Float32Array(2), profundidad: 0.8 }, { puntos: new Float32Array(2), profundidad: -0.4 }];
    expect(ordenarPorProfundidad(anillos).map((x) => x.profundidad)).toEqual([-0.4, 0.8]);
  });

  it("mantiene los 15 orbitales dentro del área visible", () => {
    const orbitales = (datos as { orbitales: OrbitalApi[] }).orbitales;
    const grupos = orbitales.map((orbital) => [decodificarGrupo(orbital.envolvente), decodificarGrupo(orbital.nucleo)]);
    let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
    for (let intento = 0; intento < 200; intento += 1) {
      const q = normalizar([1, Math.sin(intento), Math.cos(intento * 2), Math.sin(intento * 3)]);
      const matriz = aMatriz3x3(q);
      for (const [envolvente, nucleo] of grupos) for (const grupo of [envolvente, nucleo]) {
        const muestra = grupo.anillos.map((anillo) => {
          const puntos = new Float32Array(Math.min(anillo.length, 36));
          puntos.set(anillo.subarray(0, puntos.length));
          return puntos;
        });
        for (const anillo of proyectar(muestra, matriz, intento % 2 ? 300 : 800, intento % 2 ? 900 : 600)) {
          for (let i = 0; i < anillo.puntos.length; i += 2) { minX = Math.min(minX, anillo.puntos[i]); maxX = Math.max(maxX, anillo.puntos[i]); minY = Math.min(minY, anillo.puntos[i + 1]); maxY = Math.max(maxY, anillo.puntos[i + 1]); }
        }
      }
    }
    expect(minX).toBeGreaterThanOrEqual(1); expect(maxX).toBeLessThanOrEqual(799);
    expect(minY).toBeGreaterThanOrEqual(1); expect(maxY).toBeLessThanOrEqual(899);
  });
});
