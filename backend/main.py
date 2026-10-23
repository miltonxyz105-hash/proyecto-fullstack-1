"""Entrada de la API XP Legacy."""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from router.auth import router as auth_router
from router.favoritos import router as favoritos_router
from router.games import router as games_router
from router.juegos import router as juego_router
from router.reviews import router as reviews_router

settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("xp-legacy")

app = FastAPI(title=settings.app_name)

# Orígenes permitidos desde ALLOWED_ORIGINS (nunca ["*"]).
# Los patrones con comodín (`https://*.vercel.app`) se resuelven como
# expresión regular para cubrir previews de Vercel sin abrir el origen.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=settings.allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games_router)
app.include_router(auth_router)
app.include_router(juego_router)
app.include_router(reviews_router)
app.include_router(favoritos_router)


@app.get("/", tags=["health"])
def inicio():
    return {"mensaje": "Bienvenido a la API"}


@app.get("/health", tags=["health"])
def health():
    """Endpoint de salud para el healthcheck del proveedor de hosting."""
    return {"status": "ok"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Última red: convierte cualquier error inesperado en una respuesta
    JSON clara en lugar de un traceback para el cliente."""
    logger.exception("Error no controlado en %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor. Inténtalo de nuevo en unos segundos."
        },
    )
