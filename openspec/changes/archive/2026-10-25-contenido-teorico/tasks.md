# Tasks

## 1. Datos y presentación

- [x] 1.1 Implementar `web/src/lib/contenido/cliente-api.ts` (`pedirContenido`, una petición, comprobación de forma y de orden, errores con código, cancelación por señal) y generalizar `web/src/lib/seleccion/reintentos.ts` para reutilizar la política con cualquier función de petición sin cambiar su comportamiento con orbitales, con pruebas de ambos (las existentes de reintentos siguen pasando); verificar que pasan
- [x] 1.2 Implementar `ContenidoMarkdown` (`react-markdown` sin HTML crudo, `remark-math` y `rehype-katex` con HTML y MathML, estilos del tema, hoja de estilos de KaTeX importada del paquete) con pruebas: negrita, lista, cita, fórmula en línea y en bloque renderizadas sin signos de dólar visibles, y que `<script>` y `<img onerror>` no producen elementos activos; verificar que pasan
- [x] 1.3 Probar el contenido real: leer `web/datos/secciones/*.md`, comprobar los conceptos exigidos por la spec en cada sección, la ausencia de "99.94", "leptones" e "hipercrítica", y que todas las fórmulas se renderizan con KaTeX sin errores (`throwOnError` activado); verificar que pasa

## 2. Interfaz

- [x] 2.1 Reescribir `TheoryPanel` como componente de cliente que pide `/api/contenido` con la política de reintentos, muestra el indicador de carga, el aviso de error con "Reintentar" y las secciones (punto de color por orden, título, `ContenidoMarkdown`), conserva su cabecera, marco y desplazamiento propio, y eliminar `web/src/data/theory-sections.ts`; con pruebas con relojes y `fetch` falsos: orden, cargando, error y reintento exitoso, y que `PanelOrbital` no se ve afectado; actualizar las pruebas que dependían del texto estático (componentes y página completa); verificar que pasan

## 3. Verificación y documentación

- [x] 3.1 Verificar de punta a punta con el servidor de producción, la API y la base local con las secciones nuevas cargadas con `npm run db:cargar`: capturas del panel con las fórmulas, solicitudes de red solo al mismo origen (incluidas las fuentes de las fórmulas), un cambio del texto en la base visible tras la caché de 60 s, y un contenido malicioso insertado en la base sin efecto; guardar la evidencia en `openspec/changes/contenido-teorico/evidencia/`
- [x] 3.2 Documentar en `web/README.md` cómo cambiar el contenido (editar `web/datos/secciones/*.md` y ejecutar `npm run db:cargar`) y ejecutar `npx tsc --noEmit`, `npm run lint`, `npm test` (con y sin `DATABASE_URL_PRUEBAS`) y `npm run build`; verificar que terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `theory-content` en `openspec/specs/`.
