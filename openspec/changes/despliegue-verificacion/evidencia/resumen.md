# Evidencia: despliegue y verificación final (#11)

- Web: https://simulador-atomico-web.vercel.app (proyecto `simulador-atomico-web`, Next.js, Hobby).
- Servicio de cálculo: https://simulador-atomico-calculo.vercel.app (Python 3.12, FastAPI). Sin secreto responde 401.
- BD: Neon (rama `production`), migración `inicial` aplicada, 15 orbitales y 3 secciones cargados con `npm run db:cargar`.
- Variables (todas ocultas): `SECRETO_SERVICIO` (ambos proyectos, mismo valor), `URL_SERVICIO_CALCULO` y `DATABASE_URL` (pooled) en web.
- Tiempos medidos con curl: página 0,97 s; `/api/contenido` 0,75 s; `/api/orbital` en frío 0,6–1,1 s (MISS); repetido 0,37 s (HIT) con `Cache-Control: public, max-age=31536000, immutable`. Objetivos: ≤ 1 s en caché, ≤ 5 s en frío.
- Navegador real 1920x1080 (`produccion-1920x1080.png`): 3 secciones, 39 fórmulas KaTeX, visor con "Orbital con n = 1 y l = 0", sin avisos de error, sin mensajes de consola, solicitudes solo al mismo origen.
- Incidencias resueltas: (1) `pyproject.toml` sin `[project]` hacía que Vercel no instalara FastAPI (`ModuleNotFoundError`); (2) `db:cargar` superaba el límite de 5 s de la transacción de Prisma contra Neon remoto; ahora `maxWait` 30 s y `timeout` 120 s.
