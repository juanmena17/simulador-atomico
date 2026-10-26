export function IndicadorCarga({ texto = "Cargando orbital…" }: { texto?: string }) {
  return <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20" role="status" aria-live="polite"><div className="rounded-sm border border-neutral-border bg-neutral-surface px-4 py-3 text-sm text-neutral-text-primary shadow-lg">{texto}</div></div>;
}
