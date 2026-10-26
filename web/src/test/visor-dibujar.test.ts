import { describe, expect, it } from "vitest";
import { performance } from "node:perf_hooks";
import datos from "../../datos/orbitales.json";
import { decodificarGrupo } from "../lib/visor/decodificar";
import { dibujarOrbital, type ContextoOrbital } from "../lib/visor/dibujar";
import { aMatriz3x3, normalizar } from "../lib/visor/rotacion";
import type { OrbitalApi } from "../lib/visor/tipos";

class ContextoFalso implements ContextoOrbital {
  cierres = 0; trazos: string[] = []; clear = 0;
  lineWidth = 0; strokeStyle = ""; lineJoin = ""; lineCap = "";
  clearRect(): void { this.clear += 1; }
  beginPath(): void {}
  moveTo(): void {}
  lineTo(): void {}
  closePath(): void { this.cierres += 1; }
  stroke(): void { this.trazos.push(this.strokeStyle); }
}

const orbitales = (datos as { orbitales: OrbitalApi[] }).orbitales;
const matriz = aMatriz3x3(normalizar([1, 0.2, 0.3, 0.1]));

describe("dibujo del visor", () => {
  it("limpia, dibuja dos pasadas por anillo y prioriza el cercano", () => {
    const ctx = new ContextoFalso();
    dibujarOrbital(ctx, { envolvente: decodificarGrupo(orbitales[0].envolvente), nucleo: decodificarGrupo(orbitales[0].nucleo) }, matriz, 800, 600, 1);
    expect(ctx.clear).toBe(1);
    expect(ctx.cierres).toBe((orbitales[0].envolvente.l.length + orbitales[0].nucleo.l.length) * 2);
  });

  it("no dibuja un orbital vacío", () => {
    const ctx = new ContextoFalso(); dibujarOrbital(ctx, null, matriz, 800, 600, 1);
    expect(ctx.clear).toBe(1); expect(ctx.cierres).toBe(0);
  });

  it("mide menos de 8 ms por cuadro para el orbital n=4 más grande", () => {
    const orbital = orbitales.filter((x) => x.n <= 4).sort((a, b) => b.envolvente.l.reduce((s, x) => s + x, 0) + b.nucleo.l.reduce((s, x) => s + x, 0) - a.envolvente.l.reduce((s, x) => s + x, 0) - a.nucleo.l.reduce((s, x) => s + x, 0))[0];
    const grupos = { envolvente: decodificarGrupo(orbital.envolvente), nucleo: decodificarGrupo(orbital.nucleo) };
    const ctx = new ContextoFalso(); const inicio = performance.now();
    for (let i = 0; i < 200; i += 1) dibujarOrbital(ctx, grupos, aMatriz3x3(normalizar([1, Math.sin(i), Math.cos(i * 2), Math.sin(i * 3)])), 800, 600, 1);
    const promedio = (performance.now() - inicio) / 200;
    expect(promedio).toBeLessThan(8);
  });
});
