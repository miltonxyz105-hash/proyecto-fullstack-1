from fastapi import APIRouter
import requests
import os

router = APIRouter(prefix="/catalogo", tags=["Catalogo"])

@router.get("/buscar")
def buscar_juegos_rawg(q: str):
    api_key = os.getenv("RAWG_API_KEY")
    url = f"https://api.rawg.io/api/games?key={api_key}&search={q}&page_size=12"
    
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        juegos = []
        for j in data.get("results", []):
            juegos.append({
                "id_externo": j.get("id"),
                "nombre": j.get("name"),
                "imagen": j.get("background_image"),
                "fecha_lanzamiento": j.get("released"),
                "generos": [g.get("name") for g in j.get("genres", [])],
                "plataformas": [p.get("platform", {}).get("name") for p in j.get("platforms", [])]
            })
        return {"data": juegos}
    return {"data": []}