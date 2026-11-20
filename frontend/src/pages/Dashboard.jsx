import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { getJuegos, deleteJuego } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarJuegos();
  }, []);

  const cargarJuegos = async () => {
    try {
      setLoading(true);
      const res = await getJuegos();
      // Soporta tanto res.data como res.data.data según cómo responda tu backend
      const lista = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setGames(lista);
    } catch (error) {
      console.error('Error al cargar tus juegos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que querés eliminar "${nombre}" de tu colección?`)) return;

    try {
      await deleteJuego(id);
      setGames((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error('Error al eliminar juego:', error);
      alert('No se pudo eliminar el juego. Verificá tus permisos.');
    }
  };

  return (
    <DashboardWrapper>
      <div className="bg-grid"></div>
      
      <Header>
        <div className="title-area">
          <h1>Mis Juegos</h1>
          <p>Gestiona tu colección de videojuegos</p>
        </div>
        
        <div className="actions">
          <GlowButton $primary onClick={() => navigate('/catalogo')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            BUSCAR EN CATÁLOGO
          </GlowButton>
          <GlowButton onClick={() => navigate('/juegos')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            CREAR MANUAL
          </GlowButton>
        </div>
      </Header>

      {loading ? (
        <EmptyState>Cargando base de datos de juegos...</EmptyState>
      ) : games.length === 0 ? (
        <EmptyState>
          Todavía no tenés juegos en tu biblioteca. Hacé clic en <strong>BUSCAR EN CATÁLOGO</strong> para agregar el primero.
        </EmptyState>
      ) : (
        <GamesGrid>
          {games.map((game) => {
            const titulo = game.nombre || game.title || 'Sin título';
            const genero = game.genero || game.generos || game.genre || 'Varios';
            const plataforma = game.plataforma || game.platform || 'PC';
            const horas = game.horas ?? game.hours ?? 0;
            const progreso = game.progreso ?? game.progress ?? 0;
            const estado = (game.estado || game.status || 'JUGANDO').toUpperCase();

            return (
              <GameCard key={game.id}>
                <div className="card-header">
                  <h2>{titulo}</h2>
                  <div className="card-actions">
                    <IconButton className="edit" onClick={() => navigate('/juegos')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </IconButton>
                    <IconButton className="delete" onClick={() => handleEliminar(game.id, titulo)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </IconButton>
                  </div>
                </div>

                <div className="stats-grid">
                  <div className="stat-row">
                    <span className="label">Género</span>
                    <span className="value">{genero}</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Plataforma</span>
                    <span className="value platform">{plataforma}</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Horas</span>
                    <span className="value">{horas}h</span>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span className="label">Progreso</span>
                    <span className="value percent">{progreso}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progreso}%` }}>
                      <div className="glow-tip"></div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <StatusBadge $status={estado}>
                    <span className="dot"></span>
                    {estado}
                  </StatusBadge>
                  
                  {game.platinado && (
                    <TrophyBadge>
                      Platinado 🏆
                    </TrophyBadge>
                  )}
                </div>
              </GameCard>
            );
          })}
        </GamesGrid>
      )}
    </DashboardWrapper>
  );
}

// --- ANIMACIONES ---
const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 229, 255, 0.2); }
  50% { box-shadow: 0 0 15px rgba(0, 229, 255, 0.6); }
  100% { box-shadow: 0 0 5px rgba(0, 229, 255, 0.2); }
`;

// --- ESTILOS ---
const DashboardWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #040406;
  padding: 40px 60px;
  position: relative;
  overflow: hidden;
  color: #fff;
  z-index: 1;

  .bg-grid {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image: 
      linear-gradient(to right, rgba(0, 123, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 123, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at top left, black, transparent 80%);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6a6a8a;
  border: 1px dashed #1a1a2e;
  border-radius: 16px;
  background: rgba(10, 10, 20, 0.4);
  font-size: 16px;

  strong {
    color: #00e5ff;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 50px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
  padding-bottom: 20px;

  .title-area {
    h1 {
      font-size: 48px;
      font-weight: 900;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #fff;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.4), 0 0 10px rgba(0, 123, 255, 0.4);
    }
    p {
      margin: 5px 0 0 0;
      color: #4a4a6a;
      font-size: 16px;
      letter-spacing: 1px;
    }
  }

  .actions {
    display: flex;
    gap: 16px;
  }
`;

const GlowButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => (props.$primary ? 'rgba(0, 123, 255, 0.1)' : 'transparent')};
  color: ${(props) => (props.$primary ? '#00e5ff' : '#4a4a6a')};
  border: 1px solid ${(props) => (props.$primary ? '#007bff' : '#1a1a2e')};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${(props) => (props.$primary ? '#007bff' : 'rgba(0, 229, 255, 0.05)')};
    color: #fff;
    border-color: #00e5ff;
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.4), inset 0 0 10px rgba(0, 229, 255, 0.2);
    
    svg {
      transform: scale(1.1);
    }
  }

  svg {
    transition: transform 0.3s ease;
  }
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
`;

const GameCard = styled.div`
  background: linear-gradient(145deg, #0a0a14 0%, #06060a 100%);
  border: 1px solid #1a1a2e;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 229, 255, 0.4);
    box-shadow: 0 15px 35px rgba(0, 123, 255, 0.15), 0 0 15px rgba(0, 229, 255, 0.1) inset;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .card-actions {
      display: flex;
      gap: 8px;
    }
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px dashed #1a1a2e;

      .label {
        color: #4a4a6a;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .value {
        color: #fff;
        font-size: 14px;
        font-weight: 600;

        &.platform {
          color: #00e5ff;
          text-shadow: 0 0 5px rgba(0, 229, 255, 0.3);
        }
      }
    }
  }

  .progress-section {
    margin-bottom: 24px;

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      .label { color: #4a4a6a; font-size: 12px; text-transform: uppercase; }
      .percent { color: #00e5ff; font-weight: 700; font-size: 14px; }
    }

    .progress-bar-bg {
      width: 100%;
      height: 6px;
      background-color: #11111f;
      border-radius: 10px;
      overflow: hidden;
      position: relative;

      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #00e5ff);
        border-radius: 10px;
        position: relative;
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);

        .glow-tip {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 10px;
          background: #fff;
          filter: blur(2px);
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }
`;

const IconButton = styled.button`
  background: #11111f;
  border: 1px solid #1a1a2e;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #4a4a6a;
  transition: all 0.2s;

  svg { width: 16px; height: 16px; }

  &.edit:hover {
    color: #00e5ff;
    border-color: #00e5ff;
    background: rgba(0, 229, 255, 0.1);
  }

  &.delete:hover {
    color: #ff0055;
    border-color: #ff0055;
    background: rgba(255, 0, 85, 0.1);
    box-shadow: 0 0 10px rgba(255, 0, 85, 0.2);
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 123, 255, 0.1);
  border: 1px solid #007bff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  color: #00e5ff;
  letter-spacing: 1px;

  .dot {
    width: 6px;
    height: 6px;
    background-color: #00e5ff;
    border-radius: 50%;
    animation: ${pulseGlow} 2s infinite;
  }
`;

const TrophyBadge = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.05);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
`;