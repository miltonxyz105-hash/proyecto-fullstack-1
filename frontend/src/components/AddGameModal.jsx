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
    padding: '20px'
  },
  modal: {
    backgroundColor: '#121212',
    border: '1px solid #333',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '1000px', // Más ancho para que respire
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 15px 50px rgba(0,0,0,0.9)',
    color: '#fff',
    overflow: 'hidden'
  },
  header: {
    padding: '24px',
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
    fontSize: '24px',
    cursor: 'pointer'
  },
  searchBox: {
    padding: '20px 24px',
    borderBottom: '1px solid #222',
    backgroundColor: '#161616'
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '16px',
    fontSize: '16px',
    outline: 'none',
  },
  searchBtn: {
    backgroundColor: '#007bff', // Azul para destacar la búsqueda
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0 25px',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  listContainer: {
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px' // Mucho más espacio entre cada juego
  },
  cardHorizontal: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
    minHeight: '160px', // ESTO EVITA QUE SE APLASTEN
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  },
  image: {
    width: '280px', // Portada más grande
    minWidth: '280px', // Evita que se encoja la imagen
    height: '160px',
    objectFit: 'cover', // Mantiene la proporción sin deformar
    borderRight: '1px solid #333'
  },
  cardContent: {
    padding: '20px 24px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  cardTitle: {
    color: '#fff',
    fontSize: '24px', // Letra mucho más grande
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    lineHeight: '1.2'
  },
  genreText: {
    fontSize: '15px',
    color: '#aaa',
  },
  actionArea: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: '1px solid #222', // Separador sutil para el botón
    backgroundColor: '#161616'
  },
  addBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    fontSize: '18px', // Botón más grande
    fontWeight: 'bold',
    padding: '14px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
  }
};