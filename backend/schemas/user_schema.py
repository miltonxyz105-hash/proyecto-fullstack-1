from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class registerUser(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=80)
    edad: int = Field(..., ge=1, le=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class loginUser(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class ActualizarPerfil(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=80)
    edad: Optional[int] = Field(None, ge=1, le=120)
