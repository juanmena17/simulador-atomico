import { Header } from "../components/Header";
import { PanelOrbital } from "../components/PanelOrbital";
import { TheoryPanel } from "../components/TheoryPanel";

export default function Home() {
  return (
    <div className="relative flex h-[100dvh] flex-col gap-4 overflow-hidden bg-neutral-page bg-matrix-grid p-6 font-body-md text-neutral-text-primary">
      <Header />
      <main className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,42fr)_minmax(0,58fr)] gap-4 overflow-hidden">
        <TheoryPanel />
        <section className="flex min-h-0 min-w-0 flex-col gap-4">
          <PanelOrbital />
        </section>
      </main>
    </div>
  );
}
