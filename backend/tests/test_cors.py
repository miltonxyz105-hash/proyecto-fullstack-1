"""CORS: orígenes dinámicos desde ALLOWED_ORIGINS (producción + previews)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from config import Settings, _glob_a_regex
from main import app as app_real


def _settings(origins: str) -> Settings:
    return Settings(_env_file=None, allowed_origins=origins)


def _app_con(origins: str) -> FastAPI:
    """Réplica del middleware configurado en main.py con esos orígenes."""
    settings = _settings(origins)
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_origin_regex=settings.allowed_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/ping")
    def ping():
        return {"ok": True}

    return app


def _acepta_origen(app: FastAPI, origen: str) -> bool:
    res = TestClient(app).get(
        "/ping", headers={"Origin": origen, "Access-Control-Request-Method": "GET"}
    )
    return res.headers.get("access-control-allow-origin") == origen


# ============================================================
# Parsing de la variable
# ============================================================
def test_separa_origenes_exactos_de_los_con_comodin():
    settings = _settings("https://app.ejemplo.com,https://*.vercel.app,http://localhost:5173")

    assert settings.allowed_origins_list == [
        "https://app.ejemplo.com",
        "http://localhost:5173",
    ]
    assert settings.allowed_origin_regex == r"^(?:https://[^./]+\.vercel\.app)$"


def test_sin_comodines_no_genera_regex():
    settings = _settings("https://app.ejemplo.com,http://localhost:5173")
    assert settings.allowed_origin_regex is None


def test_variables_vacias_usan_el_default():
    settings = Settings(_env_file=None, allowed_origins="", cors_origins="")

    assert "http://localhost:5173" in settings.allowed_origins_list
    assert "https://proyecto-fullstack-1.vercel.app" in settings.allowed_origins_list
    # El comodín de Vercel del default va a la regex, no a la lista exacta.
    assert settings.allowed_origin_regex is not None
    assert "vercel" in settings.allowed_origin_regex


def test_alias_cors_origins_sigue_funcionando():
    settings = Settings(_env_file=None, allowed_origins="", cors_origins="https://legacy.app")
    assert settings.allowed_origins_list == ["https://legacy.app"]


def test_el_comodin_no_cruza_puntos():
    """`https://*.vercel.app` no debe permitir `https://vercel.app.evil.com`."""
    assert _glob_a_regex("https://*.vercel.app") == r"https://[^./]+\.vercel\.app"
    assert not re_match("https://evil.com#.vercel.app")
    assert not re_match("https://sub.dominio.vercel.app.evil.com")


def re_match(origen: str) -> bool:
    import re

    return bool(re.match(r"^(?:https://[^./]+\.vercel\.app)$", origen))


# ============================================================
# Comportamiento real del middleware
# ============================================================
def test_permite_previews_de_vercel():
    app = _app_con("https://*.vercel.app,https://app.ejemplo.com")

    assert _acepta_origen(app, "https://proyecto-abc123-usuario.vercel.app")
    assert _acepta_origen(app, "https://mi-app.vercel.app")
    assert _acepta_origen(app, "https://app.ejemplo.com")


def test_bloquea_origenes_no_autorizados():
    app = _app_con("https://*.vercel.app,https://app.ejemplo.com")

    assert not _acepta_origen(app, "https://evil.com")
    assert not _acepta_origen(app, "https://evil.com.vercel.app.evil.net")
    assert not _acepta_origen(app, "http://localhost:5173")


def test_app_real_permite_localhost():
    """La app importada usa ALLOWED_ORIGINS del entorno de los tests."""
    res = TestClient(app_real).get(
        "/health", headers={"Origin": "http://localhost:5173"}
    )
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"
