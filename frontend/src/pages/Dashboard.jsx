import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ErrorView, LoadingView } from '../components/StateViews';
import { getJuegos, getMisFavoritos, getMisReviews } from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import { useAuth } from '../contexts/AuthContext';

const asArray = (posible) => (Array.isArray(posible) ? posible : []);

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    juegos: 0,
    platinados: 0,
    reviews: 0,
    favoritos: 0,
    horas: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const [juegosRes, reviewsRes, favoritosRes] = await Promise.all([
        getJuegos(),
        getMisReviews(),
        getMisFavoritos(),
      ]);

      const juegos = asArray(juegosRes.data?.data);
      const reviews = asArray(reviewsRes.data?.data);
      const favoritos = asArray(favoritosRes.data?.data);

      setStats({
        juegos: juegos.length,
        platinados: juegos.filter((juego) => juego.platinado).length,
        reviews: reviews.length,
        favoritos: favoritos.length,
        horas: juegos.reduce(
          (total, juego) => total + (Number(juego.horas_jugadas) || 0),
          0
        ),
      });
      setErrorCarga(null);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setErrorCarga(
        getApiErrorMessage(error, 'No se pudieron cargar tus estadísticas.')
      );
    } finally {
      setCargando(false);
    }
  }, []);

  const recargarStats = () => {
    setCargando(true);
    loadStats();
  };

  useEffect(() => {
    async function cargar() {
      await loadStats();
    }
    cargar();
  }, [loadStats]);

  const saludo = user?.nombre ? `Hola, ${user.nombre}` : 'Bienvenido de nuevo';

  return (
    <StyledWrapper>
      <header className="dashboard-header">
        <h1>Resumen del Legado</h1>
        <p>
          {saludo}, <span className="user-name">{user?.email}</span>
        </p>
      </header>

      {cargando ? (
        <LoadingView mensaje="Calculando tus estadísticas..." />
      ) : (
        <>
          {errorCarga && <ErrorView error={errorCarga} onReintentar={recargarStats} />}

          <div className="stats-grid">
            <StatCard as={Link} to="/juegos" color="#007bff">
              <span className="icon">🎮</span>
              <div className="info">
                <h3>{stats.juegos}</h3>
                <p>Juegos en tu biblioteca</p>
              </div>
            </StatCard>

            <StatCard as={Link} to="/perfil" color="#00d4ff">
              <span className="icon">🏆</span>
              <div className="info">
                <h3>{stats.platinados}</h3>
                <p>Juegos platinados</p>
              </div>
            </StatCard>

            <StatCard as={Link} to="/reviews" color="#e83e8c">
              <span className="icon">📝</span>
              <div className="info">
                <h3>{stats.reviews}</h3>
                <p>Reviews publicadas</p>
              </div>
            </StatCard>

            <StatCard as={Link} to="/favoritos" color="#ffc107">
              <span className="icon">❤️</span>
              <div className="info">
                <h3>{stats.favoritos}</h3>
                <p>Juegos favoritos</p>
              </div>
            </StatCard>
          </div>

          <SummaryRow>
            <span className="summary-item">
              ⏱️ <strong>{stats.horas}h</strong> jugadas en total
            </span>
            <span className="summary-item">
              🏆{' '}
              <strong>
                {stats.juegos > 0
                  ? `${Math.round((stats.platinados / stats.juegos) * 100)}%`
                  : '0%'}
              </strong>
              de tu biblioteca platinada
            </span>
          </SummaryRow>

          <WelcomeSection>
            <h2>Tu viaje gamer continúa aquí.</h2>
            <p>
              Explora tus estadísticas, registra nuevos desafíos y mantén tu
              legado actualizado.
            </p>
          </WelcomeSection>
        </>
      )}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  padding: 20px;

  .dashboard-header {
    margin-bottom: 32px;

    h1 {
      font-size: 30px;
      color: #fff;
      margin: 0 0 8px;
    }

    p {
      color: #888;
      font-size: 16px;
      margin: 0;

      .user-name {
        color: #007bff;
        font-weight: 600;
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }
`;

const StatCard = styled.div`
  background: #141414;
  border: 1px solid #1a1a2e;
  padding: 22px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 18px;
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease;

  .icon {
    font-size: 34px;
    background: ${(props) => props.color + '15'};
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .info {
    h3 {
      font-size: 22px;
      color: white;
      margin: 0 0 4px;
    }

    p {
      font-size: 13px;
      color: #666;
      margin: 0;
    }
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${(props) => props.color};
  }
`;

const SummaryRow = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 28px;

  .summary-item {
    color: #888;
    font-size: 14px;

    strong {
      color: #fff;
    }
  }
`;

const WelcomeSection = styled.section`
  background: linear-gradient(135deg, #007bff20, #00d4ff05);
  padding: 36px;
  border-radius: 16px;
  border: 1px solid #007bff30;
  text-align: center;

  h2 {
    font-size: 22px;
    color: #fff;
    margin: 0 0 12px;
  }

  p {
    color: #888;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;
