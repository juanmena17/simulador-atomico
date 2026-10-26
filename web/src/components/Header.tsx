export function Header() {
  return (
    <header className="flex h-[6.25rem] shrink-0 items-center border border-neutral-border bg-neutral-surface px-8 shadow-sm">
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-neutral-border bg-neutral-surface-sub text-quantum-gold shadow-sm">
          <svg aria-label="Logotipo hub" className="h-8 w-8" viewBox="0 0 32 32" fill="none" role="img">
            <circle cx="16" cy="16" r="4" fill="currentColor" />
            <circle cx="16" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="6" cy="22" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="26" cy="22" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M16 12V8M12.5 18 8.5 20.5M19.5 18l4 2.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-[2.125rem] font-bold leading-none tracking-tight text-neutral-text-primary">Simulador atómico</h1>
          <p className="font-code-md text-xs font-bold tracking-[0.22em] text-neutral-text-secondary">ORBITALES DE UN ÁTOMO HIDROGENOIDE</p>
        </div>
      </div>
    </header>
  );
}
