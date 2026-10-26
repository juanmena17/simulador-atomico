import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("tema compilado", () => {
  it("incluye el color de fondo del tema en el CSS de Next", () => {
    const cssDirectory = join(process.cwd(), ".next", "static", "chunks");
    expect(existsSync(cssDirectory), "ejecuta npm run build antes de npm test").toBe(true);
    const css = readdirSync(cssDirectory)
      .filter((file) => file.endsWith(".css"))
      .map((file) => readFileSync(join(cssDirectory, file), "utf8"))
      .join("\n");
    expect(css).toMatch(/\.bg-neutral-page\s*\{/);
  });
});
