import { describe, expect, it } from "vitest";
import { aMatriz3x3, desdeEjeAngulo, girarConArrastre, IDENTIDAD, multiplicar, normalizar, type Cuaternion } from "../lib/visor/rotacion";

function aplicar(m: ReturnType<typeof aMatriz3x3>, v: [number, number, number]): [number, number, number] {
  return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
}

describe("rotación y bola virtual", () => {
  it("gira 90 grados alrededor de cada eje", () => {
    expect(aplicar(aMatriz3x3(desdeEjeAngulo({ x: 1, y: 0, z: 0 }, Math.PI / 2)), [0, 0, 1])[1]).toBeCloseTo(-1);
    expect(aplicar(aMatriz3x3(desdeEjeAngulo({ x: 0, y: 1, z: 0 }, Math.PI / 2)), [0, 0, 1])[0]).toBeCloseTo(1);
    expect(aplicar(aMatriz3x3(desdeEjeAngulo({ x: 0, y: 0, z: 1 }, Math.PI / 2)), [1, 0, 0])[1]).toBeCloseTo(1);
  });

  it("cumple las direcciones de arrastre", () => {
    const horizontal = aMatriz3x3(girarConArrastre(IDENTIDAD, { x: 400, y: 300 }, { x: 450, y: 300 }, 800, 600));
    const vertical = aMatriz3x3(girarConArrastre(IDENTIDAD, { x: 400, y: 300 }, { x: 400, y: 250 }, 800, 600));
    expect(aplicar(horizontal, [0, 0, 1])[0]).toBeGreaterThan(0);
    expect(aplicar(vertical, [0, 0, 1])[1]).toBeLessThan(0);
    const circular = aMatriz3x3(girarConArrastre(IDENTIDAD, { x: 700, y: 300 }, { x: 400, y: 600 }, 800, 600));
    expect(aplicar(circular, [0, 0, 1])[2]).toBeCloseTo(1, 4);
    expect(aplicar(circular, [1, 0, 0])[1]).toBeGreaterThan(0);
    expect(girarConArrastre(IDENTIDAD, { x: 3, y: 4 }, { x: 3, y: 4 }, 800, 600)).toEqual(IDENTIDAD);
  });

  it("mapea exactamente el vector agarrado al vector soltado", () => {
    const desde: [number, number, number] = [0, 0, 1];
    const hasta: [number, number, number] = [Math.SQRT1_2, 0, Math.SQRT1_2];
    const q = girarConArrastre(IDENTIDAD, { x: 400, y: 300 }, { x: 400 + 300 * Math.SQRT1_2, y: 300 }, 800, 600);
    const resultado = aplicar(aMatriz3x3(q), desde);
    expect(resultado[0]).toBeCloseTo(hasta[0], 9);
    expect(resultado[1]).toBeCloseTo(hasta[1], 9);
    expect(resultado[2]).toBeCloseTo(hasta[2], 9);
  });

  it("usa el arco exacto de la esfera para 60 px desde el centro", () => {
    const q = girarConArrastre(IDENTIDAD, { x: 400, y: 300 }, { x: 460, y: 300 }, 800, 600);
    const angulo = Math.asin(60 / 300);
    const resultado = aplicar(aMatriz3x3(q), [0, 0, 1]);
    expect(Math.atan2(resultado[0], resultado[2])).toBeCloseTo(angulo, 12);
    expect(Math.abs(q[1])).toBeLessThan(1e-12);
    expect(Math.abs(q[3])).toBeLessThan(1e-12);
  });

  it("conserva ortogonalidad y determinante tras 10000 composiciones", () => {
    let q: Cuaternion = [...IDENTIDAD];
    for (let i = 0; i < 10000; i += 1) q = normalizar(multiplicar(desdeEjeAngulo({ x: Math.sin(i), y: Math.cos(i * 2), z: Math.sin(i * 3) }, 0.0007), q));
    const m = aMatriz3x3(q);
    const columnas = [[m[0], m[3], m[6]], [m[1], m[4], m[7]], [m[2], m[5], m[8]]];
    for (let i = 0; i < 3; i += 1) for (let j = 0; j < 3; j += 1) expect(columnas[i][0] * columnas[j][0] + columnas[i][1] * columnas[j][1] + columnas[i][2] * columnas[j][2]).toBeCloseTo(i === j ? 1 : 0, 9);
    const det = m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
    expect(det).toBeCloseTo(1, 9);
  });
});
