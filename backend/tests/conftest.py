"""Fixtures: sustituyen el cliente de Supabase real por el doble en memoria."""

import pytest
from fastapi.testclient import TestClient

import database
import dependencies.auth as dependencies_auth
import router.auth as router_auth
from main import app
from services import (
    auth_service,
    favoritos_service,
    juegos_service,
    reviews_service,
)
from tests.fake_supabase import FakeSupabase

# Módulos que hacen `from database import supabase`: hay que sustituir el
# nombre importado en cada uno de ellos.
MODULOS_CON_CLIENTE = (
    database,
    dependencies_auth,
    router_auth,
    auth_service,
    favoritos_service,
    juegos_service,
    reviews_service,
)


@pytest.fixture()
def fake_supabase(monkeypatch):
    fake = FakeSupabase()
    for modulo in MODULOS_CON_CLIENTE:
        monkeypatch.setattr(modulo, "supabase", fake)
    return fake


@pytest.fixture()
def client(fake_supabase):
    return TestClient(app)


@pytest.fixture()
def registrado(client):
    """Registra y devuelve credenciales + cabecera de autorización."""

    def _crear(
        nombre="Ana Gamer",
        edad=28,
        email="ana@xp.com",
        password="secreta123",
    ):
        res = client.post(
            "/auth/register",
            json={
                "nombre": nombre,
                "edad": edad,
                "email": email,
                "password": password,
            },
        )
        # Si la cuenta ya existe (helper invocado dos veces con los mismos
        # datos) seguimos adelante: solo necesitamos la sesión.
        assert res.status_code in (200, 400), res.text

        res = client.post("/auth/login", json={"email": email, "password": password})
        assert res.status_code == 200, res.text
        body = res.json()

        return {
            "headers": {"Authorization": f"Bearer {body['access_token']}"},
            "refresh_token": body["refresh_token"],
            "user": body["user"],
        }

    return _crear


def crear_juego(client, headers, **datos):
    """Helper: crea un juego con valores por defecto válidos."""
    payload = {
        "nombre": "Elden Ring",
        "genero": "RPG",
        "plataforma": "PS5",
        "horas_jugadas": 80,
        "estado": "completado",
        "porcentaje_completado": 100,
        "platinado": True,
    }
    payload.update(datos)
    res = client.post("/juegos/", json=payload, headers=headers)
    assert res.status_code == 200, res.text
    return res.json()["data"][0]
