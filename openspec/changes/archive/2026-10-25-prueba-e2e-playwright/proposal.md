# Proposal

## Why

El proyecto tiene pruebas unitarias y de integración con Vitest, pero ninguna prueba que recorra la aplicación como lo hace un estudiante en un navegador real. La rúbrica del curso exige al menos una prueba Playwright de un flujo crítico en la carpeta `test`. Además, las verificaciones de extremo a extremo hechas hasta ahora fueron manuales (un cliente CDP propio) y no quedan como parte repetible del repositorio.

## What Changes

- Se añade Playwright como dependencia de desarrollo de `web/`, con una configuración que usa el navegador Edge ya instalado (sin descargar navegadores) y un solo proyecto de navegador.
- Se escribe una prueba E2E del flujo crítico: abrir la página, ver el panel teórico con sus tres secciones y fórmulas, ver un orbital inicial, elegir otros `n` y `l` y comprobar que el visor cambia, y que `l` y `n` incompatibles quedan bloqueados.
- La prueba puede ejecutarse contra la aplicación local (Playwright levanta `next start`) o contra una URL ya desplegada mediante `E2E_BASE_URL`.
- Se comprueba que la prueba puede fallar: se rompe temporalmente una condición y se verifica que se vuelve roja.
- Se documenta cómo ejecutarla y su entorno (nunca contra una base de datos de producción con escritura).

## Capabilities

### New Capabilities

- `e2e-testing`: prueba de extremo a extremo del flujo crítico del simulador con Playwright.

### Modified Capabilities

(ninguna)

## Impact

- **Código:** nueva carpeta `web/test/` con la prueba, `web/playwright.config.ts`, scripts `test:e2e` y `test:e2e:informe` en `web/package.json`, y una sección en `web/README.md`.
- **Dependencias nuevas:** `@playwright/test` (desarrollo). Sin descarga de navegadores: se usa el canal `msedge`.
- **Vitest:** debe excluir `web/test/` para no ejecutar la prueba de Playwright.
- **Fuera de alcance:** pruebas en varios navegadores, integración continua (se decidirá con la sesión de despliegue y seguridad del curso), pruebas visuales de comparación de imágenes y de rendimiento.
- **Referencias:** PRD (criterios de aceptación), capacidades `app-shell`, `orbital-selection`, `orbital-viewer`, `theory-content`; separata de la sesión 11.
