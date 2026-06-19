from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import supabase

security = HTTPBearer()


def obtener_usuario_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    user = supabase.auth.get_user(token)

    return user.user.id
