"""Flujos de autenticación y perfil sobre Supabase Auth + tabla `usuarios`."""

import logging
from typing import Optional

from database import supabase

logger = logging.getLogger("xp-legacy.auth")

TABLA_USUARIOS = "usuarios"


def registrar_usuario(nombre: str, edad: int, email: str, password: str) -> dict:
    """Crea la cuenta en Supabase Auth y su fila de perfil.

    Devuelve `requires_email_confirmation` para que la UI pueda avisar al
    usuario si la confirmación por correo está activada en Supabase.
    """
    auth_res = supabase.auth.sign_up({"email": email, "password": password})

    if auth_res.user is None:
        raise RuntimeError(
            "No se pudo completar el registro. Verifica que la contraseña "
            "cumpla los requisitos de Supabase (mínimo 6 caracteres) y que el "
            "email sea válido."
        )

    auth_id = auth_res.user.id
    requires_confirmation = getattr(auth_res.user, "email_confirmed_at", None) is None

    try:
        supabase.table(TABLA_USUARIOS).insert(
            {
                "auth_id": auth_id,
                "nombre": nombre,
                "edad": edad,
                "email": email,
            }
        ).execute()
    except Exception:
        # La cuenta en Auth ya existe: no rompemos el registro, pero dejamos
        # constancia para poder reparar el perfil (la UI lo tolera).
        logger.exception("No se pudo crear el perfil para %s", email)

    return {
        "auth_id": auth_id,
        "requires_email_confirmation": requires_confirmation,
    }


def login_usuario(email: str, password: str):
    return supabase.auth.sign_in_with_password({"email": email, "password": password})


def refrescar_sesion(refresh_token: str):
    """Intercambia un refresh_token por una sesión nueva."""
    return supabase.auth.refresh_session(refresh_token)


def obtener_perfil(auth_id: str) -> Optional[dict]:
    """Fila de perfil del usuario. None si aún no existe."""
    res = (
        supabase.table(TABLA_USUARIOS)
        .select("*")
        .eq("auth_id", auth_id)
        .limit(1)
        .execute()
    )
    rows = res.data or []
    return rows[0] if rows else None


def actualizar_perfil(auth_id: str, cambios: dict) -> list:
    """Actualiza únicamente los campos enviados del propio perfil."""
    if not cambios:
        return []

    res = (
        supabase.table(TABLA_USUARIOS)
        .update(cambios)
        .eq("auth_id", auth_id)
        .execute()
    )
    return res.data or []
