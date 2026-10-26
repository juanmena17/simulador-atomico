import { proyectar, type ProyeccionAnillo } from "./proyeccion";
import type { Matriz3x3 } from "./rotacion";
import type { GrupoDecodificado, GruposOrbital } from "./tipos";

export type ContextoOrbital = {
  clearRect(x: number, y: number, ancho: number, alto: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
  stroke(): void;
  lineWidth: number;
  strokeStyle: string;
  lineJoin: string;
  lineCap: string;
};

type AnilloDibujo = ProyeccionAnillo & { grupo: "envolvente" | "nucleo" };
const temporales: AnilloDibujo[] = [];

function colorRgb(grupo: AnilloDibujo["grupo"], t: number): [number, number, number] {
  const cerca = grupo === "envolvente" ? [236, 233, 68] : [251, 146, 60];
  const lejos = grupo === "envolvente" ? [217, 150, 43] : [234, 88, 12];
  return [0, 1, 2].map((i) => Math.round(lejos[i] * (1 - t) + cerca[i] * t)) as [number, number, number];
}

function trazar(ctx: ContextoOrbital, anillo: ProyeccionAnillo): void {
  const puntos = anillo.puntos;
  if (puntos.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(puntos[0], puntos[1]);
  for (let i = 2; i < puntos.length; i += 2) ctx.lineTo(puntos[i], puntos[i + 1]);
  ctx.closePath();
}

export function dibujarOrbital(ctx: ContextoOrbital, grupos: GruposOrbital | null | undefined, matriz: Matriz3x3, ancho: number, alto: number, dpr: number): void {
  ctx.clearRect(0, 0, ancho, alto);
  temporales.length = 0;
  const agregar = (grupo: GrupoDecodificado | null | undefined, nombre: AnilloDibujo["grupo"]): void => {
    if (!grupo) return;
    const proyectados = proyectar(grupo.anillos, matriz, ancho, alto);
    for (const anillo of proyectados) temporales.push({ ...anillo, grupo: nombre });
  };
  agregar(grupos?.envolvente, "envolvente");
  agregar(grupos?.nucleo, "nucleo");
  if (temporales.length === 0) return;
  temporales.sort((a, b) => a.profundidad - b.profundidad);
  let minimo = temporales[0].profundidad; let maximo = minimo;
  for (const anillo of temporales) { minimo = Math.min(minimo, anillo.profundidad); maximo = Math.max(maximo, anillo.profundidad); }
  const rango = maximo - minimo || 1;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  for (const anillo of temporales) {
    const t = (anillo.profundidad - minimo) / rango;
    const rgb = colorRgb(anillo.grupo, t);
    const opacidad = 0.28 + 0.67 * t;
    trazar(ctx, anillo); ctx.lineWidth = (3.2 * dpr); ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(opacidad * 0.16).toFixed(3)})`; ctx.stroke();
    trazar(ctx, anillo); ctx.lineWidth = (anillo.grupo === "nucleo" ? 1.6 : 1.3) * dpr; ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacidad.toFixed(3)})`; ctx.stroke();
  }
}
