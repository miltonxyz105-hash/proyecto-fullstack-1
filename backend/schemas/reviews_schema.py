from pydantic import BaseModel, Field


class CrearReview(BaseModel):
    juego_id: int
    puntuacion: int = Field(ge=1, le=10)
    comentario: str


class ActualizarReview(BaseModel):
    puntuacion: int = Field(ge=1, le=10)
    comentario: str
