# Servicio de cálculo orbital

El servicio calcula los 15 orbitales hidrogenoides con `m = 0`, usando NumPy, SciPy y scikit-image.

## Instalación

Desde `servicio-calculo/` (Git Bash):

```bash
py -3.12 -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt -r requirements-dev.txt
```

## Pruebas y evidencia

```bash
./.venv/Scripts/python.exe -m pytest
./.venv/Scripts/python.exe scripts/generar_evidencia.py
```

## Uso

```bash
PYTHONPATH=src ./.venv/Scripts/python.exe -c "from orbitales import calcular_orbital; print(calcular_orbital(3, 2)['extension'])"
```

## Servicio HTTP local

Desde `servicio-calculo/`, ejecuta el servicio con un secreto de prueba:

```bash
SECRETO_SERVICIO=secreto-local-de-prueba ./.venv/Scripts/python.exe -m uvicorn app:app --port 8000
```

El servicio lee `SECRETO_SERVICIO` en cada petición. `SECRETO_SERVICIO_ANTERIOR` es opcional y permite aceptar temporalmente el secreto anterior durante una rotación.

```bash
curl "http://127.0.0.1:8000/orbital?n=3&l=2" -H "X-Servicio-Secreto: secreto-local-de-prueba"
```
