import { ErrorConsultaOrbital, pedirOrbital, RAZON_TIEMPO_INTENTO, RAZON_TIEMPO_TOTAL } from "./cliente-api";
import type { OrbitalApi } from "../visor/tipos";

export type CodigoErrorConocido = "red" | "tiempo_agotado" | "servicio_no_disponible" | "bd_no_disponible" | "error_interno" | "configuracion_incompleta" | "orbital_invalido" | "version_no_vigente" | "respuesta_invalida" | "tiempo_agotado_total";
export const CLASIFICACION_CODIGOS: Record<CodigoErrorConocido, boolean> = { red: true, tiempo_agotado: true, servicio_no_disponible: true, bd_no_disponible: true, error_interno: true, configuracion_incompleta: true, orbital_invalido: false, version_no_vigente: false, respuesta_invalida: false, tiempo_agotado_total: false };
type PoliticaReintentos = { esperasMs?: number[]; tiempoPorIntentoMs?: number; topeTotalMs?: number; signal?: AbortSignal };
type PedirOrbital = (n: number, l: number, opciones?: { signal?: AbortSignal }) => Promise<OrbitalApi>;
type OpcionesOrbital = PoliticaReintentos & { pedir?: PedirOrbital };

function esReintentable(error: unknown): boolean {
  const codigo = typeof error === "object" && error !== null && "codigo" in error ? (error as { codigo?: unknown }).codigo : undefined;
  return typeof codigo === "string" && CLASIFICACION_CODIGOS[codigo as CodigoErrorConocido] === true;
}

export function conReintentos<T>(pedir: (opciones: { signal: AbortSignal }) => Promise<T>, opciones: PoliticaReintentos = {}): Promise<T> {
  const esperasMs = opciones.esperasMs ?? [500, 1500];
  const tiempoPorIntentoMs = opciones.tiempoPorIntentoMs ?? 8000;
  const topeTotalMs = opciones.topeTotalMs ?? 15000;
  const señalExterna = opciones.signal;
  return new Promise<T>((resolve, reject) => {
    let finalizado = false; let intento = 0; let controlador: AbortController | undefined;
    let temporizadorIntento: ReturnType<typeof setTimeout> | undefined; let temporizadorEspera: ReturnType<typeof setTimeout> | undefined;
    const total = setTimeout(() => {
      if (finalizado) return; finalizado = true; if (temporizadorIntento !== undefined) clearTimeout(temporizadorIntento); if (temporizadorEspera !== undefined) clearTimeout(temporizadorEspera);
      controlador?.abort(RAZON_TIEMPO_TOTAL); const error = new Error("La consulta superó el tiempo total permitido.") as Error & { codigo: string }; error.codigo = "tiempo_agotado_total"; reject(error);
    }, topeTotalMs);
    const limpiar = () => { clearTimeout(total); if (temporizadorIntento !== undefined) clearTimeout(temporizadorIntento); if (temporizadorEspera !== undefined) clearTimeout(temporizadorEspera); };
    const terminar = (error?: unknown, datos?: T) => { if (finalizado) return; finalizado = true; limpiar(); if (error !== undefined) reject(error); else resolve(datos as T); };
    const iniciar = () => {
      if (finalizado) return; intento += 1; controlador = new AbortController();
      const abortar = () => controlador?.abort(señalExterna?.reason);
      if (señalExterna?.aborted) return terminar(new Error("Consulta cancelada."));
      señalExterna?.addEventListener("abort", abortar, { once: true });
      temporizadorIntento = setTimeout(() => controlador?.abort(RAZON_TIEMPO_INTENTO), tiempoPorIntentoMs);
      void pedir({ signal: controlador.signal }).then((datos) => terminar(undefined, datos), (error) => { señalExterna?.removeEventListener("abort", abortar); if (finalizado) return; if (temporizadorIntento !== undefined) clearTimeout(temporizadorIntento); temporizadorIntento = undefined; if (señalExterna?.aborted || !esReintentable(error) || intento >= 3) terminar(error); else temporizadorEspera = setTimeout(() => { temporizadorEspera = undefined; iniciar(); }, esperasMs[intento - 1] ?? 0); });
    }; iniciar();
  });
}

export function pedirOrbitalConReintentos(n: number, l: number, opciones: OpcionesOrbital = {}): Promise<OrbitalApi> {
  const pedir = opciones.pedir ?? pedirOrbital; const politica: PoliticaReintentos = { esperasMs: opciones.esperasMs, tiempoPorIntentoMs: opciones.tiempoPorIntentoMs, topeTotalMs: opciones.topeTotalMs };
  return conReintentos((consulta) => pedir(n, l, consulta), politica).catch((error: unknown) => { if (error instanceof ErrorConsultaOrbital) throw error; const codigo = typeof error === "object" && error !== null && "codigo" in error ? (error as { codigo?: unknown }).codigo : undefined; if (typeof codigo === "string") throw new ErrorConsultaOrbital(codigo); throw error; });
}
