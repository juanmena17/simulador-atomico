import json
from pathlib import Path


RAIZ = Path(__file__).resolve().parents[1]
EXCLUSIONES = (".venv", "tests", "scripts", ".pytest_cache", "__pycache__")


def test_archivos_de_despliegue_y_exclusiones():
    vercelignore = (RAIZ / ".vercelignore").read_text(encoding="utf-8")
    configuracion = json.loads((RAIZ / "vercel.json").read_text(encoding="utf-8"))
    exclusion_vercel = configuracion["functions"]["app.py"]["excludeFiles"]
    for exclusion in EXCLUSIONES:
        assert exclusion in vercelignore
        assert exclusion in exclusion_vercel
