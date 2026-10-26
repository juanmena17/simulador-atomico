# Evidencia: verificación de punta a punta de la API (tarea 4.2)

Servicio FastAPI real (uvicorn, puerto 8001), base PostgreSQL local aislada (`e2e_api`, migrada y vacía) y servidor de producción de Next.js (puerto 3100). Secreto de prueba falso.

```text
--- n=3 l=2 v=1 (primera: calcula y guarda)  [ya ejecutada antes]
HTTP/1.1 200 OK cache-control: public, max-age=31536000, immutable 
    cuerpo: (orbital completo, 37463 bytes)
--- versión no vigente (v=0)
HTTP/1.1 400 Bad Request cache-control: no-store 
    cuerpo: {"error":{"codigo":"version_no_vigente","mensaje":"La versión del algoritmo no está vigente. La versión vigente es 1."}}
--- sin versión
HTTP/1.1 400 Bad Request cache-control: no-store 
    cuerpo: {"error":{"codigo":"version_no_vigente","mensaje":"La versión del algoritmo no está vigente. La versión vigente es 1."}}
--- combinación inválida (n=1 l=1)
HTTP/1.1 400 Bad Request cache-control: no-store 
    cuerpo: {"error":{"codigo":"orbital_invalido","mensaje":"La combinación del orbital no es válida."}}
--- valor no entero (n=1.5)
HTTP/1.1 400 Bad Request cache-control: no-store 
    cuerpo: {"error":{"codigo":"orbital_invalido","mensaje":"La combinación del orbital no es válida."}}
llamadas al servicio tras los errores de validación (debe seguir en 1): 1
```

Con el servicio de cálculo APAGADO:
```text
--- orbital que falta (n=4 l=3) => 502
HTTP/1.1 502 Bad Gateway cache-control: no-store 
    cuerpo: {"error":{"codigo":"servicio_no_disponible","mensaje":"El servicio de cálculo no está disponible."}}
--- orbital ya guardado (n=3 l=2) sigue sirviéndose desde la base
HTTP/1.1 200 OK cache-control: public, max-age=31536000, immutable 
    cuerpo: (orbital completo)
```

Contenido teórico:
```text
Base vacía:        200, cache-control: public, max-age=60, s-maxage=60, stale-while-revalidate=300, cuerpo []
Tras db:cargar:    "Orbitales: 14 creados, 1 actualizados. Secciones: 3 creadas, 0 actualizadas."
                   200 con las mismas cabeceras de caché breve
```
El orden ascendente de las secciones y la igualdad de su contenido con los archivos de origen se verifican en las pruebas de integración (`web/src/test/api.integration.test.ts` y `carga.integration.test.ts`); esta evidencia manual solo comprueba el estado HTTP y las cabeceras.

Limpieza: servidores detenidos (puertos 3100 y 8001 libres) y base `e2e_api` eliminada.
