# Tasks

## 1. Dependencias

- [x] 1.1 Añadir `fastapi` a `servicio-calculo/requirements.txt` y `httpx` y `uvicorn` a `requirements-dev.txt`, instalarlos en el entorno virtual de Python 3.12 y verificar que `import fastapi, httpx, uvicorn` funciona y que las 107 pruebas existentes siguen pasando

## 2. Aplicación

- [x] 2.1 Crear `servicio-calculo/app.py` con la consulta `GET /orbital` (parámetros n y l como texto, conversión con la validación del dominio), el formato único de error y el manejador de errores inesperados; verificar con pruebas que una consulta válida devuelve el mismo resultado que `calcular_orbital`, que n o l inválidos, faltantes o no enteros dan `orbital_invalido` (400) y que otro método da 405
- [x] 2.2 Añadir la autorización por la cabecera `X-Servicio-Secreto` con `SECRETO_SERVICIO` y `SECRETO_SERVICIO_ANTERIOR`, comparación en tiempo constante y falla cerrada (503 `servicio_sin_secreto`) sin secreto configurado; verificar con pruebas sin secreto, secreto incorrecto, rotación (anterior aceptado y retirado rechazado), falla cerrada, orden de comprobaciones (una entrada inválida sin secreto da 401) y que el secreto no aparece en ninguna respuesta de error ni en una traza
- [x] 2.3 Crear `.vercelignore` y `vercel.json` con `excludeFiles` para dejar fuera `.venv`, `tests`, `scripts`, `.pytest_cache` y `__pycache__`; verificar con una prueba que los archivos de configuración existen y listan esas exclusiones

## 3. Verificación

- [x] 3.1 Ejecutar el servicio con uvicorn en local con un secreto de prueba y verificar con peticiones HTTP reales un 200 con el secreto correcto, un 401 sin secreto, un 400 con una combinación inválida y un 503 sin secreto configurado
- [x] 3.2 Medir el tamaño descomprimido de las dependencias de ejecución para Linux x86_64 y Python 3.12 descargando las ruedas, guardar la tabla en `openspec/changes/servicio-fastapi/evidencia/dependencias-linux.md` y verificar que el total es de a lo sumo 400 MB
- [x] 3.3 Actualizar `servicio-calculo/README.md` y la sección "Comandos del entorno" de `CLAUDE.md` con el comando para ejecutar el servicio en local, las variables de entorno y un ejemplo de petición, y verificar que cada comando documentado funciona tal como está escrito
- [x] 3.4 Ejecutar todas las pruebas de `servicio-calculo/` y verificar que pasan

## Workflow follow-up

- Archivar el cambio cuando se hayan cumplido los requisitos de revisión del proyecto.
- Verificar el resultado archivado, incluida la capacidad `orbital-service` en `openspec/specs/`.
