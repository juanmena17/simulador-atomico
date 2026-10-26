import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "../app/page";
import type { OrbitalApi } from "../lib/visor/tipos";
import datos from "../../datos/orbitales.json";
const orbital = (datos as { orbitales: OrbitalApi[] }).orbitales.find((valor) => valor.n === 1 && valor.l === 0) as OrbitalApi;
describe("página completa", () => {
  it("compone la estructura y omite datos no respaldados", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => url === "/api/contenido" ? Promise.resolve({ status: 200, json: () => Promise.resolve([{ clave: "a", orden: 1, titulo: "Estructura atómica", contenido: "Texto" }, { clave: "b", orden: 2, titulo: "Mecánica Clásica", contenido: "Texto" }, { clave: "c", orden: 3, titulo: "Mecánica Cuántica", contenido: "Texto" }]) }) : Promise.resolve({ status: 200, json: () => Promise.resolve(orbital) })));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null); vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 1; }); render(<Home />);
    expect(screen.getByRole("heading", { name: "Simulador atómico" })).toBeVisible(); await waitFor(() => expect(screen.getByRole("heading", { name: "Estructura atómica" })).toBeInTheDocument()); expect(screen.getByRole("heading", { name: "Mecánica Clásica" })).toBeInTheDocument(); expect(screen.getByRole("heading", { name: "Mecánica Cuántica" })).toBeInTheDocument(); expect(screen.getByRole("region", { name: "Zona del visor" })).toBeInTheDocument();
  });
});
