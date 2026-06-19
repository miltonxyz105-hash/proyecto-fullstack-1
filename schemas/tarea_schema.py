from pydantic import BaseModel

class CrearTarea(BaseModel):
    titulo: str
    descripcion: str

class actualizarTarea(BaseModel):
    titulo: str
    descripcion: str
    