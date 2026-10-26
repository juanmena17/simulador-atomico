import numpy as np
import pytest
from scipy.integrate import simpson
from scipy.special import roots_legendre

from orbitales.fisica import (
    cumulative_isovalue,
    density,
    density_cylindrical,
    psi,
    radial,
    radial_extent,
)


# La malla radial uniforme captura la cola hasta r=300; la angular usa
# 160 puntos de Gauss-Legendre en x=cos(theta), exactos para la parte
# polinómica y muy precisos tras el factor exponencial radial separado.
R = np.linspace(0.0, 300.0, 30001)
X, WX = roots_legendre(160)
THETA = np.arccos(X)


ORBITALS = [(1, 0, 0), (2, 1, 0), (2, 1, 1), (3, 2, 0),
            (3, 2, 2), (4, 3, 1), (5, 4, 4), (5, 0, 0)]


@pytest.mark.parametrize("n,l,m", ORBITALS)
def test_normalization(n, l, m):
    values = density(n, l, m, R[:, None], THETA[None, :])
    angular_radial = np.sum(values * WX[None, :], axis=1)
    integral = 2.0 * np.pi * simpson(angular_radial * R**2, x=R)
    assert abs(integral - 1.0) < 1e-3


def test_1s_analytical():
    r = np.array([0.0, 0.1, 0.7, 1.5, 3.0, 8.0])
    actual = psi(1, 0, 0, r, 0.37, -1.2)
    expected = np.exp(-r) / np.sqrt(np.pi)
    np.testing.assert_allclose(actual, expected, rtol=1e-10, atol=1e-12)


@pytest.mark.parametrize("a,b", [((3, 1, 0), (3, 2, 0)),
                                  ((3, 2, 1), (3, 2, -1)),
                                  ((4, 2, 1), (4, 3, 1))])
def test_orthogonality(a, b):
    # La integral azimutal se evalúa con 128 puntos trapezoidales periódicos.
    phi = np.linspace(0.0, 2.0 * np.pi, 128, endpoint=False)
    radial_overlap = simpson(radial(a[0], a[1], R) * radial(b[0], b[1], R) * R**2, x=R)
    angular_a = psi(a[0], a[1], a[2], 1.0, THETA, 0.0)
    angular_b = psi(b[0], b[1], b[2], 1.0, THETA, 0.0)
    angular_overlap = np.sum(np.conj(angular_a) * angular_b * WX)
    azimuthal_overlap = np.mean(np.exp(1j * (b[2] - a[2]) * phi))
    integral = 2.0 * np.pi * radial_overlap * angular_overlap * azimuthal_overlap
    assert abs(integral) < 1e-3


@pytest.mark.parametrize("n,l", [(3, 0), (3, 1), (4, 1), (5, 2)])
def test_radial_nodes(n, l):
    r = np.linspace(1e-8, 300.0, 100001)
    values = radial(n, l, r)
    changes = np.count_nonzero(values[:-1] * values[1:] < 0.0)
    assert changes == n - l - 1


def test_density_symmetries_and_cylindrical_conversion():
    rng = np.random.default_rng(1234)
    r = rng.uniform(0.0, 10.0, 100)
    theta = rng.uniform(0.0, np.pi, 100)
    phi_a = rng.uniform(0.0, 2.0 * np.pi, 100)
    phi_b = rng.uniform(0.0, 2.0 * np.pi, 100)
    np.testing.assert_allclose(density(3, 2, 1, r, theta),
                               density(3, 2, -1, r, theta), rtol=1e-13)
    # La densidad no depende de phi; se comprueba mediante |psi|^2.
    np.testing.assert_allclose(np.abs(psi(3, 2, 1, r, theta, phi_a))**2,
                               density(3, 2, 1, r, theta), rtol=1e-13)
    rho = rng.uniform(0.0, 10.0, 100)
    z = rng.uniform(-10.0, 10.0, 100)
    rr = np.hypot(rho, z)
    tt = np.arctan2(rho, z)
    np.testing.assert_allclose(density_cylindrical(3, 2, 1, rho, z),
                               density(3, 2, 1, rr, tt), rtol=1e-13)


@pytest.mark.parametrize("orbital,fraction", [((1, 0, 0), 0.50),
                                                ((3, 2, 0), 0.80),
                                                ((5, 4, 4), 0.90)])
def test_cumulative_isovalue(orbital, fraction):
    n, l, m = orbital
    grid = 180
    threshold = cumulative_isovalue(n, l, m, fraction, grid=grid)
    extent = radial_extent(n, l, fraction=0.999999)
    dr, dz = extent / grid, 2.0 * extent / grid
    rho = (np.arange(grid) + 0.5) * dr
    z = -extent + (np.arange(grid) + 0.5) * dz
    rr, zz = np.meshgrid(rho, z, indexing="ij")
    values = density_cylindrical(n, l, m, rr, zz)
    weights = 2.0 * np.pi * rr * dr * dz
    # Fracción de PROBABILIDAD (densidad * volumen), no de volumen.
    prob = values * weights
    mass = prob[values >= threshold].sum() / prob.sum()
    assert abs(mass - fraction) < 1e-2


@pytest.mark.parametrize("args", [(0, 0, 0), (2, 2, 0), (2, 1, 2),
                                   (2, 1, -2), (1, 0, 1)])
def test_invalid_quantum_numbers(args):
    with pytest.raises(ValueError, match="n|l|m"):
        density(*args, 1.0, 0.5)
