import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import supabase
from schemas.user_schema import (
    ActualizarPerfil,
    RefreshRequest,
    loginUser,
    registerUser,
)
from services.auth_service import (
    actualizar_perfil,
    login_usuario,
    obtener_perfil,
    refrescar_sesion,
    registrar_usuario,
)

logger = logging.getLogger("xp-legacy.auth")

router = APIRouter(prefix="/auth", tags=["auth"])

security = HTTPBearer()


def _mensaje_amigable(exc: Exception) -> str:
    """Traduce los errores crudos de Supabase a mensajes entendibles.

    El detalle original queda registrado en los logs del servidor,
    nunca se devuelve al cliente.
    """
    raw = str(exc).lower()

    if "already registered" in raw or "already been registered" in raw:
        return "Ya existe una cuenta con ese correo electrónico."
    if "password should be at least" in raw or ("password" in raw and "least" in raw):
        return "La contraseña debe tener al menos 6 caracteres."
    if "invalid login credentials" in raw or "invalid credentials" in raw:
        return "Correo o contraseña incorrectos."
    if "email not confirmed" in raw:
        return "Debes confirmar tu correo electrónico antes de iniciar sesión."
    if "rate limit" in raw or "too many" in raw:
        return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo."
    if "smtp" in raw or "error sending" in raw:
        return "No se pudo enviar el correo de confirmación. Inténtalo más tarde."
    if "fetch" in raw or "connect" in raw or "name or service" in raw:
        return "No se pudo conectar con el servidor. Inténtalo de nuevo."
    return "No se pudo completar la operación. Inténtalo de nuevo."


def _usuario_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Resuelve el usuario autenticado (id + email) o devuelve 401."""
    try:
        auth_user = supabase.auth.get_user(credentials.credentials).user
    except Exception as exc:
        logger.debug("Token rechazado: %s", exc)
        auth_user = None

    if auth_user is None or not getattr(auth_user, "id", None):
        raise HTTPException(
            status_code=401,
            detail="Tu sesión expiró o no es válida. Inicia sesión de nuevo.",
        )

    return {"id": auth_user.id, "email": auth_user.email}


def _perfil_publico(auth_id: str, email: str) -> dict:
    """Respuesta de perfil tolerante a columnas opcionales/ausentes."""
    perfil = obtener_perfil(auth_id) or {}
    return {
        "id": auth_id,
        "email": email,
        "nombre": perfil.get("nombre"),
        "edad": perfil.get("edad"),
        # Solo existirán si la tabla `usuarios` los tiene.
        "username": perfil.get("username"),
        "avatar_url": perfil.get("avatar_url"),
        "created_at": perfil.get("created_at"),
    }


@router.post("/register")
def register(user: registerUser):
    try:
        res = registrar_usuario(user.nombre, user.edad, user.email, user.password)
    except Exception as exc:
        logger.warning("Registro fallido (%s): %s", user.email, exc)
        raise HTTPException(status_code=400, detail=_mensaje_amigable(exc)) from exc

    if res["requires_email_confirmation"]:
        message = (
            "Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión."
        )
    else:
        message = "Cuenta creada. Ya puedes iniciar sesión."

    return {
        "message": message,
        "requires_email_confirmation": res["requires_email_confirmation"],
    }


@router.post("/login")
def login(user: loginUser):
    try:
        res = login_usuario(user.email, user.password)
    except Exception as exc:
        logger.warning("Login fallido (%s): %s", user.email, exc)
        raise HTTPException(status_code=401, detail=_mensaje_amigable(exc)) from exc

    session = getattr(res, "session", None)
    auth_user = getattr(res, "user", None)
    if session is None or auth_user is None:
        raise HTTPException(
            status_code=401, detail="Correo o contraseña incorrectos."
        )

    perfil = obtener_perfil(auth_user.id) or {}

    return {
        "message": "Usuario logueado exitosamente",
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": {
            "id": auth_user.id,
            "email": auth_user.email,
            "nombre": perfil.get("nombre"),
            "edad": perfil.get("edad"),
        },
    }


@router.post("/refresh")
def refresh(payload: RefreshRequest):
    """Renueva los tokens para mantener la sesión activa."""
    try:
        res = refrescar_sesion(payload.refresh_token)
        session = getattr(res, "session", None)
        if session is None:
            raise ValueError("sin sesión")
        auth_user = supabase.auth.get_user(session.access_token).user
    except Exception as exc:
        logger.debug("Refresh fallido: %s", exc)
        raise HTTPException(
            status_code=401,
            detail="Tu sesión expiró. Inicia sesión de nuevo.",
        ) from exc

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": _perfil_publico(auth_user.id, auth_user.email),
    }


@router.get("/me")
def obtener_usuario_logueado(auth_user: dict = Depends(_usuario_auth)):
    """Perfil del usuario autenticado."""
    return _perfil_publico(auth_user["id"], auth_user["email"])


@router.put("/me")
def editar_mi_perfil(
    payload: ActualizarPerfil,
    auth_user: dict = Depends(_usuario_auth),
):
    """Actualiza únicamente el perfil del usuario autenticado.

    Sustituye al antiguo `PUT /usuarios/{id}`, que permitía editar
    cualquier usuario de forma anónima (IDOR).
    """
    cambios = {
        k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None
    }

    if not cambios:
        raise HTTPException(status_code=400, detail="No hay datos que actualizar.")

    filas = actualizar_perfil(auth_user["id"], cambios)
    if not filas:
        raise HTTPException(
            status_code=404,
            detail="No se encontró tu perfil. Contacta con soporte.",
        )

    return {
        "message": "Perfil actualizado exitosamente",
        "user": _perfil_publico(auth_user["id"], auth_user["email"]),
    }
