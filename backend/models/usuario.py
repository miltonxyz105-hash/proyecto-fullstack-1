from pydantic import BaseModel, EmailStr

class Usuario(BaseModel):
    nombre: str
    edad: int
    email: EmailStr
    password: str