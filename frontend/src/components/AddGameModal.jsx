import { useState, useEffect } from 'react';
import { buscarCatalogo } from '../api'; // Importamos la conexión a RAWG

// Lista por defecto cuando el buscador está vacío
const POPULAR_GAMES = [
  { id: 540, title: 'Overwatch 2', genre: 'Shooter', platform: 'PC', thumbnail: 'https://www.freetogame.com/g/540/thumbnail.jpg' },
  { id: 516, title: 'PUBG: BATTLEGROUNDS', genre: 'Shooter', platform: 'PC', thumbnail: 'https://www.freetogame.com/g/516/thumbnail.jpg' },
  { id: 475, title: 'Genshin Impact', genre: 'Action RPG', platform: 'PC', thumbnail: 'https://www.freetogame.com/g/475/thumbnail.jpg' },
  { id: 523, title: 'Fall Guys', genre: 'Battle Royale', platform: 'PC', thumbnail: 'https://www.freetogame.com/g/523/thumbnail.jpg' }
];

export default function AddGameModal({ isOpen, onClose, onGameAdded }) {
  const [games, setGames] = useState(POPULAR_GAMES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Reiniciar la lista cuando se abre el modal
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
      // Llamamos a RAWG a través de tu backend
      const res = await buscarCatalogo(search);
      const resultadosRAWG = res.data.data || [];
      
      // Adaptamos los datos de RAWG para que encajen en las tarjetas de tu modal
      const juegosAdaptados = resultadosRAWG.map(j => ({
        id: j.id_externo,
        title: j.nombre,
        genre: j.generos[0] || 'Varios', // Toma el primer género
        platform: j.plataformas[0] || 'PC', // Toma la primera plataforma
        thumbnail: j.imagen,
        rawg_data: j // Guardamos toda la info por si la necesitamos al agregar
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
    onGameAdded(game);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera */}
        <div style={styles.header}>
          <h2 style={{ color: '#007bff', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            Catálogo Mundial RAWG
          </h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Buscador */}
        <form onSubmit={handleSearch} style={styles.searchBox}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Buscar cualquier juego (Ej: Elden Ring, Minecraft)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.searchBtn} disabled={loading}>
              🔍
            </button>
          </div>
        </form>

        {/* Tarjetas de Juegos */}
        <div style={styles.grid}>
          {loading ? (
            <p style={{ color: '#007bff', textAlign: 'center', gridColumn: '1 / -1', padding: '40px 0' }}>
              Buscando en RAWG...
            </p>
          ) : games.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', gridColumn: '1 / -1', padding: '40px 0' }}>
              No se encontraron juegos con ese título
            </p>
          ) : (
            games.map((game) => (
              <div key={game.id} style={styles.card}>
                <img 
                  src={game.thumbnail} 
                  alt={game.title} 
                  style={styles.image}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x160?text=Sin+Imagen';
                  }}
                />
                <div style={styles.cardContent}>
                  <div>
                    <h3 style={styles.cardTitle} title={game.title}>{game.title}</h3>
                    <span style={styles.genreBadge}>{game.genre}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleAddClick(e, game)}
                    style={styles.addBtn}
                  >
                    + Añadir a Mis Juegos
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
    backgroundColor: '#141414',
    border: '1px solid #007bff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '850px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    color: '#fff',
    overflow: 'hidden'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #222',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '20px',
    cursor: 'pointer'
  },
  searchBox: {
    padding: '16px',
    borderBottom: '1px solid #222'
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  searchBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0 20px',
    cursor: 'pointer'
  },
  grid: {
    padding: '20px',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    alignContent: 'start'
  },
  card: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #252542',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  image: {
    width: '100%',
    height: '130px',
    objectFit: 'cover',
    pointerEvents: 'none'
  },
  cardContent: {
    padding: '12px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 6px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  genreBadge: {
    fontSize: '11px',
    color: '#007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block'
  },
  addBtn: {
    marginTop: '12px',
    width: '100%',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    padding: '10px 0',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};