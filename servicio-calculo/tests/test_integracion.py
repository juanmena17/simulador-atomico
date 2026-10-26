import json
import os
import subprocess
import sys
import time

import pytest

from orbitales import calcular_orbital

ORBITALES = [(n, l) for n in range(1, 6) for l in range(n)]


def test_tamano_maximo():
    for orbital in ORBITALES:
        assert len(json.dumps(calcular_orbital(*orbital)).encode()) <= 150 * 1024


def test_tiempo_maximo():
    calcular_orbital(3, 2)
    for orbital in ORBITALES:
        inicio = time.perf_counter()
        calcular_orbital(*orbital)
        assert time.perf_counter() - inicio < 2


def test_dependencias_graficas_no_importadas():
    codigo = "import sys; from orbitales import calcular_orbital; calcular_orbital(3, 2); print([m for m in ('pyvista','matplotlib','cv2','vtk') if m in sys.modules])"
    entorno = dict(os.environ)
    entorno["PYTHONPATH"] = os.path.abspath("src")
    resultado = subprocess.run([sys.executable, "-c", codigo], capture_output=True, text=True, check=True, env=entorno)
    assert resultado.stdout.strip() == "[]"
