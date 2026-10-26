import hashlib
import json
import tempfile
from pathlib import Path

from orbitales.calculo import VERSION_ALGORITMO, calcular_orbital


RAIZ = Path(__file__).resolve().parents[2]
RUTA = RAIZ / "web" / "datos" / "orbitales.json"


def test_origen_coincide_con_el_calculo():
    if not RUTA.is_file():
        raise AssertionError("regenera web/datos/orbitales.json con scripts/exportar_orbitales.py")
    contenido = json.loads(RUTA.read_text(encoding="utf-8"))
    esperado = [calcular_orbital(n, l) for n in range(1, 6) for l in range(n)]
    if contenido.get("version") != VERSION_ALGORITMO or contenido.get("orbitales") != esperado:
        raise AssertionError("regenera web/datos/orbitales.json con scripts/exportar_orbitales.py")


def test_exportacion_determinista():
    from scripts.exportar_orbitales import exportar

    with tempfile.TemporaryDirectory() as carpeta:
        primera = Path(carpeta) / "primera.json"
        segunda = Path(carpeta) / "segunda.json"
        exportar(primera)
        exportar(segunda)
        assert hashlib.sha256(primera.read_bytes()).hexdigest() == hashlib.sha256(segunda.read_bytes()).hexdigest()
