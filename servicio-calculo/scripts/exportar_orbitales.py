"""Exporta los orbitales calculados al origen versionado de la web."""

from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "servicio-calculo" / "src"))

from orbitales.calculo import VERSION_ALGORITMO, calcular_orbital  # noqa: E402


def exportar(ruta: Path = RAIZ / "web" / "datos" / "orbitales.json") -> None:
    orbitales = [calcular_orbital(n, l) for n in range(1, 6) for l in range(n)]
    contenido = {"version": VERSION_ALGORITMO, "orbitales": orbitales}
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(
        json.dumps(contenido, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    exportar()
