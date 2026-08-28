import { useAuth } from '../contexts/AuthContext'
import styled from 'styled-components'

export default function Dashboard() {
  const { user } = useAuth()
    
    return (
      <StyledWrapper>
        <header className="dashboard-header">
          <h1>Resumen del Legado</h1>
          <p>Bienvenido de nuevo, <span className="user-name">{user?.email}</span></p>
        </header>
        <div className="stats-grid">
          <StatCard color="#007bff">
            <span className="icon">🎮</span>
            <div className="info">
              <h3>Juegos</h3>
              <p>Gestiona tu biblioteca</p>
            </div>
          </StatCard>
          <StatCard color="#28a745">
            <span className="icon">📝</span>
            <div className="info">
              <h3>Reviews</h3>
              <p>Tus opiniones</p>
            </div>
          </StatCard>
          <StatCard color="#e83e8c">
            <span className="icon">❤️</span>
            <div className="info">
              <h3>Favoritos</h3>
              <p>Lo mejor de lo mejor</p>
            </div>
          </StatCard>
          <StatCard color="#ffc107">
            <span className="icon">📌</span>
            <div className="info">
              <h3>Tareas</h3>
              <p>Próximos objetivos</p>
            </div>
          </StatCard>
        </div>

        <WelcomeSection>
           <h2>Tu viaje gamer continúa aquí.</h2>
           <p>Explora tus estadísticas, registra nuevos desafíos y mantén tu legado actualizado.</p>
        </WelcomeSection>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .dashboard-header {
    margin-bottom: 40px;

    h1 {
      font-size: 32px;
      color: #fff;
      margin-bottom: 8px;
    }

    p {
      color: #888;
      font-size: 16px;

      .user-name {
    color: #007bff;
    font-weight: 600;
  }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
`

const StatCard = styled.div`
  background: #141414;
  border: 1px solid #1a1a2e;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;

  .icon {
    font-size: 40px;
    background: ${props => props.color + '15'};
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .info {
    h3 {
      font-size: 18px;
      color: white;
      margin-bottom: 4px;
    }
    p {
      font-size: 14px;
      color: #666;
    }
  }

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.color};
    box-shadow: 0 10px 20px ${props => props.color + '15'};
  }
`

const WelcomeSection = styled.section`
  background: linear-gradient(135deg, #007bff20, #00d4ff05);
  padding: 40px;
  border-radius: 16px;
  border: 1px solid #007bff30;
  text-align: center;

  h2 {
    font-size: 24px;
    color: #fff;
    margin-bottom: 12px;
  }

  p {
    color: #888;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`

