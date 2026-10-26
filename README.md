# Simulador atómico

Visor interactivo de orbitales de un átomo hidrogenoide. El estudiante elige los números cuánticos `n` y `l` (con `m = 0`), gira el orbital con el ratón y lee al lado el contenido teórico (estructura atómica, mecánica clásica y mecánica cuántica, con fórmulas).

**Demo:** https://simulador-atomico-web.vercel.app (pensada para escritorio, 1920×1080)

Es un proyecto de práctica del curso *Desarrollo de software AI First con Claude Code* y se construyó con desarrollo guiado por especificaciones: PRD, diseño técnico, ADR, backlog y un cambio de OpenSpec por cada ítem.

## Cómo funciona

El cálculo pesado no ocurre en el equipo del estudiante. Hay dos proyectos independientes en Vercel:

| Carpeta | Qué es | Tecnología |
|---|---|---|
| [`web/`](web) | Página, visor 3D de anillos (canvas 2D, rotación con arcball) y API de lectura | Next.js 16, TypeScript, Tailwind v4, Prisma 7 |
| [`servicio-calculo/`](servicio-calculo) | Cálculo de los orbitales y sus anillos de probabilidad | Python 3.12, FastAPI, NumPy, SciPy, scikit-image |

Los orbitales ya calculados y el contenido teórico se guardan en PostgreSQL (Neon). Solo la página accede a la base de datos; el servicio de cálculo se protege con un secreto compartido. Las respuestas de orbitales llevan la versión del algoritmo en la URL y se cachean de forma inmutable.

## Estructura

- [`docs/`](docs): [PRD](docs/PRD.md), [diseño técnico](docs/TECH-DESIGN-v2.md), [backlog](docs/BACKLOG.md) y [revisión adversarial](docs/REVISION-ADVERSARIAL.md).
- [`adrs/`](adrs): 23 decisiones de arquitectura.
- [`openspec/`](openspec): especificaciones vigentes (`specs/`) y cambios archivados con su evidencia (`changes/archive/`).
- [`design/`](design): diseño de referencia generado con Google Stitch.
- [`CLAUDE.md`](CLAUDE.md): contexto y reglas para el agente.

## Ejecutarlo en local

Requisitos: Node 22, Python 3.12 y una base PostgreSQL. Las variables van en el entorno de la terminal, nunca en archivos del repositorio.

```bash
# Servicio de cálculo
cd servicio-calculo
python -m venv .venv && .venv/Scripts/activate   # en Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app:app --port 8000                       # requiere SECRETO_SERVICIO

# Web
cd ../web
npm install
npm run db:migrar && npm run db:cargar            # requiere DATABASE_URL y DATABASE_URL_UNPOOLED
npm run dev                                       # requiere URL_SERVICIO_CALCULO y SECRETO_SERVICIO
```

Abre `http://localhost:3000` (usa `localhost`, no `127.0.0.1`). Más detalles en [`web/README.md`](web/README.md) y [`servicio-calculo/README.md`](servicio-calculo/README.md).

## Pruebas

```bash
cd web && npm test && npm run lint && npm run build
cd servicio-calculo && pytest
```

## Variables de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `DATABASE_URL` | web | Conexión a Neon (agrupada) |
| `DATABASE_URL_UNPOOLED` | web (solo migrar y cargar) | Conexión directa a Neon |
| `URL_SERVICIO_CALCULO` | web | Dirección del servicio de cálculo |
| `SECRETO_SERVICIO` | web y servicio | Secreto compartido entre ambos |

## Autoría

Juan Mena. Construido con Claude Code y Codex bajo el flujo propuse → implementé → archivé de OpenSpec.
