export type GrupoAnillos = {
  p: string;
  l: number[];
};

export type OrbitalApi = {
  n: number;
  l: number;
  version: string | number;
  extension: number;
  envolvente: GrupoAnillos;
  nucleo: GrupoAnillos;
};

export type GrupoDecodificado = {
  anillos: Float32Array[];
};

export type GruposOrbital = {
  envolvente?: GrupoDecodificado | null;
  nucleo?: GrupoDecodificado | null;
};
