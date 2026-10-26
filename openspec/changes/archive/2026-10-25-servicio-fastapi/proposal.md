# Proposal

## Why

El módulo de cálculo de orbitales (ítem #2) ya existe y está probado, pero no se puede consumir desde la página: falta el servicio HTTP interno que la API de la página (ítem #6) llamará de servidor a servidor. El ADR 0015 eligió FastAPI y el ADR 0010 exige que solo la página pueda usar el servicio, mediante un secreto compartido. Además, los límites de Vercel para funciones de Python (500 MB sin comprimir) todavía no se han comprobado para Linux; el backlog pide verificarlo en este ítem.

## What Changes

- Se añade a `servicio-calculo/` una aplicación FastAPI con una única consulta de orbital (n y l) que devuelve el resultado del módulo de cálculo.
- Cada consulta exige un secreto compartido en una cabecera; el servicio rechaza las que no lo llevan o lo llevan incorrecto, admite un secreto anterior para poder rotarlo y, si no hay ningún secreto configurado, rechaza todo.
- Las respuestas de error tienen un formato único con código y mensaje claros, sin revelar detalles internos ni el secreto.
- Se prepara el proyecto para desplegarse en Vercel (archivo de entrada de la aplicación y exclusión de archivos innecesarios del paquete).
- Se mide el tamaño real de las dependencias de ejecución para Linux y Python 3.12 y se compara con el límite de Vercel.

## Capabilities

### New Capabilities

- `orbital-service`: consulta HTTP interna que entrega el orbital calculado a quien presente el secreto compartido, con errores claros y sin exponer datos a terceros.

### Modified Capabilities

(ninguna: `orbital-computation` no cambia)

## Impact

- **Código nuevo:** `servicio-calculo/app.py` y sus pruebas, `.vercelignore`, configuración de Vercel y evidencias; no se modifican `web/` ni el módulo `orbitales`.
- **Dependencias nuevas:** FastAPI en ejecución; httpx (cliente de pruebas) y uvicorn (ejecución local) en desarrollo.
- **Fuera de alcance:** el despliegue en Vercel (ítem #11), la API de la página y su caché (ítem #6), la base de datos (ítems #4 y #5) y la política de reintentos del navegador (ítem #9).
- **Referencias:** ADR 0003, 0010, 0011, 0013, 0015 y 0020; `docs/TECH-DESIGN-v2.md` (riesgos de límites de Vercel).
