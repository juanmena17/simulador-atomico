import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Header } from "../components/Header";
import { QuantumCard } from "../components/QuantumCard";
import { TheoryPanel } from "../components/TheoryPanel";
import { ViewerArea } from "../components/ViewerArea";

describe("componentes del cascarón", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("muestra la cabecera sin telemetría omitida", () => { render(<Header />); expect(screen.getByRole("heading", { name: "Simulador atómico" })).toBeVisible(); expect(screen.queryByText("V1.04")).not.toBeInTheDocument(); expect(screen.queryByText("ESTADO: RESONANTE")).not.toBeInTheDocument(); });
  it("muestra las secciones teóricas en orden y con desplazamiento interno", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200, json: () => Promise.resolve([{ clave: "a", orden: 2, titulo: "Mecánica Clásica", contenido: "Texto" }, { clave: "b", orden: 1, titulo: "Estructura atómica", contenido: "Texto" }, { clave: "c", orden: 3, titulo: "Mecánica Cuántica", contenido: "Texto" }]) }));
    const { container } = render(<TheoryPanel />); await waitFor(() => expect(within(container).getAllByRole("heading").map((heading) => heading.textContent)).toEqual(["TRATADO TEÓRICO // FUNDAMENTOS", "Estructura atómica", "Mecánica Clásica", "Mecánica Cuántica"])); expect(container.querySelector(".overflow-y-auto")).toBeInTheDocument();
  });
  it("deja el visor vacío sin canvas y admite contenido", () => { const { container, rerender } = render(<ViewerArea />); expect(container.querySelector("canvas")).not.toBeInTheDocument(); expect(container.querySelector("figure")).not.toBeInTheDocument(); rerender(<ViewerArea><span>contenido del visor</span></ViewerArea>); expect(screen.getByText("contenido del visor")).toBeInTheDocument(); });
  it("muestra los valores y etiquetas derivadas sin controles", () => { render(<QuantumCard />); expect(screen.getByText("n = 1")).toBeInTheDocument(); expect(screen.getByText("l = 0")).toBeInTheDocument(); expect(screen.getByText("m = 0")).toBeInTheDocument(); expect(screen.getByText("CAPA K")).toBeInTheDocument(); expect(screen.getByText("ORBITAL s")).toBeInTheDocument(); expect(screen.queryByRole("button")).not.toBeInTheDocument(); expect(screen.queryByRole("textbox")).not.toBeInTheDocument(); });
});
