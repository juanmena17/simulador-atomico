export type Cuaternion = [number, number, number, number];
export type Punto2D = { x: number; y: number };
export type Matriz3x3 = [number, number, number, number, number, number, number, number, number];

export const IDENTIDAD: Cuaternion = [1, 0, 0, 0];

export function multiplicar(a: Cuaternion, b: Cuaternion): Cuaternion {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

export function normalizar(q: Cuaternion): Cuaternion {
  const longitud = Math.hypot(q[0], q[1], q[2], q[3]);
  if (longitud === 0) return [...IDENTIDAD];
  return [q[0] / longitud, q[1] / longitud, q[2] / longitud, q[3] / longitud];
}

export function desdeEjeAngulo(eje: { x: number; y: number; z: number }, angulo: number): Cuaternion {
  const longitud = Math.hypot(eje.x, eje.y, eje.z);
  if (longitud === 0) return [...IDENTIDAD];
  const seno = Math.sin(angulo / 2) / longitud;
  return normalizar([Math.cos(angulo / 2), eje.x * seno, eje.y * seno, eje.z * seno]);
}

export function aMatriz3x3(q: Cuaternion): Matriz3x3 {
  const [w, x, y, z] = normalizar(q);
  return [
    1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w),
    2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w),
    2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y),
  ];
}

function esferaVirtual(punto: Punto2D, ancho: number, alto: number): [number, number, number] {
  const radio = Math.min(ancho, alto) / 2;
  const x = punto.x - ancho / 2;
  const y = punto.y - alto / 2;
  const distancia = Math.hypot(x, y);
  if (distancia <= radio) return [x, y, Math.sqrt(Math.max(0, radio * radio - distancia * distancia))];
  return [x, y, (radio * radio) / (2 * distancia)];
}

export function girarConArrastre(q: Cuaternion, desde: Punto2D, hasta: Punto2D, ancho: number, alto: number): Cuaternion {
  const a = esferaVirtual(desde, ancho, alto);
  const b = esferaVirtual(hasta, ancho, alto);
  const longitudA = Math.hypot(...a);
  const longitudB = Math.hypot(...b);
  const v1: [number, number, number] = [a[0] / longitudA, a[1] / longitudA, a[2] / longitudA];
  const v2: [number, number, number] = [b[0] / longitudB, b[1] / longitudB, b[2] / longitudB];
  const cruz: [number, number, number] = [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
  const longitudCruz = Math.hypot(...cruz);
  if (longitudCruz < 1e-12) return normalizar(q);
  const angulo = Math.atan2(longitudCruz, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]);
  return normalizar(multiplicar(desdeEjeAngulo({ x: cruz[0], y: cruz[1], z: cruz[2] }, angulo), q));
}
