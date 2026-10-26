import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import datos from "../../datos/orbitales.json";
import { PanelOrbital } from "../components/PanelOrbital";
import type { OrbitalApi } from "../lib/visor/tipos";

const orbitales = (datos as { orbitales: OrbitalApi[] }).orbitales;
const buscar = (n: number, l: number) => orbitales.find((orbital) => orbital.n === n && orbital.l === l) as OrbitalApi;

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 1; });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("PanelOrbital", () => {
  it("carga 1s y bloquea los botones mientras espera", async () => {
    let resolver: ((respuesta: Response) => void) | undefined;
    const fetchFn = vi.fn().mockReturnValue(new Promise<Response>((resolve) => { resolver = resolve; }));
    vi.stubGlobal("fetch", fetchFn);
    render(<PanelOrbital />);
    expect(screen.getByRole("button", { name: "n = 2" })).toBeDisabled();
    resolver?.({ status: 200, json: vi.fn().mockResolvedValue(buscar(1, 0)) } as unknown as Response);
    await waitFor(() => expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Orbital con n = 1 y l = 0"));
    expect(screen.getByRole("button", { name: "n = 2" })).toBeEnabled();
    expect(fetchFn).toHaveBeenCalledWith("/api/orbital?n=1&l=0&v=1", expect.objectContaining({ method: "GET", signal: expect.any(AbortSignal) }));
  });

  it("cambia n y luego l sin pedir combinaciones inválidas", async () => {
    const fetchFn = vi.fn().mockImplementation((url: string) => {
      const parametros = new URL(url, "http://localhost").searchParams;
      return Promise.resolve({ status: 200, json: () => Promise.resolve(buscar(Number(parametros.get("n")), Number(parametros.get("l")))) });
    });
    vi.stubGlobal("fetch", fetchFn);
    render(<PanelOrbital />);
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "n = 3" }));
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "l = 2 (d)" }));
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(3));
    expect(screen.getByText("ORBITAL d")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Orbital con n = 3 y l = 2");
    expect(fetchFn.mock.calls.every(([url]) => !url.includes("n=1&l=2"))).toBe(true);
  });

  it("conserva el orbital anterior si la consulta falla", async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce({ status: 200, json: () => Promise.resolve(buscar(1, 0)) })
      .mockResolvedValue({ status: 502, json: () => Promise.resolve({ error: { codigo: "servicio_no_disponible" } }) });
    vi.stubGlobal("fetch", fetchFn);
    render(<PanelOrbital />);
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "n = 2" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByText("n = 1")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Orbital con n = 1 y l = 0");
  });
});
