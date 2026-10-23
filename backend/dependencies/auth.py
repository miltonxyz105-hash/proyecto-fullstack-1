import logging

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import supabase

logger = logging.getLogger("xp-legacy.auth")

security = HTTPBearer()


def obtener_usuario_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Devuelve el auth_id del usuario autenticado.

    Cualquier problema con el token (ausente, expirado o inválido) se
    traduce en un 401 con un mensaje claro, nunca en un 500.
    """
    token = credentials.credentials

    try:
        res = supabase.auth.get_user(token)
    except Exception as exc:
        logger.debug("Token rechazado por Supabase: %s", exc)
        raise HTTPException(
            status_code=401,
            detail="Tu sesión expiró o no es válida. Inicia sesión de nuevo.",
        ) from exc

    user = getattr(res, "user", None) if res is not None else None
    if user is None or not getattr(user, "id", None):
        raise HTTPException(
            status_code=401,
            detail="Tu sesión expiró o no es válida. Inicia sesión de nuevo.",
        )

    return user.id
