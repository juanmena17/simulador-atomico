export class ErrorDominioOrbital extends Error {
  constructor(n: unknown, l: unknown) {
    super(`Orbital fuera de dominio: n=${String(n)}, l=${String(l)}.`);
    this.name = "ErrorDominioOrbital";
  }
}

export function validarDominioOrbital(n: unknown, l: unknown): void {
  const nNumero = typeof n === "number" ? n : Number.NaN;
  const lNumero = typeof l === "number" ? l : Number.NaN;
  if (!Number.isInteger(nNumero) || nNumero < 1 || nNumero > 5 || !Number.isInteger(lNumero) || lNumero < 0 || lNumero >= nNumero) {
    throw new ErrorDominioOrbital(n, l);
  }
}
