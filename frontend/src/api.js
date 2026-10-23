import axios from 'axios'

// URL base configurable. En local puede vivir en .env.local (VITE_API_URL);
// si no está definida usamos el despliegue conocido como valor por defecto.
const baseURL =
  import.meta.env.VITE_API_URL || 'https://proyecto-fullstack-1-moip.onrender.com'

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn(
    '[XP Legacy] Falta VITE_API_URL en el build de producción. Usando la URL por defecto.'
  )
}

const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

export const guardarSesion = ({ access_token, refresh_token }) => {
  localStorage.setItem(ACCESS_KEY, access_token)
  localStorage.setItem(REFRESH_KEY, refresh_token)
}

export const borrarSesion = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export const obtenerAccessToken = () => localStorage.getItem(ACCESS_KEY)

const api = axios.create({ baseURL })

// Interceptor de petición: adjunta el token a todas las llamadas.
api.interceptors.request.use((config) => {
  const token = obtenerAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si existe un refresh en curso, todas las peticiones 401 esperan al mismo.
let refreshEnCurso = null

const esLlamadaAuth = (url = '') =>
  ['/auth/login', '/auth/register', '/auth/refresh'].some((ruta) =>
    url.includes(ruta)
  )

// Interceptor de respuesta: renueva la sesión una vez ante un 401.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !esLlamadaAuth(original.url)
    ) {
      original._retry = true
      const refreshToken = localStorage.getItem(REFRESH_KEY)

      if (refreshToken) {
        try {
          if (!refreshEnCurso) {
            refreshEnCurso = axios
              .post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken })
              .finally(() => {
                refreshEnCurso = null
              })
          }

          const res = await refreshEnCurso
          guardarSesion(res.data)
          original.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(original)
        } catch {
          // Sesión irrecuperable: limpiamos y avisamos a AuthContext.
          borrarSesion()
          window.dispatchEvent(new CustomEvent('session-expired'))
          return Promise.reject(error)
        }
      }
    }

    return Promise.reject(error)
  }
)

// AUTH
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const refreshSession = (refreshToken) =>
  api.post('/auth/refresh', { refresh_token: refreshToken })
export const getMyUser = () => api.get('/auth/me')
export const updateMyUser = (data) => api.put('/auth/me', data)

// JUEGOS (biblioteca personal)
export const getJuegos = () => api.get('/juegos/')
export const createJuego = (data) => api.post('/juegos/', data)
export const updateJuego = (id, data) => api.put(`/juegos/${id}`, data)
export const deleteJuego = (id) => api.delete(`/juegos/${id}`)

// REVIEWS
export const getMisReviews = () => api.get('/reviews/mias')
export const createReview = (data) => api.post('/reviews/', data)
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data)
export const deleteReview = (id) => api.delete(`/reviews/${id}`)

// FAVORITOS
export const getMisFavoritos = () => api.get('/favoritos/')
export const agregarFavorito = (data) => api.post('/favoritos/', data)
export const eliminarFavorito = (juegoId) => api.delete(`/favoritos/${juegoId}`)

// CATÁLOGO PÚBLICO (endpoint /games del backend)
export const getGamesCatalog = () => api.get('/games')

export default api
