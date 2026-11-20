import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate  
} from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'

// Importamos Layout
import Layout from './components/Layout'

// Importamos las páginas
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Catalogo from './pages/Catalogo'
import Juegos from './pages/Juegos'
import Reviews from './pages/Reviews'
import Favoritos from './pages/Favoritos'
import Tareas from './pages/Tareas'

// Ruta protegida con Layout y validación opcional de roles
function ProtectedRoute({ children, rolesPermitidos }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <p style={{ color: "white", padding: "20px" }}>Cargando...</p>
  }

  // Si no hay usuario logueado, redirigimos al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si la ruta exige roles específicos, verificamos el rol del usuario
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const rolUsuario = user.rol || user.app_metadata?.rol || 'empleado'
    if (!rolesPermitidos.includes(rolUsuario) && rolUsuario !== 'superadmin') {
      return <Navigate to="/" replace />
    }
  }

  // Si todo está en orden, mostramos el Layout con el contenido
  return <Layout>{children}</Layout>
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/catalogo" element={
          <ProtectedRoute>
            <Catalogo />
          </ProtectedRoute>
        } />

        <Route path="/juegos" element={
          <ProtectedRoute>
            <Juegos />
          </ProtectedRoute>
        } />

        <Route path="/reviews" element={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        } />

        <Route path="/favoritos" element={
          <ProtectedRoute>
            <Favoritos />
          </ProtectedRoute>
        } />

        <Route path="/tareas" element={
          <ProtectedRoute>
            <Tareas />
          </ProtectedRoute>
        } />

        {/* Ejemplo de cómo restringir una ruta futura solo para jefes:
        <Route path="/admin" element={
          <ProtectedRoute rolesPermitidos={['jefe']}>
            <PanelAdmin />
          </ProtectedRoute>
        } /> 
        */}

        {/* Rutas por defecto: redirige a / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App