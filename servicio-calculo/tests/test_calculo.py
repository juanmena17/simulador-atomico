import hashlib
import json

import pytest

from orbitales import PARAMETROS_ALGORITMO, VERSION_ALGORITMO, calcular_orbital
from orbitales.formato import decodificar


def test_estructura_json_y_determinismo():
    primero = calcular_orbital(3, 2)
    segundo = calcular_orbital(3, 2)
    assert json.dumps(primero, separators=(",", ":")) == json.dumps(segundo, separators=(",", ":"))
    assert primero["n"] == 3 and primero["l"] == 2 and primero["version"] == VERSION_ALGORITMO
    assert isinstance(primero["extension"], float)
    assert all(set(primero[nucleo]) == {"p", "l"} for nucleo in ("envolvente", "nucleo"))
    json.dumps(primero)


def test_huella_parametros():
    serializado = json.dumps(PARAMETROS_ALGORITMO, sort_keys=True, separators=(",", ":")).encode()
    huella = hashlib.sha256(serializado).hexdigest()
    assert VERSION_ALGORITMO == "1", "actualiza VERSION_ALGORITMO al cambiar parámetros"
    assert huella == "61f20bea4d034dcb0824d6ed4407538a752be0e2405d1c94d98e4dffb3f6718e", (
        "cambiaron los parámetros del algoritmo: actualiza VERSION_ALGORITMO y la huella literal"
    )


@pytest.mark.parametrize("n,l", [(1, 0), (2, 0), (2, 1), (3, 0), (3, 1), (3, 2), (4, 0), (4, 1), (4, 2), (4, 3), (5, 0), (5, 1), (5, 2), (5, 3), (5, 4)])
def test_longitudes_decodificadas(n, l):
    resultado = calcular_orbital(n, l)
    for nombre in ("envolvente", "nucleo"):
        curvas = decodificar(resultado[nombre], resultado["extension"])
        assert sum(resultado[nombre]["l"]) == sum(map(len, curvas))
