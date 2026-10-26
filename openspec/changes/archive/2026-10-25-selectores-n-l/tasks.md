# Tasks

## 1. Lógica

- [x] 1.1 Implementar `web/src/lib/seleccion/combinaciones.ts` (valores de n de 1 a 5 y de l de 0 a 4, `esCombinacionValida`, disponibilidad de cada botón de n y de l dada la selección, con las reglas l < n y n > l, reutilizando `validarDominioOrbital`) con pruebas que cubran las 15 combinaciones válidas, las inválidas y la disponibilidad de todos los botones para todas las selecciones posibles; verificar que pasan
- [x] 1.2 Implementar `web/src/lib/seleccion/cliente-api.ts` (`pedirOrbital` con `fetch` inyectable, una sola petición, versión vigente, comprobación de estado y de forma, `ErrorConsultaOrbital` con código) con pruebas con un `fetch` falso: URL exacta, respuesta correcta, error de la API con su código, red caída, JSON inválido, forma o valores distintos de los pedidos y que hace exactamente una petición; verificar que pasan

## 2. Interfaz

- [x] 2.1 Añadir a `QuantumCard` los selectores de n y de l (botones nativos con `aria-pressed`, `disabled` según la disponibilidad, nombres accesibles) mediante las props opcionales `alElegirN`, `alElegirL` y `deshabilitado`, conservando el comportamiento de solo lectura cuando no se pasan, sin control para m, y actualizar las pruebas de la tarjeta; verificar que pasan
- [x] 2.2 Implementar `web/src/components/PanelOrbital.tsx` (estado en memoria, carga inicial de n = 1 y l = 0, flujo de elección con bloqueo de los selectores y una sola consulta en curso, reversión de la selección ante error, orbital anterior visible, visor con orientación conservada) y montarlo en `page.tsx` en lugar de la columna derecha actual, con pruebas en jsdom con `fetch` y lienzo falsos: carga inicial, elegir l, bloqueo mientras la promesa no se resuelve, un solo `fetch` en vuelo, reversión ante error, tarjeta actualizada con "CAPA" y "ORBITAL", ausencia de control para m y uso con teclado; actualizar la prueba de la página completa; verificar que pasan

## 3. Verificación y documentación

- [x] 3.1 Verificar de punta a punta con el servidor de producción, la API y la base local con datos (clics reales con un navegador sin ventana, comprobando orbital mostrado, tarjeta, bloqueo con una respuesta retardada, reversión ante un error simulado y conservación de la orientación tras un arrastre), guardar capturas y un resumen en `openspec/changes/selectores-n-l/evidencia/`
- [x] 3.2 Documentar el uso en `web/README.md` y ejecutar `npx tsc --noEmit`, `npm run lint`, `npm test` (con y sin `DATABASE_URL_PRUEBAS`) y `npm run build`; verificar que terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluidas las capacidades `orbital-selection` y `app-shell` en `openspec/specs/`.
