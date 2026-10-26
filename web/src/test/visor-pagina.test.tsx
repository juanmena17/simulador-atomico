import { describe, expect, it, vi } from "vitest";
import PaginaVisor from "../app/dev/visor/page";
import VisorOrbital from "../components/VisorOrbital";

describe("página de desarrollo del visor", () => {
  it("renderiza el visor fuera de producción", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const resultado = await PaginaVisor({ searchParams: Promise.resolve({ n: "3", l: "2" }) });
    const hijos = (resultado.props as { children: Array<{ props?: { children?: { props?: { children?: { type?: unknown } } } } }> }).children;
    expect(hijos[0].props?.children?.props?.children?.type).toBe(VisorOrbital);
  });

  it("lanza el error 404 de Next en producción", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(PaginaVisor({ searchParams: Promise.resolve({ n: "3", l: "2" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
