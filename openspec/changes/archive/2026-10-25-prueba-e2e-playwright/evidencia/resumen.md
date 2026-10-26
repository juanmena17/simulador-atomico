# Evidencia: prueba-e2e-playwright

- `@playwright/test` 1.64 con Edge (`channel: "msedge"`), un proyecto, 1920x1080. Prueba en `web/test/flujo-critico.spec.ts` con 3 escenarios.
- Contra el sitio desplegado (`E2E_BASE_URL=https://simulador-atomico-web.vercel.app`): 3 pasan (~5 s).
- Modo local (Playwright levanta `npm run build && npm run start -p 3600` con la base local): 3 pasan (~12 s).
- Hallazgo 1: Next.js inyecta un anuncio de ruta vacío con `role="alert"`; la comprobación de «sin avisos de error» solo cuenta alertas con texto.
- Hallazgo 2 (la prueba podía pasar siempre): con el título de una sección cambiado en la base a «Mecánica Clásica ROTA», la prueba seguía en verde porque `name` de Playwright compara por subcadena. Se añadió `exact: true` a todos los selectores. Repetido el fallo deliberado: 1 prueba falla con `getByRole('heading', { name: 'Mecánica Clásica', exact: true, level: 3 })` «element(s) not found» y captura; restaurado el título, vuelven a pasar las 3.
- `npx tsc --noEmit`, `npm run lint` y `npm test` (79 pasan, 23 omitidos sin BD; Vitest ya excluye `test/**`) correctos.
