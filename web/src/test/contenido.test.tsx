import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import katex from "katex";
import { describe, expect, it, vi } from "vitest";
import { ContenidoMarkdown } from "../components/ContenidoMarkdown";
import { pedirContenido } from "../lib/contenido/cliente-api";
import { conReintentos } from "../lib/seleccion/reintentos";

const respuesta = (status: number, cuerpo: unknown) => ({ status, json: vi.fn().mockResolvedValue(cuerpo) }) as unknown as Response;
describe("cliente de contenido", () => {
  it("pide una vez, ordena y valida los datos", async () => {
    const fetchFn = vi.fn().mockResolvedValue(respuesta(200, [{ clave: "b", orden: 2, titulo: "B", contenido: "" }, { clave: "a", orden: 1, titulo: "A", contenido: "x" }]));
    await expect(pedirContenido({ fetchFn })).resolves.toMatchObject([{ orden: 1 }, { orden: 2 }]);
    expect(fetchFn).toHaveBeenCalledOnce();
  });
  it("propaga el código de error de la API y clasifica red", async () => {
    await expect(pedirContenido({ fetchFn: vi.fn().mockResolvedValue(respuesta(502, { error: { codigo: "servicio_no_disponible" } })) })).rejects.toMatchObject({ codigo: "servicio_no_disponible" });
    await expect(pedirContenido({ fetchFn: vi.fn().mockRejectedValue(new TypeError()) })).rejects.toMatchObject({ codigo: "red" });
  });
  it("reutiliza reintentos con una función genérica", async () => {
    vi.useFakeTimers();
    const pedir = vi.fn().mockRejectedValueOnce({ codigo: "servicio_no_disponible" }).mockResolvedValue("ok");
    const resultado = conReintentos(pedir, { esperasMs: [10, 20] });
    await vi.advanceTimersByTimeAsync(10);
    await expect(resultado).resolves.toBe("ok");
    expect(pedir).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe("ContenidoMarkdown", () => {
  it("renderiza Markdown, KaTeX y no HTML crudo", () => {
    const { container } = render(<ContenidoMarkdown contenido={'**negrita**\n\n- elemento\n\n> cita\n\n$n$ y\n\n$$\n\\hat{H}\\psi = E\\psi\n$$\n\n<script>alert(1)</script><img src=x onerror="alert(1)" />'} />);
    expect(container.querySelector("strong")).toBeInTheDocument();
    expect(container.querySelector("li")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toBeInTheDocument();
    expect(container.querySelector(".katex")).toBeInTheDocument();
    expect(container.querySelector(".katex-display")).toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("[onerror]")).not.toBeInTheDocument();
  });
  it("no rompe con una fórmula inválida", () => {
    const { container } = render(<ContenidoMarkdown contenido="$$\\comandoInexistente$$" />);
    expect(container.textContent).toMatch(/comandoInexistente/i);
  });
});

describe("contenido real", () => {
  it("cumple los conceptos y renderiza cada fórmula con KaTeX estricto", () => {
    const directorio = join(process.cwd(), "datos", "secciones");
    const archivos = readdirSync(directorio).filter((archivo) => archivo.endsWith(".md")).sort();
    expect(archivos).toHaveLength(3);
    const cuerpos = archivos.map((archivo) => readFileSync(join(directorio, archivo), "utf8").split("---").slice(2).join("---"));
    const completo = cuerpos.join("\n").toLocaleLowerCase();
    expect(cuerpos[0].toLocaleLowerCase()).toContain("número atómico");
    expect(cuerpos[0].toLocaleLowerCase()).toContain("capa de valencia");
    expect(cuerpos[1]).toContain("Bohr"); expect(cuerpos[1]).toContain("Möller");
    expect(cuerpos[2].toLocaleLowerCase()).toContain("números cuánticos"); expect(cuerpos[2].toLocaleLowerCase()).toContain("función de onda"); expect(cuerpos[2]).toContain("$m = 0$");
    for (const prohibido of ["99.94", "leptones", "hipercrítica"]) expect(completo).not.toContain(prohibido);
    // Se separan primero los bloques $$...$$ y luego las fórmulas $...$ para no mezclar sus delimitadores.
    const regex = /\$\$([\s\S]*?)\$\$|\$(?!\$)([^$\n]+?)\$(?!\$)/g;
    for (const cuerpo of cuerpos) for (const coincidencia of cuerpo.matchAll(regex)) katex.renderToString(coincidencia[1] ?? coincidencia[2], { throwOnError: true });
  });
});
