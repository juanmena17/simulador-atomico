import type { ReactNode } from "react";

export function ViewerArea({ children }: { children?: ReactNode }) {
  return (
    <section aria-label="Zona del visor" className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-sm border border-neutral-border bg-[#0E0E11] shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:2rem_2rem]" />
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-4 w-4 border-l-2 border-t-2 border-[#00f2d1]" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-4 w-4 border-r-2 border-t-2 border-[#00f2d1]" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-4 w-4 border-b-2 border-l-2 border-[#00f2d1]" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-4 w-4 border-b-2 border-r-2 border-[#00f2d1]" />
      <div className="relative z-1 h-full w-full">{children}</div>
    </section>
  );
}
