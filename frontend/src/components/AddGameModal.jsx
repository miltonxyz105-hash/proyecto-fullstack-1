import { useCallback, useEffect, useState } from 'react';

import { getGamesCatalog } from '../api';
import { getApiErrorMessage } from '../utils/apiError';

/**
 * Buscador del catálogo de juegos.
 * El catálogo vive únicamente en el backend (`/games`): aquí no hay datos
 * duplicados, y si la API falla se muestra un error recuperable.
 */
export default function AddGameModal({ isOpen, onClose, onGameAdded }) {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = useCallback(async () => {
    try {
      const res = await getGamesCatalog();
      const data = Array.isArray(res.data) ? res.data : [];
      setGames(data);
      setError(data.length === 0 ? 'El catálogo está vacío en este momento.' : null);
    } catch (err) {
      console.error('Error al cargar el catálogo:', err);
      setGames([]);
      setError(
        getApiErrorMessage(err, 'No se pudo conectar con el catálogo de juegos.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    async function cargar() {
      await fetchGames();
    }
    cargar();

    return undefined;
  }, [isOpen, fetchGames]);

  if (!isOpen) return null;

  const filteredGames = games.filter((game) =>
    game.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClick = (event, game) => {
    event.preventDefault();
    event.stopPropagation();
    onGameAdded(game);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose} role="presentation">
      <div
        style={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Catálogo de juegos"
      >
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Catálogo de Juegos</h2>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div style={styles.searchBox}>
          <input
            type="search"
            placeholder="Buscar por nombre (ej: Overwatch, PUBG, Genshin)..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={styles.input}
            aria-label="Buscar en el catálogo"
          />
        </div>

        <div style={styles.grid}>
          {loading ? (
            <p style={styles.mensaje}>Cargando catálogo...</p>
          ) : error ? (
            <div style={{ ...styles.mensaje, textAlign: 'center' }}>
              <p style={{ color: '#ff6b81' }}>⚠️ {error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  fetchGames();
                }}
                style={styles.retryBtn}
              >
                Reintentar
              </button>
            </div>
          ) : filteredGames.length === 0 ? (
            <p style={styles.mensaje}>
              No se encontraron juegos con ese título.
            </p>
          ) : (
            filteredGames.map((game) => (
              <div key={game.id} style={styles.card}>
                {game.thumbnail ? (
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    style={styles.image}
                    loading="lazy"
                    width="220"
                    height="130"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ ...styles.image, ...styles.sinImagen }}>🎮</div>
                )}
                <div style={styles.cardContent}>
                  <div>
                    <h3 style={styles.cardTitle} title={game.title}>
                      {game.title}
                    </h3>
                    <span style={styles.genreBadge}>{game.genre || 'Juego'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => handleAddClick(event, game)}
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
    padding: '16px',
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
    color: '#fff',
    overflow: 'hidden',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #222',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#007bff',
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '20px',
    cursor: 'pointer',
  },
  searchBox: {
    padding: '16px',
    borderBottom: '1px solid #222',
  },
  input: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  grid: {
    padding: '20px',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    alignContent: 'start',
  },
  mensaje: {
    color: '#888',
    textAlign: 'center',
    gridColumn: '1 / -1',
    padding: '40px 0',
    margin: 0,
  },
  retryBtn: {
    marginTop: '12px',
    background: 'transparent',
    border: '1px solid #dc3545',
    color: '#dc3545',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #252542',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
    height: '130px',
    objectFit: 'cover',
    pointerEvents: 'none',
  },
  sinImagen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    backgroundColor: '#12122b',
  },
  cardContent: {
    padding: '12px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 6px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  genreBadge: {
    fontSize: '11px',
    color: '#007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block',
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
    cursor: 'pointer',
  },
};
