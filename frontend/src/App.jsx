import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Favoritos from './pages/Favoritos';
import Juegos from './pages/Juegos';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Register from './pages/Register';
import Reviews from './pages/Reviews';

/** Envuelve las rutas privadas: carga de sesión + redirección al login. */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <p style={{ color: 'white', textAlign: 'center', paddingTop: 80 }}>
        Comprobando sesión...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#141414',
              color: '#fff',
              border: '1px solid #1a1a2e',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#28a745', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc3545', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/juegos"
            element={
              <ProtectedRoute>
                <Juegos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favoritos"
            element={
              <ProtectedRoute>
                <Favoritos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
