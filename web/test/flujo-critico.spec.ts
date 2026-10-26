import { expect, test } from "@playwright/test";

test.describe("Flujo crítico del simulador", () => {
  test("muestra la página inicial completa", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 3, name: "Estructura atómica", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Mecánica Clásica", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Mecánica Cuántica", exact: true })).toBeVisible();
    await expect(page.locator(".katex").first()).toBeVisible();
    // Next.js inyecta un anuncio de ruta vacío con role="alert": solo cuentan los avisos con texto.
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveCount(0);
    await expect(page.getByRole("img", { name: "Orbital con n = 1 y l = 0", exact: true })).toBeVisible();
  });

  test("cambia al orbital seleccionado", async ({ page }) => {
    await page.goto("/");
    const botonN3 = page.getByRole("button", { name: "n = 3", exact: true });
    await expect(botonN3).toBeEnabled();
    await botonN3.click();
    await expect(botonN3).toHaveAttribute("aria-pressed", "true");
    const botonL2 = page.getByRole("button", { name: "l = 2 (d)", exact: true });
    await expect(botonL2).toBeEnabled();
    await botonL2.click();
    await expect(botonL2).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("img", { name: "Orbital con n = 3 y l = 2", exact: true })).toBeVisible();
  });

  test("deshabilita orbitales incompatibles con n = 1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "n = 1", exact: true })).toHaveAttribute("aria-pressed", "true");
    for (const etiqueta of ["l = 1 (p)", "l = 2 (d)", "l = 3 (f)", "l = 4 (g)"]) {
      await expect(page.getByRole("button", { name: etiqueta, exact: true })).toBeDisabled();
    }
  });
});
