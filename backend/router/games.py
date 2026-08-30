import random
from fastapi import APIRouter

router = APIRouter(prefix="/games", tags=["Games"])

GAMES_CATALOG = [
    {
        "id": 540,
        "title": "Overwatch 2",
        "genre": "Shooter",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/540/thumbnail.jpg",
        "short_description": "Hero shooter de acción por equipos de Blizzard."
    },
    {
        "id": 516,
        "title": "PUBG: BATTLEGROUNDS",
        "genre": "Shooter",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/516/thumbnail.jpg",
        "short_description": "El battle royale táctico original."
    },
    {
        "id": 475,
        "title": "Genshin Impact",
        "genre": "Action RPG",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/475/thumbnail.jpg",
        "short_description": "RPG de aventura de mundo abierto en Teyvat."
    },
    {
        "id": 523,
        "title": "Fall Guys",
        "genre": "Battle Royale",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/523/thumbnail.jpg",
        "short_description": "Juego de carreras y obstáculos multijugador."
    },
    {
        "id": 521,
        "title": "Diablo Immortal",
        "genre": "MMORPG",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/521/thumbnail.jpg",
        "short_description": "MMORPG de acción en el universo de Diablo."
    },
    {
        "id": 517,
        "title": "Lost Ark",
        "genre": "ARPG",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/517/thumbnail.jpg",
        "short_description": "Explora el vasto mundo de Arkesia."
    },
    {
        "id": 217,
        "title": "Smite",
        "genre": "MOBA",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/217/thumbnail.jpg",
        "short_description": "El campo de batalla de los dioses."
    },
    {
        "id": 3,
        "title": "Warframe",
        "genre": "Shooter",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/3/thumbnail.jpg",
        "short_description": "Juego de disparos cooperativo de ninjas espaciales."
    },
    {
        "id": 11,
        "title": "Neverwinter",
        "genre": "MMORPG",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/11/thumbnail.jpg",
        "short_description": "MMORPG basado en Dungeons & Dragons."
    },
    {
        "id": 520,
        "title": "Halo Infinite",
        "genre": "Shooter",
        "platform": "PC",
        "thumbnail": "https://www.freetogame.com/g/520/thumbnail.jpg",
        "short_description": "El multijugador legendario de Halo totalmente gratis."
    }
]

@router.get("")
@router.get("/")
async def get_all_games():
    # Se crea una copia y se mezcla aleatoriamente en cada petición
    shuffled_catalog = GAMES_CATALOG.copy()
    random.shuffle(shuffled_catalog)
    return shuffled_catalog

@router.get("/category")
async def get_games_by_category(category: str):
    filtered = [g for g in GAMES_CATALOG if g["genre"].lower() == category.lower()]
    random.shuffle(filtered)
    return filtered