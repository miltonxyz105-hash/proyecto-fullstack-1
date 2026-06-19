from pydantic import BaseModel, EmailStr

class registerUser(BaseModel):
    nombre: str
    edad: int
    email: EmailStr
    password: str

class loginUser(BaseModel):
    email: EmailStr
    password: str
    