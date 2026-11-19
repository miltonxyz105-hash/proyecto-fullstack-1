import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { buscarCatalogo } from '../api';

const POPULAR_GAMES = [
  { id: 540, title: 'Overwatch 2', genre: 'Shooter', platform: 'PC', thumbnail: 'https://www.freetogame.com/g/540/thumbnail.jpg' },
  { id: 516, title: 'PUBG: BATTLEGROUNDS', genre: 'Shooter', platform: 'PC', thumbnail: 'https://www.freetogame.com/g/516/thumbnail.jpg' },
  { id: 475, title: 'Genshin Impact', genre: 'Action RPG', platform: 'PC', thumbnail: 'https://www.freetogame.com/g/475/thumbnail.jpg' }
];

export default function AddGameModal({ isOpen, onClose, onGameAdded }) {
  const [games, setGames] = useState(POPULAR_GAMES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGames(POPULAR_GAMES);
      setSearch('');
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setGames(POPULAR_GAMES);
      return;
    }

    setLoading(true);
    try {
      const res = await buscarCatalogo(search);
      const resultadosRAWG = res.data.data || [];
      
      const juegosAdaptados = resultadosRAWG.map(j => ({
        id: j.id_externo,
        title: j.nombre,
        genre: j.generos[0] || 'Varios',
        platform: j.plataformas[0] || 'PC',
        thumbnail: j.imagen,
        rawg_data: j
      }));

      setGames(juegosAdaptados);
    } catch (err) {
      console.error('Error al conectar con RAWG:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (e, game) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`Preparando para guardar: ${game.title}`);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        
        <Header>
          <h2>Añadir Juego a la Base de Datos</h2>
          <button onClick={onClose}>✕</button>
        </Header>

        <form onSubmit={handleSearch}>
          <SearchWrapper>
            <div id="poda">
              <div className="glow" />
              <div className="darkBorderBg" />
              <div className="darkBorderBg" />
              <div className="darkBorderBg" />
              <div className="white" />
              <div className="border" />
              <div id="main">
                <input 
                  placeholder="Buscar juegos..." 
                  type="text" 
                  name="text" 
                  className="input" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div id="input-mask" />
                <div id="pink-mask" />
                <div className="filterBorder" />
                
                <button type="submit" id="filter-icon" disabled={loading}>
                  {loading ? (
                    <span style={{color: '#00e5ff', fontSize: '12px'}}>...</span>
                  ) : (
                    <svg preserveAspectRatio="none" height={27} width={27} viewBox="4.8 4.56 14.832 15.408" fill="none">
                      <path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#00e5ff" strokeWidth={1} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                
                <div id="search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} viewBox="0 0 24 24" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" height={24} fill="none">
                    <circle stroke="#007bff" r={8} cy={11} cx={11} />
                    <line stroke="#007bff" y2="16.65" y1={22} x2="16.65" x1={22} />
                  </svg>
                </div>
              </div>
            </div>
          </SearchWrapper>
        </form>

        <GameList>
          {games.length === 0 && !loading && (
            <p className="empty-state">No se encontraron juegos.</p>
          )}
          {games.map((game) => (
            <GamerCard key={game.id}>
              <div className="img-container">
                <img 
                  src={game.thumbnail} 
                  alt={game.title} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/280x160/111/007bff?text=Sin+Imagen'; }}
                />
                <div className="overlay-glow"></div>
              </div>
              
              <div className="card-content">
                <h3>{game.title}</h3>
                <span>{game.genre} • {game.platform}</span>
              </div>

              <div className="action-area">
                <button onClick={(e) => handleAddClick(e, game)}>
                  <span className="btn-text">+ AÑADIR</span>
                  <div className="btn-glitch"></div>
                </button>
              </div>
            </GamerCard>
          ))}
        </GameList>

      </ModalContent>
    </ModalOverlay>
  );
}

// ESTILOS GAMER Y ANIMACIONES
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: #08080c;
  border: 1px solid #1a1a2e;
  border-radius: 16px;
  width: 100%;
  maxWidth: 1000px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 40px rgba(0, 123, 255, 0.15), inset 0 0 20px rgba(0, 229, 255, 0.05);
  color: #fff;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #1a1a2e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #0a0a14 0%, #11111f 100%);
  
  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #fff;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }

  button {
    background: none;
    border: none;
    color: #444;
    font-size: 24px;
    cursor: pointer;
    transition: color 0.3s;
    &:hover { color: #00e5ff; }
  }
`;

const GameList = styled.div`
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #08080c;
  }
  &::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 4px;
  }

  .empty-state {
    text-align: center;
    color: #007bff;
    font-size: 18px;
    padding: 40px 0;
    text-shadow: 0 0 10px rgba(0, 123, 255, 0.4);
  }
`;

const GamerCard = styled.div`
  background-color: #0c0c14;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
  display: flex;
  align-items: stretch;
  min-height: 160px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-3px) scale(1.01);
    border-color: #007bff;
    box-shadow: 0 10px 30px rgba(0, 123, 255, 0.2), 0 0 15px rgba(0, 229, 255, 0.2);
    
    .img-container img {
      transform: scale(1.05);
    }
    .overlay-glow {
      opacity: 1;
    }
  }

  .img-container {
    width: 280px;
    min-width: 280px;
    position: relative;
    overflow: hidden;
    border-right: 1px solid #1a1a2e;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .overlay-glow {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(0, 123, 255, 0.2));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  .card-content {
    padding: 20px 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 2;

    h3 {
      font-size: 24px;
      font-weight: 900;
      margin: 0 0 8px 0;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    span {
      font-size: 14px;
      color: #00e5ff;
      font-weight: 600;
      letter-spacing: 1px;
    }
  }

  .action-area {
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(90deg, transparent, rgba(0, 123, 255, 0.05));
    border-left: 1px solid #1a1a2e;

    button {
      position: relative;
      background: transparent;
      color: #00e5ff;
      border: 1px solid #007bff;
      font-size: 16px;
      font-weight: 800;
      padding: 14px 30px;
      border-radius: 4px;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.3s;
      box-shadow: 0 0 10px rgba(0, 123, 255, 0.2) inset;

      &:hover {
        background: #007bff;
        color: #fff;
        box-shadow: 0 0 20px rgba(0, 123, 255, 0.6), 0 0 40px rgba(0, 123, 255, 0.2) inset;
        border-color: #00e5ff;
      }

      .btn-text {
        position: relative;
        z-index: 2;
      }
    }
  }
`;

// ESTILOS DEL BUSCADOR ANIMADO (Convertidos a Tonos Azules/Ciberpunk)
const SearchWrapper = styled.div`
  padding: 30px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #1a1a2e;
  background: #08080c;

  .white, .border, .darkBorderBg, .glow {
    max-height: 70px;
    max-width: 414px;
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    z-index: -1;
    border-radius: 12px;
    filter: blur(3px);
  }

  .input {
    background-color: #040406;
    border: 1px solid #11111f;
    width: 400px;
    height: 56px;
    border-radius: 10px;
    color: white;
    padding-inline: 59px;
    font-size: 18px;
    transition: border 0.3s;
    &:focus { outline: none; border: 1px solid #007bff; }
    &::placeholder { color: #4a4a6a; }
  }

  #poda {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  #main:focus-within > #input-mask { display: none; }

  #input-mask {
    pointer-events: none;
    width: 100px;
    height: 20px;
    position: absolute;
    background: linear-gradient(90deg, transparent, #040406);
    top: 18px;
    left: 70px;
  }
  
  #pink-mask {
    pointer-events: none;
    width: 30px;
    height: 20px;
    position: absolute;
    background: #007bff;
    top: 10px;
    left: 5px;
    filter: blur(20px);
    opacity: 0.8;
    transition: all 2s;
  }
  #main:hover > #pink-mask { opacity: 0; }

  /* GRADIENTES ACTUALIZADOS A AZUL/CYAN */
  .white::before {
    content: "";
    z-index: -2;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(83deg);
    width: 600px; height: 600px;
    background-image: conic-gradient(transparent 0%, #00e5ff, transparent 8%, transparent 50%, #007bff, transparent 58%);
    transition: all 2s;
  }
  .border::before {
    content: "";
    z-index: -2;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(70deg);
    width: 600px; height: 600px;
    background-image: conic-gradient(#08080c, #0056b3 5%, #08080c 14%, #08080c 50%, #00e5ff 60%, #08080c 64%);
    transition: all 2s;
  }
  .darkBorderBg::before {
    content: "";
    z-index: -2;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(82deg);
    width: 600px; height: 600px;
    background-image: conic-gradient(transparent, #001a4d, transparent 10%, transparent 50%, #004080, transparent 60%);
    transition: all 2s;
  }
  .glow { filter: blur(30px); opacity: 0.4; max-width: 454px; }
  .glow:before {
    content: "";
    z-index: -2;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(60deg);
    width: 999px; height: 999px;
    background-image: conic-gradient(#000, #007bff 5%, #000 38%, #000 50%, #00e5ff 60%, #000 87%);
    transition: all 2s;
  }

  /* ROTACIONES AL HOVER Y FOCUS */
  #poda:hover > .darkBorderBg::before { transform: translate(-50%, -50%) rotate(262deg); }
  #poda:hover > .glow::before { transform: translate(-50%, -50%) rotate(240deg); }
  #poda:hover > .white::before { transform: translate(-50%, -50%) rotate(263deg); }
  #poda:hover > .border::before { transform: translate(-50%, -50%) rotate(250deg); }

  #poda:focus-within > .darkBorderBg::before { transform: translate(-50%, -50%) rotate(442deg); transition: all 4s; }
  #poda:focus-within > .glow::before { transform: translate(-50%, -50%) rotate(420deg); transition: all 4s; }
  #poda:focus-within > .white::before { transform: translate(-50%, -50%) rotate(443deg); transition: all 4s; }
  #poda:focus-within > .border::before { transform: translate(-50%, -50%) rotate(430deg); transition: all 4s; }

  #filter-icon {
    position: absolute;
    top: 8px; right: 8px;
    display: flex; align-items: center; justify-content: center;
    z-index: 2;
    max-height: 40px; max-width: 38px;
    height: 100%; width: 100%;
    border-radius: 10px;
    background: linear-gradient(180deg, #0a0a14, black, #001a4d);
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 0.3s;
    &:hover { background: linear-gradient(180deg, #111122, black, #003366); }
  }
  
  .filterBorder {
    height: 42px; width: 40px;
    position: absolute;
    overflow: hidden;
    top: 7px; right: 7px;
    border-radius: 10px;
  }
  .filterBorder::before {
    content: "";
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    width: 600px; height: 600px;
    background-image: conic-gradient(transparent, #1a1a2e, transparent 50%, transparent 50%, #1a1a2e, transparent 100%);
    animation: rotate 4s linear infinite;
  }
  
  #main { position: relative; }
  #search-icon { position: absolute; left: 20px; top: 15px; }

  @keyframes rotate { 100% { transform: translate(-50%, -50%) rotate(450deg); } }
`;