import axios from 'axios'

const api = axios.create({
  baseURL: 'https://proyecto-fullstack-1-moip.onrender.com'
})

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// AUTH
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const getMyUser = () => api.get('/auth/me')

// USUARIOS
export const getUsuarios = () => api.get('/usuarios/')
export const createUsuario = (data) => api.post('/usuarios/', data)
export const getUsuarioById = (id) => api.get(`/usuarios/${id}`)
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

// JUEGOS
export const getJuegos = () => api.get('/juegos/')
export const getJuegoById = (id) => api.get(`/juegos/${id}`)
export const createJuego = (data) => api.post('/juegos/', data)
export const updateJuego = (id, data) => api.put(`/juegos/${id}`, data)
export const deleteJuego = (id) => api.delete(`/juegos/${id}`)

// REVIEWS
export const getReviewsDeJuego = (juegoId) => api.get(`/reviews/juego/${juegoId}`)
export const getMisReviews = () => api.get('/reviews/mias')
export const getReviewById = (id) => api.get(`/reviews/${id}`)
export const createReview = (data) => api.post('/reviews/', data)
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data)
export const deleteReview = (id) => api.delete(`/reviews/${id}`)

// FAVORITOS
export const getMisFavoritos = () => api.get('/favoritos/')
export const esFavorito = (juegoId) => api.get(`/favoritos/juego/${juegoId}`)
export const agregarFavorito = (data) => api.post('/favoritos/', data)
export const eliminarFavorito = (juegoId) => api.delete(`/favoritos/${juegoId}`)

// TAREAS
export const getTareas = () => api.get('/tareas/')
export const createTarea = (data) => api.post('/tareas/', data)
export const updateTarea = (id, data) => api.put(`/tareas/${id}`, data)
export const deleteTarea = (id) => api.delete(`/tareas/${id}`)

export default api
