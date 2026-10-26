const SHELL_LABELS = ["K", "L", "M", "N", "O"] as const;
const ORBITAL_LABELS = ["s", "p", "d", "f", "g"] as const;

function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

export function shellLabelFromN(n: number): (typeof SHELL_LABELS)[number] {
  if (!isInteger(n) || n < 1 || n > SHELL_LABELS.length) {
    throw new RangeError("n debe ser un entero entre 1 y 5");
  }
  return SHELL_LABELS[n - 1];
}

export function orbitalLabelFromL(l: number, n?: number): (typeof ORBITAL_LABELS)[number] {
  if (!isInteger(l) || l < 0 || l > ORBITAL_LABELS.length - 1) {
    throw new RangeError("l debe ser un entero entre 0 y 4");
  }
  if (n !== undefined && (!isInteger(n) || n < 1 || n > 5 || l > n - 1)) {
    throw new RangeError("l debe cumplir l ≤ n - 1");
  }
  return ORBITAL_LABELS[l];
}

export const getShellLabel = shellLabelFromN;
export const getOrbitalType = orbitalLabelFromL;
