# Design

## Context

El módulo `orbitales` (`servicio-calculo/src/orbitales/`, `calcular_orbital(n, l)`) ya devuelve el resultado completo y tarda unos 0,2 s por orbital. El ADR 0015 fija FastAPI; el ADR 0010 fija el secreto compartido (con las mejoras S4: nombre de cabecera, comparación en tiempo constante y rotación con dos valores); el ADR 0003 define que solo la página lo llama, de servidor a servidor, y que los errores de validación llevan un código y un mensaje claros. La documentación de Vercel (verificada) indica que detecta FastAPI cuando figura en `requirements.txt` o `pyproject.toml`, que carga un archivo de entrada (`app.py`, `index.py`, `server.py`, `main.py`...) con la variable `app`, que usa Python 3.12 por defecto y que el paquete incluye todos los archivos alcanzables, sin eliminar los que no se usan. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Un servicio mínimo, seguro por defecto (falla cerrada) y fácil de probar sin red.
- Saber con datos si cabe en Vercel para Linux.

**Non-Goals:**
- Despliegue real, caché HTTP (la define la API de la página, ADR 0013), CORS (nadie lo llama desde un navegador) y cualquier estado o base de datos.

## Decisions

**D1. Archivo de entrada `servicio-calculo/app.py`.** Crea la aplicación FastAPI (variable `app`) y añade `src/` a la ruta de importación para encontrar el paquete `orbitales` sin instalarlo. Alternativa: instalar el paquete con `pyproject` (más limpio, pero depende de cómo Vercel instale el proyecto; se prefiere lo más simple y se confirma en el ítem #11).

**D2. Una sola consulta: `GET /orbital?n=..&l=..`.** Sin otros puntos de entrada (el ADR 0003 dice "cálculo de orbital" como única operación). No se añade una consulta de salud para no ampliar la superficie; el despliegue se comprobará pidiendo un orbital.

**D3. Secreto en la cabecera `X-Servicio-Secreto`.** El valor actual se lee de la variable de entorno `SECRETO_SERVICIO` y el anterior, opcional, de `SECRETO_SERVICIO_ANTERIOR`. Se leen en cada petición (no al importar) para poder probar y rotar sin reiniciar. La comparación usa `hmac.compare_digest`. Sin variable actual (o vacía), el servicio falla cerrado con 503. El orden de las comprobaciones es: secreto configurado → autorización → validación de entrada → cálculo, para que un extraño no pueda distinguir entradas válidas de inválidas.

**D4. Formato de error único.** `{"error": {"codigo": "...", "mensaje": "..."}}` con los códigos `no_autorizado` (401), `servicio_sin_secreto` (503), `orbital_invalido` (400) y `error_interno` (500). Los mensajes de `orbital_invalido` reutilizan el de `OrbitalInvalidoError`; el de `error_interno` es genérico. Un manejador general captura cualquier excepción inesperada. Los errores de validación propios de FastAPI (422) se evitan declarando los parámetros como texto y convirtiéndolos con la validación del dominio (así "1.5" o "abc" producen `orbital_invalido`).

**D5. Archivos del paquete.** Python no elimina archivos no usados del paquete, por lo que se añade `.vercelignore` (`.venv`, `tests`, `scripts`, `.pytest_cache`, `__pycache__`) y un `vercel.json` con `excludeFiles` equivalente. Sin esto el entorno virtual local podría entrar en el paquete y superar el límite.

**D6. Verificación del tamaño para Linux.** Sin acceso a Linux, se descargan las ruedas (`pip download --only-binary=:all:`) para la plataforma `manylinux2014_x86_64`, Python 3.12 y CPython, a partir de `requirements.txt`, y se suman los tamaños descomprimidos de sus contenidos. Es una medida de las dependencias, no del paquete completo de Vercel, pero es la parte dominante. Se guarda la tabla en la evidencia.

**D7. Pruebas.** Con el cliente de pruebas de FastAPI y variables de entorno controladas por prueba: consulta válida (compara con `calcular_orbital`), sin secreto, secreto incorrecto, rotación (anterior aceptado y retirado rechazado), falla cerrada, entrada inválida (l incompatible, falta l, n no entero), método no permitido, fallo interno simulado (sin trazas) y que el secreto no aparece en ninguna respuesta de error. Además, una ejecución real con uvicorn y peticiones HTTP.

## Risks / Trade-offs

- **Importación con `sys.path`** → es menos limpia que un paquete instalado; el ítem #11 confirma que Vercel la acepta y, si no, se pasa a la instalación como paquete.
- **Arranque en frío** → la importación de SciPy y scikit-image tarda más de 1 s; el primer orbital tras inactividad será lento. Está cubierto por el criterio de 5 s y el indicador de carga del PRD; se mide en el ítem #11.
- **El tamaño medido es de las dependencias**, no del paquete completo de Vercel → el margen del 20 % (400 MB frente a 500 MB) lo cubre.
- **El secreto vive en variables de entorno de Vercel** → su gestión es manual (ADR 0010).

## Open Questions

- Ninguna que cambie las specs, el enfoque o las tareas.
