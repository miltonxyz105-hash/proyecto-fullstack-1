from fastapi import APIRouter, Depends, HTTPException, status
from schemas.user_schema import registerUser, loginUser
from services.auth_service import registrar_usuario, login_usuario
from database import supabase
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from gotrue.errors import AuthApiError # <-- Importante importar esto

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

security = HTTPBearer()

@router.post("/register")
def register(user: registerUser):
    try:
        res = registrar_usuario(
            user.nombre,
            user.edad,
            user.email,
            user.password
        )
        return {
            "message": "Usuario registrado exitosamente",
            "data": str(res)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(user: loginUser):
    try:
        res = login_usuario(
            user.email,
            user.password
        )
        return {
            "message": "Usuario logueado exitosamente",
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": {
                "id": res.user.id,
                "email": res.user.email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    
@router.get("/me")
def obtener_usuario_logueado(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        # Aquí atrapamos el error si el token está expirado
        auth_user = supabase.auth.get_user(token)
    except AuthApiError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token expirado o inválido"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Error de autenticación"
        )

    # Buscamos el nombre en la tabla de usuarios
    user_data = supabase.table("usuarios").select("nombre").eq("auth_id", auth_user.user.id).execute()

    nombre = "Invitado"
    if user_data.data:
        nombre = user_data.data[0]["nombre"]

    # Obtenemos el rol desde los metadatos del token (por defecto será empleado si no se asignó nada)
    rol = auth_user.user.app_metadata.get("rol", "empleado")

    return {
        "email": auth_user.user.email,
        "id": auth_user.user.id,
        "nombre": nombre,
        "rol": rol
    }

# ---------------------------------------------------------
# NUEVA FUNCIÓN PARA PROTEGER RUTAS SEGÚN EL ROL
# ---------------------------------------------------------
def requerir_rol(roles_permitidos: list[str]):
    def verificador_rol(user_info: dict = Depends(obtener_usuario_logueado)):
        user_role = user_info.get("rol", "empleado")
        
        # Si el rol no está en la lista permitida y tampoco es el superadmin, bloqueamos
        if user_role not in roles_permitidos and user_role != "superadmin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Acceso denegado. Se requiere ser {', '.join(roles_permitidos)}"
            )
        return user_info
    return verificador_rol