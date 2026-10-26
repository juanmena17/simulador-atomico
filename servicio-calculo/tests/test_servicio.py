import os

from fastapi.testclient import TestClient

import app as modulo_app
from orbitales import calcular_orbital


def cliente():
    return TestClient(modulo_app.app, raise_server_exceptions=False)


def error(respuesta, codigo, estado):
    assert respuesta.status_code == estado
    assert respuesta.json()["error"]["codigo"] == codigo


def test_consulta_valida(monkeypatch):
    monkeypatch.setenv("SECRETO_SERVICIO", "secreto-de-prueba")
    respuesta = cliente().get(
        "/orbital?n=3&l=2", headers={"X-Servicio-Secreto": "secreto-de-prueba"}
    )
    assert respuesta.status_code == 200
    assert respuesta.json() == calcular_orbital(3, 2)


def test_entradas_invalidas(monkeypatch):
    monkeypatch.setenv("SECRETO_SERVICIO", "secreto-de-prueba")
    cabeceras = {"X-Servicio-Secreto": "secreto-de-prueba"}
    for ruta in ("/orbital?n=1&l=1", "/orbital?n=1", "/orbital?n=1.5&l=0", "/orbital?n=abc&l=0"):
        error(cliente().get(ruta, headers=cabeceras), "orbital_invalido", 400)


def test_ruta_y_metodo_no_permitidos(monkeypatch):
    monkeypatch.setenv("SECRETO_SERVICIO", "secreto-de-prueba")
    error(cliente().post("/orbital"), "metodo_no_permitido", 405)
    error(cliente().get("/inexistente"), "no_encontrado", 404)


def test_fallo_interno_no_revela_detalles(monkeypatch):
    monkeypatch.setenv("SECRETO_SERVICIO", "secreto-de-prueba")

    def fallar(n, l):
        raise RuntimeError("detalle secreto C:\\ruta\\privada")

    monkeypatch.setattr(modulo_app, "calcular_orbital", fallar)
    respuesta = cliente().get(
        "/orbital?n=3&l=2", headers={"X-Servicio-Secreto": "secreto-de-prueba"}
    )
    error(respuesta, "error_interno", 500)
    assert "detalle secreto" not in respuesta.text
    assert "Traceback" not in respuesta.text
    assert "C:\\ruta\\privada" not in respuesta.text


def test_autorizacion_y_rotacion(monkeypatch):
    monkeypatch.setenv("SECRETO_SERVICIO", "actual-falso")
    monkeypatch.setenv("SECRETO_SERVICIO_ANTERIOR", "anterior-falso")
    assert cliente().get("/orbital?n=3&l=2", headers={"X-Servicio-Secreto": "anterior-falso"}).status_code == 200
    error(cliente().get("/orbital?n=3&l=2"), "no_autorizado", 401)
    error(cliente().get("/orbital?n=3&l=2", headers={"X-Servicio-Secreto": "tercero-falso"}), "no_autorizado", 401)
    monkeypatch.setenv("SECRETO_SERVICIO_ANTERIOR", "")
    error(cliente().get("/orbital?n=3&l=2", headers={"X-Servicio-Secreto": "anterior-falso"}), "no_autorizado", 401)


def test_falla_cerrada_y_orden(monkeypatch):
    monkeypatch.delenv("SECRETO_SERVICIO", raising=False)
    monkeypatch.delenv("SECRETO_SERVICIO_ANTERIOR", raising=False)
    for cabeceras in ({}, {"X-Servicio-Secreto": "secreto-falso"}):
        error(cliente().get("/orbital?n=1&l=1", headers=cabeceras), "servicio_sin_secreto", 503)
    monkeypatch.setenv("SECRETO_SERVICIO", "actual-falso")
    error(cliente().get("/orbital?n=1&l=1"), "no_autorizado", 401)


def test_secretos_no_aparecen_en_errores(monkeypatch):
    secreto = "secreto-configurado-falso"
    enviado = "secreto-enviado-falso"
    monkeypatch.setenv("SECRETO_SERVICIO", secreto)
    respuestas = [
        cliente().get("/orbital?n=3&l=2", headers={"X-Servicio-Secreto": enviado}),
        cliente().get("/orbital?n=1&l=1", headers={"X-Servicio-Secreto": secreto}),
    ]
    monkeypatch.setattr(modulo_app, "calcular_orbital", lambda n, l: (_ for _ in ()).throw(RuntimeError("fallo")))
    respuestas.append(cliente().get("/orbital?n=3&l=2", headers={"X-Servicio-Secreto": secreto}))
    monkeypatch.delenv("SECRETO_SERVICIO")
    respuestas.append(cliente().get("/orbital?n=3&l=2", headers={"X-Servicio-Secreto": enviado}))
    for respuesta in respuestas:
        assert secreto not in respuesta.text
        assert enviado not in respuesta.text
