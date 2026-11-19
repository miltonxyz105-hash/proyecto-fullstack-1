import React from 'react';
import styled, { keyframes } from 'styled-components';

export default function Favorites() {
  // Datos de ejemplo para tus favoritos
  const favoriteGames = [
    {
      id: 1,
      title: 'The Witcher 3: Wild Hunt',
      genre: 'RPG',
      platform: 'PC',
      image: 'https://www.freetogame.com/g/475/thumbnail.jpg', // URL de ejemplo
      rating: '9.8',
    },
    {
      id: 2,
      title: 'Cyberpunk 2077',
      genre: 'Action RPG',
      platform: 'Steam',
      image: 'https://www.freetogame.com/g/540/thumbnail.jpg',
      rating: '9.5',
    },
    {
      id: 3,
      title: 'Red Dead Redemption 2',
      genre: 'Aventura',
      platform: 'PS5',
      image: 'https://www.freetogame.com/g/516/thumbnail.jpg',
      rating: '9.9',
    }
  ];

  return (
    <FavoritesWrapper>
      <div className="bg-grid"></div>
      
      <Header>
        <div className="title-area">
          <h1>Tus Favoritos</h1>
          <p>La vitrina de tus mejores aventuras</p>
        </div>
        
        <div className="stats-neon">
          <span>{favoriteGames.length}</span> Títulos Guardados
        </div>
      </Header>

      <FavGrid>
        {favoriteGames.map((game) => (
          <FavCard key={game.id}>
            <div className="image-wrapper">
              <img src={game.image} alt={game.title} onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200/111/007bff?text=Sin+Imagen'; }} />
              <div className="overlay"></div>
              <HeartIcon className="active">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </HeartIcon>
              <div className="rating-badge">
                <span className="star">★</span> {game.rating}
              </div>
            </div>

            <div className="card-info">
              <h2>{game.title}</h2>
              <div className="tags">
                <span className="tag genre">{game.genre}</span>
                <span className="tag platform">{game.platform}</span>
              </div>
              
              <PlayButton>
                <div className="btn-bg"></div>
                <span className="btn-text">VER DETALLES</span>
              </PlayButton>
            </div>
          </FavCard>
        ))}
      </FavGrid>
    </FavoritesWrapper>
  );
}

// --- ANIMACIONES ---
const heartbeat = keyframes`
  0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 0, 85, 0.5)); }
  14% { transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(255, 0, 85, 0.9)); }
  28% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 0, 85, 0.5)); }
  42% { transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(255, 0, 85, 0.9)); }
  70% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 0, 85, 0.5)); }
`;

const slideUpGlow = keyframes`
  0% { background-position: 0% 100%; }
  100% { background-position: 0% 0%; }
`;

// --- ESTILOS ---
const FavoritesWrapper = styled.div`
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
    mask-image: radial-gradient(circle at top left, black, transparent 80%);
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
      text-shadow: 0 0 20px rgba(255, 0, 85, 0.4), 0 0 10px rgba(0, 123, 255, 0.4);
    }
    p {
      margin: 5px 0 0 0;
      color: #4a4a6a;
      font-size: 16px;
      letter-spacing: 1px;
    }
  }

  .stats-neon {
    background: rgba(255, 0, 85, 0.05);
    border: 1px solid rgba(255, 0, 85, 0.3);
    padding: 10px 20px;
    border-radius: 8px;
    color: #4a4a6a;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 1px;
    box-shadow: 0 0 15px rgba(255, 0, 85, 0.1) inset;

    span {
      color: #ff0055;
      font-size: 20px;
      font-weight: 900;
      text-shadow: 0 0 10px rgba(255, 0, 85, 0.5);
      margin-right: 5px;
    }
  }
`;

const FavGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 35px;
`;

const FavCard = styled.div`
  background: #0a0a14;
  border: 1px solid #1a1a2e;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    border-color: #ff0055;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 0, 85, 0.2);

    .image-wrapper img {
      transform: scale(1.08);
    }
    
    .overlay {
      background: linear-gradient(0deg, #0a0a14 0%, transparent 100%);
    }
  }

  .image-wrapper {
    width: 100%;
    height: 200px;
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, #0a0a14 5%, transparent 80%);
      transition: background 0.4s ease;
      z-index: 1;
    }
  }

  .rating-badge {
    position: absolute;
    bottom: 12px;
    left: 16px;
    z-index: 2;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 215, 0, 0.3);
    padding: 4px 10px;
    border-radius: 6px;
    color: #fff;
    font-weight: 800;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;

    .star {
      color: #ffd700;
      text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
    }
  }

  .card-info {
    padding: 24px;
    display: flex;
    flex-direction: column;
    flex: 1;
    z-index: 2;

    h2 {
      margin: 0 0 12px 0;
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .tags {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;

      .tag {
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .genre {
        background: rgba(0, 123, 255, 0.1);
        color: #00e5ff;
        border: 1px solid rgba(0, 229, 255, 0.2);
      }

      .platform {
        background: rgba(255, 255, 255, 0.05);
        color: #b0b0c0;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  }
`;

const HeartIcon = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  width: 35px;
  height: 35px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);

  svg {
    width: 20px;
    height: 20px;
    color: #4a4a6a;
    transition: all 0.3s;
  }

  &.active svg {
    color: #ff0055;
    animation: ${heartbeat} 2s infinite;
  }
`;

const PlayButton = styled.button`
  margin-top: auto;
  width: 100%;
  background: transparent;
  color: #fff;
  border: 1px solid #1a1a2e;
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  .btn-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 229, 255, 0.2) 0%, rgba(0, 123, 255, 0.4) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }

  .btn-text {
    position: relative;
    z-index: 2;
    transition: text-shadow 0.3s ease;
  }

  &:hover {
    border-color: #00e5ff;
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);

    .btn-bg {
      opacity: 1;
    }

    .btn-text {
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    }
  }
`;