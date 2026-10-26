# Tasks

## 1. Política de reintentos

- [x] 1.1 Añadir cancelación a `pedirOrbital` en `web/src/lib/seleccion/cliente-api.ts` (señal opcional; abortada por tiempo del intento da `tiempo_agotado`, por el tope total da `tiempo_agotado_total`) y ampliar sus pruebas; verificar que las pruebas existentes y las nuevas pasan
- [x] 1.2 Implementar `web/src/lib/seleccion/reintentos.ts` (esperas de 0,5 y 1,5 s, 8 s por intento, tope total de 15 s, clasificación única de códigos reintentables y no reintentables) con pruebas con relojes simulados: éxito al primer intento, éxito tras reintentos con las esperas exactas, fallo persistente con exactamente 3 intentos, sin reintento para `orbital_invalido`, `version_no_vigente` y `respuesta_invalida`, intento abandonado a los 8 s, tope de 15 s con un servidor que nunca responde y que no queden temporizadores ni peticiones pendientes; verificar que pasan

## 2. Interfaz

- [x] 2.1 Implementar `IndicadorCarga` (`role="status"`, "Cargando orbital…", sin animación) y `AvisoError` (`role="alert"`, mensaje por tipo de fallo, botón "Reintentar") con sus pruebas: un mensaje por cada código conocido, ninguno con datos internos y el botón llama a la función de reintento; verificar que pasan
- [x] 2.2 Integrar la política y los componentes en `PanelOrbital.tsx` (estado ocioso, cargando o error; indicador durante toda la consulta; aviso con orbital anterior visible o ocupando el visor en la primera carga; "Reintentar" repite la elección fallida; un éxito retira el error; selectores bloqueados durante los reintentos y desbloqueados al terminar) con pruebas con relojes y `fetch` falsos de todos esos casos, y actualizar las pruebas existentes del panel; verificar que pasan

## 3. Verificación y documentación

- [x] 3.1 Verificar de punta a punta con el servidor de producción y un navegador: con la base de datos inalcanzable de verdad (error real 503 con reintentos y mensaje), con un servidor que no responde (tope de 15 s medido), con un fallo pasajero y con "Reintentar" exitoso; guardar capturas y las mediciones de tiempo en `openspec/changes/resiliencia-navegador/evidencia/`
- [x] 3.2 Documentar la política en `web/README.md` y ejecutar `npx tsc --noEmit`, `npm run lint`, `npm test` (con y sin `DATABASE_URL_PRUEBAS`) y `npm run build`; verificar que terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `orbital-resilience` en `openspec/specs/`.
