from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.auth import router as auth_router
from router.favoritos import router as favoritos_router
from router.reviews import router as reviews_router
from router.tarea import router as tarea_router
from router.juegos import router as juego_router
from router.usuarios import router as usuarios_router

app = FastAPI()

# Dominios permitidos (Local + Vercel)
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://proyecto-fullstack-1.vercel.app",  # Tu frontend en Vercel
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # O usa ["*"] si quieres permitir cualquier origen temporalmente
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(juego_router)
app.include_router(reviews_router)
app.include_router(favoritos_router)
app.include_router(tarea_router)

@app.get("/")
def inicio():
    return {"mensaje": "Bienvenido a la API"}