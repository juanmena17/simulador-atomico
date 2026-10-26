"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { decodificarGrupo } from "../lib/visor/decodificar";
import { dibujarOrbital, type ContextoOrbital } from "../lib/visor/dibujar";
import { aMatriz3x3, desdeEjeAngulo, girarConArrastre, IDENTIDAD, multiplicar, normalizar, type Cuaternion, type Matriz3x3, type Punto2D } from "../lib/visor/rotacion";
import type { GruposOrbital, OrbitalApi } from "../lib/visor/tipos";

export type OrientacionInicial = { rx: number; ry: number; rz: number };

type PropsVisorOrbital = {
  orbital?: OrbitalApi | null;
  orientacionInicial?: OrientacionInicial;
  alDibujar?: (matriz: Matriz3x3) => void;
};

const ORIENTACION_POR_DEFECTO: OrientacionInicial = { rx: 25, ry: -30, rz: 0 };

function orientacionInicial(a: OrientacionInicial): Cuaternion {
  const radianes = Math.PI / 180;
  const qx = desdeEjeAngulo({ x: 1, y: 0, z: 0 }, a.rx * radianes);
  const qy = desdeEjeAngulo({ x: 0, y: 1, z: 0 }, a.ry * radianes);
  const qz = desdeEjeAngulo({ x: 0, y: 0, z: 1 }, a.rz * radianes);
  return normalizar(multiplicar(qz, multiplicar(qy, qx)));
}

function posicionEnCanvas(canvas: HTMLCanvasElement, evento: { clientX: number; clientY: number }): Punto2D {
  const rect = canvas.getBoundingClientRect();
  return { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
}

export default function VisorOrbital({ orbital, orientacionInicial: orientacion = ORIENTACION_POR_DEFECTO, alDibujar }: PropsVisorOrbital) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orientacionRef = useRef<Cuaternion | null>(null);
  const ultimaPosicionRef = useRef<Punto2D | null>(null);
  const arrastrandoRef = useRef(false);
  const marcoPendienteRef = useRef<number | null>(null);
  const medidasRef = useRef({ ancho: 0, alto: 0, dpr: 1 });
  const grupos = useMemo<GruposOrbital | null>(() => orbital ? {
    envolvente: decodificarGrupo(orbital.envolvente),
    nucleo: decodificarGrupo(orbital.nucleo),
  } : null, [orbital]);

  if (orientacionRef.current === null) orientacionRef.current = orientacionInicial(orientacion);

  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const contexto = canvas.getContext("2d") as ContextoOrbital | null;
    if (!contexto) return;
    const { ancho, alto, dpr } = medidasRef.current;
    if (typeof (contexto as ContextoOrbital & { setTransform?: (a: number, b: number, c: number, d: number, e: number, f: number) => void }).setTransform === "function") {
      (contexto as ContextoOrbital & { setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => void }).setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const matriz = aMatriz3x3(orientacionRef.current ?? IDENTIDAD);
    dibujarOrbital(contexto, grupos, matriz, ancho, alto, dpr);
    alDibujar?.(matriz);
  }, [alDibujar, grupos]);

  const solicitarDibujo = useCallback(() => {
    if (marcoPendienteRef.current !== null) return;
    marcoPendienteRef.current = requestAnimationFrame(() => {
      marcoPendienteRef.current = null;
      dibujar();
    });
  }, [dibujar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const contenedor = contenedorRef.current;
    if (!canvas || !contenedor) return;

    const medir = () => {
      const rectContenedor = contenedor.getBoundingClientRect();
      const rectCanvas = canvas.getBoundingClientRect();
      const ancho = rectContenedor.width || rectCanvas.width || 300;
      const alto = rectContenedor.height || rectCanvas.height || 150;
      const dpr = Math.max(1, globalThis.devicePixelRatio || 1);
      medidasRef.current = { ancho, alto, dpr };
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      solicitarDibujo();
    };

    medir();
    const observador = typeof ResizeObserver === "function" ? new ResizeObserver(medir) : null;
    observador?.observe(contenedor);
    return () => {
      observador?.disconnect();
      if (marcoPendienteRef.current !== null) cancelAnimationFrame(marcoPendienteRef.current);
      marcoPendienteRef.current = null;
    };
  }, [solicitarDibujo]);

  const pointerDown = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    if (evento.button !== 0) return;
    arrastrandoRef.current = true;
    ultimaPosicionRef.current = posicionEnCanvas(evento.currentTarget, evento);
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
  };
  const pointerMove = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    if (!arrastrandoRef.current || !ultimaPosicionRef.current) return;
    const canvas = evento.currentTarget;
    const actual = posicionEnCanvas(canvas, evento);
    const { ancho, alto } = medidasRef.current;
    orientacionRef.current = girarConArrastre(orientacionRef.current ?? IDENTIDAD, ultimaPosicionRef.current, actual, ancho, alto);
    ultimaPosicionRef.current = actual;
    solicitarDibujo();
  };
  const pointerUp = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    arrastrandoRef.current = false;
    ultimaPosicionRef.current = null;
    canvasRef.current?.releasePointerCapture?.(evento.pointerId);
  };

  const etiqueta = orbital ? `Orbital con n = ${orbital.n} y l = ${orbital.l}` : "Sin orbital";
  return <div ref={contenedorRef} style={{ width: "100%", height: "100%" }}>
    <canvas ref={canvasRef} role="img" aria-label={etiqueta} style={{ display: "block", width: "100%", height: "100%", touchAction: "none" }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} />
  </div>;
}

export function MedidorVisor({ orbital }: { orbital: OrbitalApi }) {
  const resultadoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000; canvas.height = 700;
    const contexto = canvas.getContext("2d") as ContextoOrbital | null;
    if (!contexto || !resultadoRef.current) return;
    const grupos: GruposOrbital = { envolvente: decodificarGrupo(orbital.envolvente), nucleo: decodificarGrupo(orbital.nucleo) };
    let q: Cuaternion = [...IDENTIDAD];
    const inicio = performance.now();
    for (let cuadro = 0; cuadro < 240; cuadro += 1) {
      q = normalizar(multiplicar(desdeEjeAngulo({ x: 0.4, y: 0.8, z: 0.2 }, 0.012), q));
      dibujarOrbital(contexto, grupos, aMatriz3x3(q), 1000, 700, 1);
    }
    const promedio = (performance.now() - inicio) / 240;
    resultadoRef.current.textContent = `promedio_ms=${promedio.toFixed(3)} cuadros=240 n=${orbital.n} l=${orbital.l}`;
  }, [orbital]);
  return <div id="resultado-medicion" ref={resultadoRef} />;
}
