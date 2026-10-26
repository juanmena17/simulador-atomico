import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AvisoError } from "../components/AvisoError";
import { IndicadorCarga } from "../components/IndicadorCarga";

describe("componentes de resiliencia", () => {
  it("muestra el indicador accesible", () => {
    render(<IndicadorCarga />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando orbital…");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("muestra mensajes seguros y permite reintentar", () => {
    const alReintentar = vi.fn();
    render(<AvisoError codigo="servicio_no_disponible" alReintentar={alReintentar} variante="franja" />);
    expect(screen.getByRole("alert")).toHaveTextContent("El servicio de cálculo no está disponible en este momento.");
    expect(screen.getByRole("alert")).not.toHaveTextContent("servicio_no_disponible");
    expect(screen.getByRole("alert")).not.toHaveTextContent("http");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(alReintentar).toHaveBeenCalledOnce();
  });
});
