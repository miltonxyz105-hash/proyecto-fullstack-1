import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate  
} from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'

// importamos Layout
import Layout from './components/Layout'

// importamos las paginas 
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Juegos from './pages/Juegos'
import Reviews from './pages/Reviews'
import Favoritos from './pages/Favoritos'
import Tareas from './pages/Tareas'

//ruta protegida con Layout
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <p style={{color: "white"}}>Cargando...</p>
  }
  // si no hay usuario, redirigimos al login
  if (!user) {
    return <Navigate to="/login" replace />
  }
  //si hay usuario, mostramos el Layout con el contenido
    return <Layout>{children}</Layout>
  }
  function App() {
    return (
      <Router>
        <Routes>
          {/* rutas publiclicas: */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* rutas protegidas: */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
              </ProtectedRoute>} 
              />
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

          {/* rutas por defecto: redirige a / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    )
  }
export default App
