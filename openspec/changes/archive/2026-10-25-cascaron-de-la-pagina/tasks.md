# Tasks

## 1. Proyecto base

- [x] 1.1 Crear el proyecto en `web/` con el generador de Next.js (TypeScript, App Router, Tailwind, ESLint y npm) y verificar que `npm run build` termina sin errores
- [x] 1.2 Instalar y configurar Vitest con Testing Library y verificar que `npm test` ejecuta una prueba de ejemplo en verde
- [x] 1.3 Instalar las fuentes Space Grotesk, Newsreader y JetBrains Mono con paquetes `@fontsource`, importarlas desde el diseño raíz y verificar que `npm run build` incluye los archivos de las fuentes en su propia salida
- [x] 1.4 Trasladar el tema del `code.html` de `ultima_v4` (colores, familias tipográficas y radios) a la configuración de Tailwind y verificar con una prueba que una clase del tema (por ejemplo, el color de fondo de la página) se aplica en la construcción
- [x] 1.5 Escribir `web/README.md` con los comandos de instalación, desarrollo, pruebas, lint y construcción, y actualizar la sección "Comandos del entorno" de `CLAUDE.md` con esos mismos comandos; verificar que cada comando documentado se ejecuta tal como está escrito

## 2. Etiquetas de los números cuánticos

- [x] 2.1 Implementar las funciones puras que derivan la capa (K, L, M, N, O) a partir de n y el tipo de orbital (s, p, d, f, g) a partir de l, con pruebas que cubran n de 1 a 5 y l de 0 a 4 y rechacen valores fuera de rango, y verificar que las pruebas pasan

## 3. Componentes

- [x] 3.1 Implementar `Header` con el logotipo en SVG, el título "Simulador atómico" y el subtítulo "ORBITALES DE UN ÁTOMO HIDROGENOIDE", con altura de 6,25 rem; verificar con pruebas que el título es visible y que no aparece el texto "V1.04" ni "ESTADO: RESONANTE"
- [x] 3.2 Implementar `TheoryPanel` con las tres secciones en el orden Estructura atómica, Mecánica Clásica y Mecánica Cuántica, tomando el texto provisional del diseño de datos estáticos, con desplazamiento vertical propio y la ecuación como texto; verificar con pruebas el orden de los títulos y la presencia del desplazamiento interno
- [x] 3.3 Implementar `ViewerArea` como contenedor oscuro con marco, cuadrícula y esquinas en L, con un espacio para el contenido del visor; verificar con pruebas que sin contenido no dibuja ningún canvas ni orbital y que muestra el contenido que se le pase
- [x] 3.4 Implementar `QuantumCard` con los valores n = 1, l = 0 y m = 0 por parámetros, las etiquetas derivadas de la tarea 2.1 y sin controles interactivos; verificar con pruebas que muestra "n = 1", "l = 0" y "m = 0" y que no contiene botones ni campos de entrada

## 4. Composición y adaptación

- [x] 4.1 Componer la página con la cabecera y las dos columnas (42 % y 58 %), altura igual a la de la ventana, unidad base escalada con el ancho (16 px a 1920 px, mínimo 13 px y máximo 22 px) y el panel teórico como única zona con desplazamiento; verificar con una captura a 1920×1080 que la estructura coincide con el `code.html` de `ultima_v4`
- [x] 4.2 Añadir una prueba de la página completa que compruebe que no aparecen "COH: 99.98%", "LIVE 60 FPS", "V1.04", "POTENCIAL: -13.6 eV" ni "[NO DEGENERADO]", y verificar que pasa

## 5. Verificación de integración

- [x] 5.1 Abrir la página construida (`npm run build` y `npm start`) en un navegador con registro de red y verificar que todas las solicitudes van al mismo origen, sin tipografías, estilos ni iconos de terceros
- [x] 5.2 Tomar capturas a 1280×720, 1366×768, 1920×1080 y 2560×1440, guardarlas en `openspec/changes/cascaron-de-la-pagina/evidencia/` y verificar en cada una que no hay desplazamiento horizontal, ni elementos superpuestos, ni espacios vacíos grandes
- [x] 5.3 Ejecutar `npm run lint`, `npm test` y `npm run build` en `web/` y verificar que los tres terminan sin errores

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `app-shell` en `openspec/specs/`.
