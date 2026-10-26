# Design

## Decisiones

**D1. Navegador.** Un solo proyecto con `channel: "msedge"`: evita descargar navegadores y coincide con el navegador con el que se verificó el producto. El resto de navegadores queda fuera de alcance.

**D2. Dónde corre.** Dos modos controlados por `E2E_BASE_URL`: sin la variable, `webServer` ejecuta `npm run build && npm run start -- -p 3600` y la prueba usa `http://localhost:3600` (nunca `127.0.0.1`, por el bloqueo de recursos de desarrollo de Next.js); con la variable, usa esa URL y no levanta nada. Esto permite verificar también el sitio desplegado.

**D3. Selectores.** Se usan roles y nombres accesibles que ya existen: botones `n = 1`…`n = 5` y `l = 0 (s)`…, `img` con etiqueta «Orbital con n = … y l = …» y encabezados de nivel 3. No se añaden atributos de prueba al código.

**D4. Sin escritura.** La aplicación solo lee. La prueba no crea datos, de modo que no necesita limpieza ni rama de base de datos aparte; contra el modo local usa la base de datos que el entorno ya tenga configurada para desarrollo.

**D5. Vitest.** `vitest.config.ts` excluye `test/**` para no mezclar ambas herramientas.

**D6. Fallo deliberado.** Se verifica manualmente una vez (cambiando una etiqueta) y se guarda la evidencia; no se incluye una prueba que rompa el código.

## Riesgos

- Depende de que la base tenga las 15 combinaciones y las 3 secciones cargadas: sin datos el panel mostrará error y la prueba fallará, que es el comportamiento deseado.
- Edge debe estar instalado; en otro equipo hay que ajustar `channel` o instalar un navegador de Playwright.
