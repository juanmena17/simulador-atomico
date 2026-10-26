# Tasks

## 1. Playwright

- [x] 1.1 Añadir `@playwright/test` como dependencia de desarrollo en `web/`, `web/playwright.config.ts` (Edge, un proyecto, `baseURL` y `webServer` según `E2E_BASE_URL`, informe HTML, captura al fallar), scripts `test:e2e` y `test:e2e:informe`, y excluir `test/**` de Vitest; verificar que `npm test` y `npm run lint` siguen pasando

## 2. Prueba

- [x] 2.1 Escribir `web/test/flujo-critico.spec.ts` con los tres escenarios de la especificación (página inicial, cambio de orbital, combinaciones no válidas), con aserciones intermedias y selectores por rol y nombre accesible; ejecutarla contra el sitio desplegado con `E2E_BASE_URL` y contra la aplicación local; verificar que pasa

## 3. Verificación y documentación

- [x] 3.1 Comprobar que la prueba puede fallar (alterar temporalmente una etiqueta, ver el fallo con captura, restaurar y ver el verde) y guardar la evidencia y el informe en `openspec/changes/prueba-e2e-playwright/evidencia/`
- [x] 3.2 Documentar en `web/README.md` y `CLAUDE.md` cómo ejecutar la prueba y ejecutar `npx tsc --noEmit`, `npm run lint`, `npm test` y `npm run build`; verificar que terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `e2e-testing` en `openspec/specs/`.
