# ADR 0004: Stack de la página web: Next.js (TypeScript) con canvas 2D propio

## Estado

Aceptado

## Contexto

La página web es el componente que el estudiante usa (ADR 0001). Debe reproducir el diseño aprobado (`design/stitch/ultima_v4/`), mostrar un visor 3D del orbital hecho de anillos que se puede girar libremente en los tres ejes con el ratón, desplegarse en Vercel con el plan gratuito y no depender de recursos de terceros: estilos, fuentes y bibliotecas se sirven desde el propio servidor. Además, expone las rutas de API que el navegador usa (ADR 0003).

Ya existe un visor web funcional que dibuja los anillos con proyección 3D en un canvas 2D (`web/atomo.template.html` en `D:\DMC\Projects\visualAtoms`), con giro por arrastre y los datos de los orbitales en formato compacto.

## Decisión

La página se construye con **Next.js y TypeScript**, desplegada en Vercel. El visor 3D se dibuja con un **canvas 2D propio**, que proyecta los anillos y gira en los tres ejes con el ratón, trasladando el visor web ya existente.

## Alternativas consideradas

- **Next.js con Three.js** — era viable y ofrece giro y rendimiento sólidos con una cámara lista para usar. No se eligió porque es una dependencia grande para dibujar solo líneas y añade más de lo que el producto necesita en esta versión.
- **HTML y JavaScript sin framework** — era viable y la opción más liviana. No se eligió porque obligaría a resolver a mano las rutas de API, la estructura del proyecto y el despliegue, que Next.js ya resuelve en Vercel.

## Consecuencias

- El visor ya probado se reutiliza casi directamente y no hay dependencias gráficas que mantener.
- Next.js encaja de forma natural con Vercel y con las rutas de API que necesita la página.
- La proyección, el giro y el orden de dibujo de los anillos los escribimos y mantenemos nosotros; si crece la exigencia gráfica, habrá que migrar a Three.js.
- Con n alto (4 y 5) hay muchos anillos y el canvas 2D puede ir menos fluido en equipos modestos; el rendimiento debe medirse al implementar.
- Hay que alojar en el propio servidor las fuentes y estilos que el diseño de Stitch cargaba desde internet.
