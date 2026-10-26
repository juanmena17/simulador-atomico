import numpy as np
import pytest
from scipy.integrate import simpson
from scipy.special import lpmv, roots_legendre

from orbitales import fisica
from orbitales.anillos import (
    FRACCION_ENVOLVENTE, FRACCION_NUCLEO, N_MALLA,
    N_REBANADAS_ENVOLVENTE, N_REBANADAS_NUCLEO, anillos, malla_densidad,
    umbral, loops_for,
)

ORBITALES = [(n, l) for n in range(1, 6) for l in range(n)]


@pytest.mark.parametrize("n,l", ORBITALES)
def test_normalizacion_analitica_y_nodos(n, l):
    # La malla de anillos está limitada al radio 98,5 %; la normalización se
    # verifica con cuadratura radial hasta 300 y Gauss-Legendre angular.
    r = np.linspace(0.0, 300.0, 30001)
    x, w = roots_legendre(160)
    theta = np.arccos(x)
    dens = fisica.density(n, l, 0, r[:, None], theta[None, :])
    integral = 2 * np.pi * simpson(np.sum(dens * w[None, :], axis=1) * r**2, x=r)
    assert abs(integral - 1) <= 0.005
    radial = fisica.radial(n, l, np.linspace(1e-8, 300, 100001))
    assert np.count_nonzero(radial[:-1] * radial[1:] < 0) == n - l - 1
    theta = np.linspace(1e-8, np.pi - 1e-8, 100001)
    angular = lpmv(0, l, np.cos(theta))
    assert np.count_nonzero(np.diff(np.signbit(angular))) == l


def test_parametros_fijos_y_umbral():
    assert (N_MALLA, N_REBANADAS_ENVOLVENTE, N_REBANADAS_NUCLEO) == (110, 44, 22)
    assert (FRACCION_ENVOLVENTE, FRACCION_NUCLEO) == (0.90, 0.12)
    extent, eje, dens = malla_densidad(1, 0)
    assert umbral(dens, (eje[1] - eje[0]) ** 3, 0.9) > 0


@pytest.mark.parametrize("n,l", ORBITALES)
def test_circunferencias(n, l):
    extent, eje, dens = malla_densidad(n, l)
    dv = (eje[1] - eje[0]) ** 3
    celda = 2 * extent / (N_MALLA - 1)
    tolerancia = max(0.02, 1.5 * celda)
    for frac, count in [(FRACCION_ENVOLVENTE, N_REBANADAS_ENVOLVENTE), (FRACCION_NUCLEO, N_REBANADAS_NUCLEO)]:
        curvas = loops_for(dens, eje, umbral(dens, dv, frac), count)
        for curva in curvas:
            rho = np.hypot(curva[:, 0], curva[:, 1])
            assert np.ptp(rho) <= max(0.02 * np.mean(rho), tolerancia)


@pytest.mark.parametrize("n,l", ORBITALES)
def test_anillos_sin_valores_invalidos_ni_segmentos_nulos(n, l):
    _, envolvente, nucleo = anillos(n, l)
    for curva in envolvente + nucleo:
        assert np.isfinite(curva).all()
        assert np.all(np.linalg.norm(np.diff(curva, axis=0), axis=1) > 0)
