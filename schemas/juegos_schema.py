from typing import Literal

from pydantic import BaseModel

class Crearjuego(BaseModel):
    nombre: str
    genero: str
    plataforma: str
    horas_jugadas: int = 0
    estado: Literal["pendiente", "jugado", "abandonado", "completado"] = "pendiente"
