"""Configuración centralizada de la API.

Todas las variables sensibles viven SOLO aquí (lado servidor).
Ninguna de estas variables puede exponerse al frontend: las variables
que llegan al navegador deben llevar obligatoriamente el prefijo VITE_.
"""

import re
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

# Orígenes por defecto cuando no se define ALLOWED_ORIGINS.
# `https://*.vercel.app` cubre el dominio de producción y los previews
# (https://proyecto-xxxxxx-usuario.vercel.app) de Vercel.
DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:5173,"
    "http://localhost:5174,"
    "https://proyecto-fullstack-1.vercel.app,"
    "https://*.vercel.app"
)


def _glob_a_regex(origen: str) -> str:
    """Convierte un patrón con comodín en expresión regular segura.

    `https://*.vercel.app` -> `https://[^./]+\.vercel\.app`
    El `*` no cruza puntos: no se puede alcanzar `evil.com` añadiendo
    sufijos al host.
    """
    return re.escape(origen).replace(r"\*", r"[^./]+")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "XP Legacy API"

    # --- Núcleo (obligatorio) ---
    supabase_url: str = ""
    supabase_key: str = ""

    # --- Orígenes CORS permitidos, separados por coma ---
    # Admite comodines: ALLOWED_ORIGINS=https://*.vercel.app,https://app.ejemplo.com
    allowed_origins: str = ""
    # Alias heredado: seguirá funcionando hasta eliminarlo.
    cors_origins: str = ""

    # --- Integración IGDB / Twitch (Fase 3) ---
    # Opcionales: la app arranca sin ellas. SOLO backend, nunca VITE_*.
    twitch_client_id: str = ""
    twitch_client_secret: str = ""

    @property
    def _origenes_raw(self) -> str:
        return (
            self.allowed_origins
            or self.cors_origins
            or DEFAULT_ALLOWED_ORIGINS
        )

    @property
    def allowed_origins_list(self) -> list[str]:
        """Orígenes exactos (sin comodín) para `allow_origins`."""
        return [
            o.strip()
            for o in self._origenes_raw.split(",")
            if o.strip() and "*" not in o
        ]

    @property
    def allowed_origin_regex(self) -> str | None:
        """Patrones con comodín, como regex anclada, para `allow_origin_regex`."""
        patrones = [
            o.strip()
            for o in self._origenes_raw.split(",")
            if o.strip() and "*" in o
        ]
        if not patrones:
            return None
        return "^(?:" + "|".join(_glob_a_regex(p) for p in patrones) + ")$"

    # --- Compatibilidad con el nombre anterior ---
    @property
    def cors_origins_list(self) -> list[str]:
        return self.allowed_origins_list

    @property
    def igdb_configured(self) -> bool:
        return bool(self.twitch_client_id and self.twitch_client_secret)


@lru_cache
def get_settings() -> Settings:
    return Settings()
