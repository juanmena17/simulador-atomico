import pytest

from orbitales.dominio import OrbitalInvalidoError, validar_orbital


@pytest.mark.parametrize("n", range(1, 6))
def test_combinaciones_validas(n):
    for l in range(n):
        assert validar_orbital(n, l) == (n, l, 0)


@pytest.mark.parametrize("n,l", [(1, 1), (0, 0), (6, 0), (2, -1)])
def test_rango_invalido(n, l):
    with pytest.raises(OrbitalInvalidoError, match=r"[nl]"):
        validar_orbital(n, l)


@pytest.mark.parametrize("n,l", [(True, 0), (1, False), (1.0, 0), (1, 0.0), (None, 0)])
def test_tipo_invalido(n, l):
    with pytest.raises(OrbitalInvalidoError, match=r"[nl]"):
        validar_orbital(n, l)
