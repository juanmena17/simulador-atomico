"""Genera las tablas de integración y tamaños del venv.

Ejecutar desde servicio-calculo/ con .venv/Scripts/python.exe.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SERVICE = ROOT / "servicio-calculo"
EVIDENCIA = ROOT / "openspec" / "changes" / "modulo-calculo-orbitales" / "evidencia"
sys.path.insert(0, str(SERVICE / "src"))

from orbitales import calcular_orbital  # noqa: E402


def bytes_de(ruta: Path) -> int:
    return sum(archivo.stat().st_size for archivo in ruta.rglob("*") if archivo.is_file())


def main():
    orbitales = [(n, l) for n in range(1, 6) for l in range(n)]
    calcular_orbital(3, 2)
    filas = []
    for n, l in orbitales:
        inicio = time.perf_counter()
        resultado = calcular_orbital(n, l)
        segundos = time.perf_counter() - inicio
        filas.append(
            (n, l, len(resultado["envolvente"]["l"]), len(resultado["nucleo"]["l"]),
             sum(resultado["envolvente"]["l"]) + sum(resultado["nucleo"]["l"]),
             len(json.dumps(resultado).encode()) / 1024, segundos)
        )
    tabla = [
        "# Evidencia de integración",
        "",
        "| n | l | anillos envolvente | anillos núcleo | puntos | tamaño (KB) | tiempo (s) |",
        "|---:|---:|---:|---:|---:|---:|---:|",
    ]
    tabla += ["| %d | %d | %d | %d | %d | %.2f | %.4f |" % fila for fila in filas]
    (EVIDENCIA / "orbitales.md").write_text("\n".join(tabla) + "\n", encoding="utf-8")

    site = SERVICE / ".venv" / "Lib" / "site-packages"
    paquetes = {
        "numpy": [site / "numpy", site / "numpy.libs"],
        "scipy": [site / "scipy", site / "scipy.libs"],
        "scikit-image": [site / "skimage"],
    }
    lineas = ["# Evidencia de dependencias", "", "Tamaños calculados sumando archivos de `site-packages`.", "", "| dependencia | tamaño (MB) |", "|---|---:|"]
    for nombre, rutas in paquetes.items():
        lineas.append("| %s | %.2f |" % (nombre, sum(bytes_de(ruta) for ruta in rutas if ruta.exists()) / 1024**2))
    lineas += ["", "| total site-packages | %.2f |" % (bytes_de(site) / 1024**2)]
    (EVIDENCIA / "dependencias.md").write_text("\n".join(lineas) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
