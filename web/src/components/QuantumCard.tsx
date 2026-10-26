import { orbitalLabelFromL, shellLabelFromN } from "../lib/quantum-labels";
import { L_VALORES, N_VALORES, lDisponible, nDisponible } from "../lib/seleccion/combinaciones";

type QuantumCardProps = {
  n?: number;
  l?: number;
  m?: number;
  alElegirN?: (n: number) => void;
  alElegirL?: (l: number) => void;
  deshabilitado?: boolean;
};

const ETIQUETAS_L = ["s", "p", "d", "f", "g"] as const;

export function QuantumCard({ n = 1, l = 0, m = 0, alElegirN, alElegirL, deshabilitado = false }: QuantumCardProps) {
  const shell = shellLabelFromN(n);
  const orbital = orbitalLabelFromL(l, n);
  const muestraSelectorN = alElegirN !== undefined;
  const muestraSelectorL = alElegirL !== undefined;
  const claseBoton = "rounded-sm border border-neutral-border px-2 py-1 font-code-md text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-text-primary disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <section className="relative h-[9rem] shrink-0 rounded-sm border border-neutral-border bg-neutral-surface p-3 shadow-sm">
      <div className="grid h-full grid-cols-3 gap-3">
        <div className="flex flex-col justify-between border border-neutral-border bg-neutral-surface-sub p-3"><span className="font-code-md text-xs font-bold tracking-wider text-neutral-text-secondary">NÚMERO PRINCIPAL</span><span className="font-code-md text-lg font-bold text-quantum-gold">n = {n}</span>{muestraSelectorN && <div className="flex flex-wrap gap-1">{N_VALORES.map((valor) => <button key={valor} type="button" aria-label={`n = ${valor}`} aria-pressed={valor === n} disabled={deshabilitado || !nDisponible(valor, l)} className={`${claseBoton} ${valor === n ? "bg-quantum-gold text-white" : "bg-neutral-surface"}`} onClick={() => alElegirN(valor)}>{valor}</button>)}</div>}<span className="font-code-md text-xs font-bold text-quantum-gold">CAPA {shell}</span></div>
        <div className="flex flex-col justify-between border border-neutral-border bg-neutral-surface-sub p-3"><span className="font-code-md text-xs font-bold tracking-wider text-neutral-text-secondary">AZIMUTAL // ORBITAL</span><span className="font-code-md text-lg font-bold text-quantum-cyan">l = {l}</span>{muestraSelectorL && <div className="flex flex-wrap gap-1">{L_VALORES.map((valor) => <button key={valor} type="button" aria-label={`l = ${valor} (${ETIQUETAS_L[valor]})`} aria-pressed={valor === l} disabled={deshabilitado || !lDisponible(valor, n)} className={`${claseBoton} ${valor === l ? "bg-quantum-cyan text-white" : "bg-neutral-surface"}`} onClick={() => alElegirL(valor)}>{ETIQUETAS_L[valor]}</button>)}</div>}<span className="font-code-md text-xs font-bold text-quantum-cyan">ORBITAL {orbital}</span></div>
        <div className="flex flex-col justify-between border border-neutral-border bg-neutral-surface-sub p-3"><span className="font-code-md text-xs font-bold tracking-wider text-neutral-text-secondary">MAGNÉTICO // PROYECCIÓN</span><span className="font-code-md text-lg font-bold text-quantum-violet">m = {m}</span><span className="font-code-md text-xs font-bold text-quantum-violet">FIJO EN {m}</span></div>
      </div>
    </section>
  );
}
