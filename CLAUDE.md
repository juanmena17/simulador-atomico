# CLAUDE.md: Simulador atómico

## Identidad y contexto

Página web de escritorio para estudiantes de química y aficionados, que muestra en 3D la forma de los orbitales de un átomo hidrogenoide (m = 0, n hasta 5, 15 orbitales) y permite girarlos con el ratón. Resuelve que los modelos clásicos (Moller y Bohr) no explican el átomo real y que los diagramas estáticos no muestran la forma tridimensional del orbital.

Arquitectura (ver `docs/TECH-DESIGN-v2.md` y `adrs/`):

- **Página web:** Next.js con TypeScript, desplegada en Vercel, con visor 3D en canvas 2D. Es el único componente que accede a Neon (con Prisma) y el único que llama al servicio de cálculo.
- **Servicio de cálculo:** Python con FastAPI, en un segundo proyecto de Vercel. Reutiliza `physics.py` de `D:\DMC\Projects\visualAtoms` con NumPy, SciPy y scikit-image.
- **Base de datos:** PostgreSQL en Neon (orbitales calculados y contenido teórico).
- **Diseño de referencia:** `design/stitch/ultima_v4/code.html`.

## Reglas duras

- Leer `docs/PRD.md` completo antes de planificar o generar código.
- Si una solicitud cae fuera del alcance del PRD (sección "No alcance"), detenerse y preguntar si se debe modificar primero el PRD.
- Respetar `docs/TECH-DESIGN-v2.md` y los ADR. No contradecir una decisión sin plantearlo antes.
- Los ADR no se modifican: una decisión nueva se registra en un ADR nuevo que depreca al anterior. El Tech Design se versiona (`docs/TECH-DESIGN-v3.md`), sin sobrescribir la versión previa.
- No usar PyVista, matplotlib ni opencv en el servicio de cálculo, ni recursos externos en tiempo de ejecución (fuentes, estilos o scripts de terceros).
- Nunca crear, leer ni copiar archivos `.env` ni credenciales. Los secretos (Neon y el secreto compartido del servicio) van como variables de entorno en Vercel, no en el repositorio.
- No reescribir lo ya probado en `physics.py`; el módulo de cálculo nuevo lleva sus propias pruebas.

## Comandos del entorno

Las rutas de API requieren `URL_SERVICIO_CALCULO` y `SECRETO_SERVICIO`. En local: `URL_SERVICIO_CALCULO=http://127.0.0.1:8000` y el mismo secreto del servicio; no guardes el secreto en archivos del repositorio. Con `npm run dev`:

```bash
curl "http://localhost:3000/api/orbital?n=3&l=2&v=1"
curl "http://localhost:3000/api/contenido"
```

En `web/`:

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm run test:e2e   # Playwright (Edge); E2E_BASE_URL para probar el sitio desplegado
```

Base local y Prisma:

```bash
docker run --name simulador-atomico-pg -e POSTGRES_PASSWORD=contraseña-local -e POSTGRES_DB=simulador -p 5440:5432 -d postgres:17
export DATABASE_URL='postgresql://postgres:<contraseña-local>@localhost:5440/simulador'
export DATABASE_URL_UNPOOLED="$DATABASE_URL"
export DATABASE_URL_PRUEBAS="$DATABASE_URL"
npm run db:generar
npm run db:migrar
npm run db:migrar:dev
npm test
```

Para Neon, define `DATABASE_URL_UNPOOLED` de Neon en el entorno del terminal y ejecuta `npm run db:migrar`. No guardes ninguna de esas variables en archivos del repositorio.

Carga de datos (en este orden, desde el repositorio):

```bash
cd servicio-calculo
./.venv/Scripts/python.exe scripts/exportar_orbitales.py
cd ../web
npm test
npm run db:cargar
```

`npm run db:cargar` usa `DATABASE_URL` del entorno del terminal para la base local o Neon; nunca la guardes en un archivo. La carga no borra versiones antiguas del algoritmo.

En `servicio-calculo/`:

```bash
py -3.12 -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt -r requirements-dev.txt
./.venv/Scripts/python.exe -m pytest
./.venv/Scripts/python.exe scripts/generar_evidencia.py
SECRETO_SERVICIO=secreto-local-de-prueba ./.venv/Scripts/python.exe -m uvicorn app:app --port 8000
curl "http://127.0.0.1:8000/orbital?n=3&l=2" -H "X-Servicio-Secreto: secreto-local-de-prueba"
```

El servicio usa `SECRETO_SERVICIO` como secreto actual y `SECRETO_SERVICIO_ANTERIOR` como secreto anterior opcional durante una rotación.
