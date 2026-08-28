from typing import Optional
from pydantic import BaseModel


class CrearTarea(BaseModel):
    titulo: str
    descripcion: str
    estado: str = "pendiente"
    fecha_limite: Optional[str] = None


class actualizarTarea(BaseModel):
    titulo: str
    descripcion: str
    estado: str = "pendiente"
    fecha_limite: Optional[str] = None
