import { useState, useEffect } from 'react';
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
    // Alerta temporal hasta que conectemos el backend
    alert(`Preparando para guardar: ${game.title}`);
    // onGameAdded(game);
    // onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <div style={styles.header}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            Añadir Juego
          </h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSearch} style={styles.searchBox}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Buscar (Ej: Counter Strike, Elden Ring)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.searchBtn} disabled={loading}>
              {loading ? '...' : '🔍'}
            </button>
          </div>
        </form>

        {/* LISTA HORIZONTAL */}
        <div style={styles.listContainer}>
          {loading ? (
            <p style={{ color: '#007bff', textAlign: 'center', padding: '40px 0' }}>Buscando...</p>
          ) : games.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>No se encontraron juegos.</p>
          ) : (
            games.map((game) => (
              <div key={game.id} style={styles.cardHorizontal}>
                <img 
                  src={game.thumbnail} 
                  alt={game.title} 
                  style={styles.image}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/250x140?text=Sin+Imagen';
                  }}
                />
                
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle} title={game.title}>{game.title}</h3>
                  <span style={styles.genreText}>{game.genre} • {game.platform}</span>
                </div>

                <div style={styles.actionArea}>
                  <button
                    type="button"
                    onClick={(e) => handleAddClick(e, game)}
                    style={styles.addBtn}
                  >
                    + Añadir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  modal: {
    backgroundColor: '#121212', // Fondo más oscuro
    border: '1px solid #222',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '900px', // Un poco más ancho para la lista
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
    color: '#fff',
    overflow: 'hidden'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #222',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161616'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '20px',
    cursor: 'pointer'
  },
  searchBox: {
    padding: '16px',
    borderBottom: '1px solid #222',
    backgroundColor: '#161616'
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
  },
  searchBtn: {
    backgroundColor: '#333',
    color: 'white',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '0 20px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  listContainer: {
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column', // ACÁ ESTÁ LA MAGIA DE LA LISTA HORIZONTAL
    gap: '12px'
  },
  cardHorizontal: {
    backgroundColor: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    overflow: 'hidden',
    display: 'flex', // Elementos uno al lado del otro
    transition: 'border-color 0.2s',
  },
  image: {
    width: '240px', // Apaisada como en tu foto
    height: '135px',
    objectFit: 'cover',
    borderRight: '1px solid #2a2a2a'
  },
  cardContent: {
    padding: '16px',
    flex: 1, // Ocupa el espacio del medio
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  cardTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  genreText: {
    fontSize: '13px',
    color: '#aaa',
  },
  actionArea: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: '#28a745', // Botón verde
    color: '#fff',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '10px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  }
};