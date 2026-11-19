import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

export default function GamesLibrary() {
  const [activeFilter, setActiveFilter] = useState('TODOS');

  // Datos de ejemplo para tu biblioteca entera
  const libraryGames = [
    { id: 1, title: 'Elden Ring', platform: 'Steam', genre: 'RPG', status: 'JUGANDO', cover: 'https://www.freetogame.com/g/540/thumbnail.jpg' },
    { id: 2, title: 'Halo Infinite', platform: 'Xbox', genre: 'Shooter', status: 'COMPLETADO', cover: 'https://www.freetogame.com/g/516/thumbnail.jpg' },
    { id: 3, title: 'God of War', platform: 'PS5', genre: 'Acción', status: 'COMPLETADO', cover: 'https://www.freetogame.com/g/475/thumbnail.jpg' },
    { id: 4, title: 'Hollow Knight', platform: 'Steam', genre: 'Metroidvania', status: 'PENDIENTE', cover: 'https://via.placeholder.com/300x400/1a1a2e/00e5ff?text=Hollow+Knight' },
    { id: 5, title: 'Valorant', platform: 'PC', genre: 'Shooter', status: 'JUGANDO', cover: 'https://via.placeholder.com/300x400/1a1a2e/00e5ff?text=Valorant' },
  ];

  const filters = ['TODOS', 'JUGANDO', 'COMPLETADO', 'PENDIENTE'];

  const filteredGames = activeFilter === 'TODOS' 
    ? libraryGames 
    : libraryGames.filter(game => game.status === activeFilter);

  return (
    <LibraryWrapper>
      <div className="bg-grid"></div>

      <Header>
        <div className="title-area">
          <h1>Mi Biblioteca</h1>
          <p>Explora tu colección completa de {libraryGames.length} juegos</p>
        </div>

        <FilterContainer>
          {filters.map(filter => (
            <FilterButton 
              key={filter} 
              className={activeFilter === filter ? 'active' : ''}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              {activeFilter === filter && <div className="glow-line"></div>}
            </FilterButton>
          ))}
        </FilterContainer>
      </Header>

      <LibraryGrid>
        {filteredGames.map(game => (
          <GamePoster key={game.id}>
            <div className="poster-image">
              <img src={game.cover} alt={game.title} />
              <div className="scanlines"></div>
            </div>
            
            <div className="status-badge" data-status={game.status}>
              {game.status}
            </div>

            <div className="info-overlay">
              <div className="content">
                <h3>{game.title}</h3>
                <div className="tags">
                  <span className="tag">{game.platform}</span>
                  <span className="tag dot">•</span>
                  <span className="tag">{game.genre}</span>
                </div>
                
                <div className="action-buttons">
                  <button className="play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                  <button className="more-btn">•••</button>
                </div>
              </div>
            </div>
          </GamePoster>
        ))}
        
        {filteredGames.length === 0 && (
          <div className="empty-state">
            No tienes juegos en esta categoría.
          </div>
        )}
      </LibraryGrid>
    </LibraryWrapper>
  );
}

// --- ANIMACIONES ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scan = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

// --- ESTILOS ---
const LibraryWrapper = styled.div`
  width: 100%;
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
    mask-image: radial-gradient(circle at top, black, transparent 80%);
  }
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 40px;

  .title-area {
    h1 {
      font-size: 48px;
      font-weight: 900;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #fff;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.4), 0 0 10px rgba(138, 43, 226, 0.4);
    }
    p {
      margin: 5px 0 0 0;
      color: #4a4a6a;
      font-size: 16px;
      letter-spacing: 1px;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  background: rgba(10, 10, 20, 0.6);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 229, 255, 0.1);
  width: fit-content;
  backdrop-filter: blur(10px);
`;

const FilterButton = styled.button`
  background: transparent;
  border: none;
  color: #4a4a6a;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  text-transform: uppercase;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: #00e5ff;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }

  .glow-line {
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #00e5ff;
    box-shadow: 0 0 15px 2px rgba(0, 229, 255, 0.7);
    animation: ${fadeIn} 0.3s ease forwards;
  }
`;

const LibraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px;
    color: #4a4a6a;
    font-size: 18px;
    border: 1px dashed rgba(0, 229, 255, 0.2);
    border-radius: 16px;
  }
`;

const GamePoster = styled.div`
  position: relative;
  aspect-ratio: 3/4;
  background: #0a0a14;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  animation: ${fadeIn} 0.5s ease-out forwards;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: #00e5ff;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 229, 255, 0.2) inset;

    .info-overlay {
      transform: translateY(0);
      opacity: 1;
    }

    .poster-image img {
      transform: scale(1.1);
      filter: brightness(0.5) saturate(1.2);
    }
  }

  .poster-image {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.5s ease;
    }

    /* Efecto holográfico/scanline suave */
    .scanlines {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.1) 50%,
        rgba(0,0,0,0.1)
      );
      background-size: 100% 4px;
      z-index: 1;
      pointer-events: none;
      opacity: 0.5;
    }
  }

  .status-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    font-size: 10px;
    font-weight: 900;
    padding: 4px 8px;
    border-radius: 4px;
    letter-spacing: 1px;
    backdrop-filter: blur(4px);
    
    &[data-status="JUGANDO"] {
      background: rgba(0, 229, 255, 0.15);
      color: #00e5ff;
      border: 1px solid rgba(0, 229, 255, 0.3);
    }
    &[data-status="COMPLETADO"] {
      background: rgba(138, 43, 226, 0.15);
      color: #b57cff;
      border: 1px solid rgba(138, 43, 226, 0.3);
    }
    &[data-status="PENDIENTE"] {
      background: rgba(255, 255, 255, 0.1);
      color: #b0b0c0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  }

  .info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(0deg, rgba(4,4,6,1) 0%, rgba(4,4,6,0.8) 60%, transparent 100%);
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 20px;
    transform: translateY(100%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1);

    .content {
      transform: translateY(10px);
      transition: transform 0.4s ease;
    }
  }

  &:hover .info-overlay .content {
    transform: translateY(0);
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }

  .tags {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .tag {
      font-size: 11px;
      color: #00e5ff;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.dot {
        color: #4a4a6a;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 10px;

    button {
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s;
    }

    .play-btn {
      flex: 1;
      background: rgba(0, 123, 255, 0.2);
      border: 1px solid #007bff;
      color: #00e5ff;
      padding: 10px;
      
      svg { width: 18px; height: 18px; }

      &:hover {
        background: #007bff;
        color: #fff;
        border-color: #00e5ff;
        box-shadow: 0 0 15px rgba(0, 123, 255, 0.5);
        transform: scale(1.05);
      }
    }

    .more-btn {
      width: 40px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 16px;
      letter-spacing: 1px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: #fff;
      }
    }
  }
`;