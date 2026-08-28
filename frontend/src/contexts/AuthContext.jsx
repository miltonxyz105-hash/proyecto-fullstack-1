// vamos a importar hooks y herramientas de React
import { createContext, useContext, useState, useEffect } from "react";

//importamos las funciones d3e la API que necesitamos para auth
import { login, register, getMyUser } from "../api";

// creamos el contexto 
const AuthContext = createContext()

// creamos el componente provider que va a guardar el estado del contexto
export function AuthProvider({
    children }) {
        const [user, setUser] = useState(null) 
    // estado para saber si esta cargando la sesion 
    const [loading, setLoading] = useState(true)
    // funcion para iniciar sesion
    const handleLogin = async (email, password) => {
        try {
            const res = await login({email, password})
            localStorage.setItem("accessToken", res.data.access_token)
            localStorage.setItem("refreshToken", res.data.refresh_token)
            setUser(res.data.user)           
        } catch (error) {
            console.error("error al iniciar sesion", error)
            throw error
        }
    }
    // funcion para registrar un usuario
const handleRegister = async (nombre, edad, email, password) => {
  try {
    // Llamamos a la API con un OBJETO
    await register({ nombre, edad, email, password })
  } catch (error) {
    console.error("error al registrar usuario", error)
    throw error
  }
}
    // funcion para cerrar sesion 
    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        setUser(null)
    }
    useEffect(() => {
        const loadSession = async () => {
            const token = localStorage.getItem("accessToken")
            if (token) {
                try { // si hay token, pedimos los datos del usuario al backend
                    const res = await getMyUser()
                    setUser(res.data)
                } catch (error) { // si el token es invalido, lo borramos
                    handleLogout()
                }
            }
            setLoading(false) // terminamos de cargar
        }
        loadSession()
    }, [])
        return (
            <AuthContext.Provider value={{
                user,
                loading,
                handleLogin,
                handleRegister,
                handleLogout
                }}>
                    {children}
                </AuthContext.Provider>
        )
    }
    export function useAuth() {
        return useContext(AuthContext)
    }