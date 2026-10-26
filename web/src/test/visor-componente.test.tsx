import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import datos from "../../datos/orbitales.json";
import VisorOrbital from "../components/VisorOrbital";
import type { OrbitalApi } from "../lib/visor/tipos";

const orbitales = (datos as { orbitales: OrbitalApi[] }).orbitales;
let marcos: FrameRequestCallback[] = [];
let observador: ((entradas: ResizeObserverEntry[]) => void) | undefined;
let limpiezas = 0;

class ContextoFalso {
  lineWidth = 0; strokeStyle = ""; lineJoin = ""; lineCap = "";
  puntos: Array<[number, number]> = [];
  clearRect = vi.fn(); beginPath = vi.fn(); lineTo = vi.fn(); closePath = vi.fn(); stroke = vi.fn();
  moveTo = vi.fn((x: number, y: number) => this.puntos.push([x, y]));
  setTransform = vi.fn();
}

const contexto = new ContextoFalso();

beforeEach(() => {
  marcos = [];
  limpiezas = 0;
  contexto.puntos = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { marcos.push(cb); return marcos.length; });
  vi.stubGlobal("cancelAnimationFrame", () => { limpiezas += 1; });
  vi.stubGlobal("ResizeObserver", class { constructor(cb: (entradas: ResizeObserverEntry[]) => void) { observador = cb; } observe() {} disconnect() {} });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(contexto as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON() {} });
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function dibujarPendiente() { act(() => { const cb = marcos.shift(); cb?.(0); }); }

describe("VisorOrbital", () => {
  it("sin orbital no dibuja anillos y es accesible", () => {
    const vista = render(<VisorOrbital />);
    dibujarPendiente();
    expect(vista.getByRole("img")).toHaveAttribute("aria-label", "Sin orbital");
    expect(contexto.puntos).toHaveLength(0);
  });

  it("dibuja el orbital real, gira solo con el botón principal y redibuja", () => {
    const vista = render(<VisorOrbital orbital={orbitales.find((x) => x.n === 3 && x.l === 2)} />);
    const canvas = vista.getByRole("img");
    dibujarPendiente();
    const antes = contexto.puntos[0];
    contexto.puntos = [];
    fireEvent(canvas, new MouseEvent("pointerdown", { bubbles: true, button: 2, clientX: 400, clientY: 300 }));
    fireEvent(canvas, new MouseEvent("pointermove", { bubbles: true, buttons: 1, clientX: 460, clientY: 300 }));
    expect(marcos).toHaveLength(0);
    fireEvent(canvas, new MouseEvent("pointerdown", { bubbles: true, button: 0, clientX: 400, clientY: 300 }));
    fireEvent(canvas, new MouseEvent("pointermove", { bubbles: true, buttons: 1, clientX: 460, clientY: 300 }));
    expect(marcos).toHaveLength(1);
    dibujarPendiente();
    expect(contexto.puntos[0]).not.toEqual(antes);
    expect(vista.container.querySelectorAll("button,input,[role=slider]")).toHaveLength(0);
  });

  it("redibuja al cambiar el tamaño y conserva orientación al cambiar orbital", () => {
    const matrices: unknown[] = [];
    const vista = render(<VisorOrbital orbital={orbitales[0]} alDibujar={(matriz) => matrices.push(matriz)} />);
    dibujarPendiente();
    const ultimo = matrices.at(-1);
    fireEvent(vista.getByRole("img"), new MouseEvent("pointerdown", { bubbles: true, button: 0, clientX: 400, clientY: 300 }));
    fireEvent(vista.getByRole("img"), new MouseEvent("pointermove", { bubbles: true, buttons: 1, clientX: 460, clientY: 300 }));
    dibujarPendiente();
    const girado = matrices.at(-1);
    vista.rerender(<VisorOrbital orbital={orbitales[1]} alDibujar={(matriz) => matrices.push(matriz)} />);
    dibujarPendiente();
    expect(matrices.at(-1)).toEqual(girado);
    expect(ultimo).not.toEqual(girado);
    observador?.([]);
    expect(marcos).toHaveLength(1);
    expect(limpiezas).toBe(0);
  });

  it("no solicita más cuadros en reposo", () => {
    render(<VisorOrbital orbital={orbitales[0]} />);
    dibujarPendiente();
    expect(marcos).toHaveLength(0);
  });
});
