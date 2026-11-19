import React from 'react';
import styled, { keyframes } from 'styled-components';

export default function Reviews() {
  // Datos de ejemplo para tus reseñas
  const reviewsData = [
    {
      id: 1,
      gameTitle: 'Cyberpunk 2077',
      image: 'https://www.freetogame.com/g/540/thumbnail.jpg',
      score: 9.5,
      date: '15/10/2026',
      hoursPlayed: 120,
      recommended: true,
      text: "Después de todas las actualizaciones, la ciudad de Night City se siente más viva que nunca. La narrativa es profunda, los personajes son inolvidables y el combate es brutal. Una redención absoluta para el estudio."
    },
    {
      id: 2,
      gameTitle: 'Starfield',
      image: 'https://www.freetogame.com/g/516/thumbnail.jpg',
      score: 6.8,
      date: '02/11/2026',
      hoursPlayed: 45,
      recommended: false,
      text: "Tiene momentos brillantes, pero la exploración se siente fragmentada por tantas pantallas de carga. Cumple como RPG espacial, pero le falta el alma que tenían otros juegos de la compañía. Bueno, pero no increíble."
    },
    {
      id: 3,
      gameTitle: 'Hades',
      image: 'https://www.freetogame.com/g/475/thumbnail.jpg',
      score: 10,
      date: '20/09/2026',
      hoursPlayed: 85,
      recommended: true,
      text: "Una obra maestra del género roguelike. La forma en que la historia avanza con cada muerte hace que el fracaso sea parte de la diversión. La música, el arte y la jugabilidad son perfectos de principio a fin."
    }
  ];

  // Función para determinar el color de la nota
  const getScoreColor = (score) => {
    if (score >= 9) return '#00e5ff'; // Cyan para obras maestras
    if (score >= 7) return '#00ff88'; // Verde neón para buenos
    if (score >= 5) return '#ffaa00'; // Naranja para regulares
    return '#ff0055'; // Rojo para malos
  };

  return (
    <ReviewsWrapper>
      <div className="bg-grid"></div>

      <Header>
        <div className="title-area">
          <h1>Análisis & Reseñas</h1>
          <p>Tus veredictos y registros de juego</p>
        </div>
        <NewReviewButton>
          <span className="btn-text">+ NUEVO ANÁLISIS</span>
          <div className="glitch-effect"></div>
        </NewReviewButton>
      </Header>

      <ReviewsGrid>
        {reviewsData.map((review) => (
          <ReviewCard key={review.id} $scoreColor={getScoreColor(review.score)}>
            <div className="card-header">
              <div className="game-art">
                <img src={review.image} alt={review.gameTitle} />
                <div className="art-overlay"></div>
              </div>
              
              <div className="header-info">
                <h2>{review.gameTitle}</h2>
                <div className="meta-data">
                  <span className="terminal-text">REGISTRO_{review.id} // {review.date}</span>
                </div>
              </div>

              <div className="score-hexagon">
                <div className="hex-inner">
                  <span className="score-value">{review.score}</span>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="quote-icon">"</div>
              <p>{review.text}</p>
            </div>

            <div className="card-footer">
              <div className="hours-logged">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{review.hoursPlayed} HRS REGISTRADAS</span>
              </div>
              
              <div className={`recommendation ${review.recommended ? 'yes' : 'no'}`}>
                {review.recommended ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    RECOMENDADO
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                    </svg>
                    NO RECOMENDADO
                  </>
                )}
              </div>
            </div>
          </ReviewCard>
        ))}
      </ReviewsGrid>
    </ReviewsWrapper>
  );
}

// --- ANIMACIONES ---
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const pulseBorder = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(var(--score-color-rgb), 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(var(--score-color-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--score-color-rgb), 0); }
`;

// --- ESTILOS ---
const ReviewsWrapper = styled.div`
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
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.4), 0 0 10px rgba(0, 123, 255, 0.4);
    }
    p {
      margin: 5px 0 0 0;
      color: #4a4a6a;
      font-size: 16px;
      letter-spacing: 1px;
    }
  }
`;

const NewReviewButton = styled.button`
  background: transparent;
  color: #00e5ff;
  border: 1px solid #007bff;
  padding: 14px 28px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.2) inset;

  .btn-text { position: relative; z-index: 2; }

  &:hover {
    background: #007bff;
    color: #fff;
    border-color: #00e5ff;
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.6), 0 0 40px rgba(0, 123, 255, 0.2) inset;
  }
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 40px;
`;

const ReviewCard = styled.div`
  background: linear-gradient(145deg, #0a0a14 0%, #050508 100%);
  border: 1px solid #1a1a2e;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  /* Variables dinámicas para el color de la nota */
  --score-color: ${(props) => props.$scoreColor};
  
  /* Conversión manual rápida de HEX a RGB para el box-shadow */
  --score-color-rgb: ${(props) => 
    props.$scoreColor === '#00e5ff' ? '0, 229, 255' : 
    props.$scoreColor === '#00ff88' ? '0, 255, 136' : 
    props.$scoreColor === '#ffaa00' ? '255, 170, 0' : '255, 0, 85'
  };

  &:hover {
    transform: translateY(-5px);
    border-color: var(--score-color);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(var(--score-color-rgb), 0.15) inset;
    
    .score-hexagon {
      animation: ${pulseBorder} 2s infinite;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #1a1a2e;
    position: relative;
    
    .game-art {
      width: 70px;
      height: 70px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      margin-right: 20px;
      border: 1px solid #2a2a3e;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .art-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(var(--score-color-rgb), 0.4) 0%, transparent 100%);
        mix-blend-mode: overlay;
      }
    }

    .header-info {
      flex: 1;

      h2 {
        margin: 0 0 6px 0;
        font-size: 24px;
        font-weight: 800;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .terminal-text {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        color: #4a4a6a;
        letter-spacing: 1px;
      }
    }

    .score-hexagon {
      width: 60px;
      height: 60px;
      background: rgba(var(--score-color-rgb), 0.1);
      border: 2px solid var(--score-color);
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: rotate(45deg);
      box-shadow: 0 0 15px rgba(var(--score-color-rgb), 0.3);
      transition: all 0.3s;

      .hex-inner {
        transform: rotate(-45deg);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .score-value {
        font-size: 22px;
        font-weight: 900;
        color: var(--score-color);
        text-shadow: 0 0 10px rgba(var(--score-color-rgb), 0.8);
      }
    }
  }

  .card-body {
    padding: 30px 24px;
    position: relative;
    flex: 1;

    .quote-icon {
      position: absolute;
      top: 10px;
      left: 15px;
      font-size: 60px;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.03);
      font-family: serif;
      line-height: 1;
    }

    p {
      margin: 0;
      color: #b0b0c0;
      font-size: 15px;
      line-height: 1.7;
      position: relative;
      z-index: 2;
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #06060a;
    border-top: 1px solid #1a1a2e;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;

    .hours-logged {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4a4a6a;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;

      svg { width: 16px; height: 16px; }
    }

    .recommendation {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 6px 12px;
      border-radius: 4px;

      svg { width: 16px; height: 16px; }

      &.yes {
        color: #00e5ff;
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.2);
      }

      &.no {
        color: #ff0055;
        background: rgba(255, 0, 85, 0.1);
        border: 1px solid rgba(255, 0, 85, 0.2);
      }
    }
  }
`;