import type { Matriz3x3 } from "./rotacion";

export type ProyeccionAnillo = { puntos: Float32Array; profundidad: number };
export type PuntosAnillos = Float32Array[];

export function proyectar(
  puntosAnillos: PuntosAnillos,
  matriz: Matriz3x3,
  ancho: number,
  alto: number,
  salida: ProyeccionAnillo[] = [],
): ProyeccionAnillo[] {
  const escala = 0.46 * Math.min(ancho, alto);
  const cx = ancho / 2;
  const cy = alto / 2;
  for (let indice = 0; indice < puntosAnillos.length; indice += 1) {
    const origen = puntosAnillos[indice];
    const destino = salida[indice]?.puntos.length === origen.length ? salida[indice].puntos : new Float32Array((origen.length / 3) * 2);
    let sumaZ = 0;
    for (let i = 0, j = 0; i < origen.length; i += 3, j += 2) {
      const x = origen[i]; const y = origen[i + 1]; const z = origen[i + 2];
      const rx = matriz[0] * x + matriz[1] * y + matriz[2] * z;
      const ry = matriz[3] * x + matriz[4] * y + matriz[5] * z;
      const rz = matriz[6] * x + matriz[7] * y + matriz[8] * z;
      const factor = 4 / (4 - rz);
      destino[j] = cx + rx * factor * escala;
      destino[j + 1] = cy + ry * factor * escala;
      sumaZ += rz;
    }
    salida[indice] = { puntos: destino, profundidad: sumaZ / (origen.length / 3) };
  }
  salida.length = puntosAnillos.length;
  return salida;
}

export function ordenarPorProfundidad(anillos: ProyeccionAnillo[]): ProyeccionAnillo[] {
  return anillos.slice().sort((a, b) => a.profundidad - b.profundidad);
}
