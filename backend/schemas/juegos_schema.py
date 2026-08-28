from typing import Literal, Optional 
from pydantic import BaseModel, Field

class Crearjuego(BaseModel):
    nombre: str
    genero: str
    plataforma: str
    horas_jugadas: int = 0
    estado: Literal["pendiente", "jugado", "jugando", "abandonado", "completado"] = "pendiente"
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    porcentaje_completado: int = Field(0, ge=0, le=100)
    platinado: bool = False
    logros: Optional[str] = None
    comentario_personal: Optional[str] = None

class Actualizarjuego(BaseModel):
    nombre: Optional[str] = None
    genero: Optional[str] = None
    plataforma: Optional[str] = None
    horas_jugadas: Optional[int] = None
    estado: Optional[Literal["pendiente", "jugado", "jugando", "abandonado", "completado"]] = None
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    porcentaje_completado: Optional[int] = Field(None, ge=0, le=100)
    platinado: Optional[bool] = None
    logros: Optional[str] = None
    comentario_personal: Optional[str] = None
