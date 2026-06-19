from fastapi import APIRouter, Depends, HTTPException
from schemas.user_schema import registerUser, loginUser
from services.auth_service import registrar_usuario, login_usuario
from database import supabase
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

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
            "user":{
                "id": res.user.id,
                "email": res.user.email
            }}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    
@router.get("/me")
def obtener_usuario_logueado(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    user = supabase.auth.get_user(token)

    return {
        "email": user.user.email,
        "id": user.user.id
    }
            
