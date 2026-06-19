from pydantic import BaseModel


class CrearFavorito(BaseModel):
    juego_id: int
