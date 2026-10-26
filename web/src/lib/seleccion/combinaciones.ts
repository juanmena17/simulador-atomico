import { validarDominioOrbital } from "../db/dominio";

export const N_VALORES = [1, 2, 3, 4, 5] as const;
export const L_VALORES = [0, 1, 2, 3, 4] as const;

export function esCombinacionValida(n: number, l: number): boolean {
  try {
    validarDominioOrbital(n, l);
    return true;
  } catch {
    return false;
  }
}

export function nDisponible(n: number, lSeleccionada: number): boolean {
  return n > lSeleccionada;
}

export function lDisponible(l: number, nSeleccionada: number): boolean {
  return l < nSeleccionada;
}
