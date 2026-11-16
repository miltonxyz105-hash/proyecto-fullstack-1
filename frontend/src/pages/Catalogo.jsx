import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { buscarCatalogo } from '../api';

export default function Catalogo() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await buscarCatalogo(query);
      setResultados(res.data.data || []);
    } catch (error) {
      console.error('Error buscando juegos:', error);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <StyledWrapper>
      <div id="form">
        <div id="form-body">
          <div id="welcome-lines">
            <div id="welcome-line-1">Catálogo Mundial</div>
            <div id="welcome-line-2">Buscá entre más de 500,000 juegos</div>
          </div>

          <div id="menu">
            <Link to="/" className="menu-btn">← Volver al Dashboard</Link>
          </div>

          <form onSubmit={handleSearch} className="search-form">
            <input 
              type="text" 
              placeholder="Ej: Counter Strike 2, Elden Ring, Minecraft..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Buscando...' : '🔍 Buscar'}
            </button>
          </form>

          <div className="resultados-grid">
            {!loading && searched && resultados.length === 0 && (
              <p style={{ color: 'white', textAlign: 'center', gridColumn: '1 / -1' }}>
                No se encontraron juegos con ese nombre.
              </p>
            )}

            {resultados.map((juego) => (
              <div key={juego.id_externo} className="game-card">
                {juego.imagen ? (
                  <img src={juego.imagen} alt={juego.nombre} className="game-img" />
                ) : (
                  <div className="game-img-placeholder">Sin imagen</div>
                )}
                <div className="game-info">
                  <h3>{juego.nombre}</h3>
                  <p>📅 {juego.fecha_lanzamiento || 'Sin fecha'}</p>
                  <p>🎮 {juego.generos.join(', ') || 'Varios'}</p>
                  <p>🖥️ {juego.plataformas.slice(0, 3).join(', ')}{juego.plataformas.length > 3 ? '...' : ''}</p>
                  
                  {/* Acá después le agregamos el botón para guardarlo en tu DB */}
                  <button className="add-db-btn" onClick={() => alert('Próximo ticket: Guardar en DB!')}>
                    ➕ Agregar a mi lista
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background-color: #000;
  padding: 20px;

  #form {
    width: 95%;
    max-width: 1000px;
    background-color: #161616;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0px 15px 60px #007bff;
    outline: 1px solid #007bff;
  }

  #form-body { width: 100%; }

  #welcome-lines {
    text-align: center;
    line-height: 1;
    margin-bottom: 30px;
  }

  #welcome-line-1 {
    color: #007bff;
    font-weight: 600;
    font-size: 32px;
  }

  #welcome-line-2 {
    color: #ffffff;
    margin-top: 10px;
    font-size: 16px;
  }

  #menu {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .menu-btn {
    color: #007bff;
    padding: 12px 16px;
    border: 1px solid #007bff;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.3s;
  }

  .menu-btn:hover { background-color: #007bff; color: #161616; }

  .search-form {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
  }

  .search-input {
    flex: 1;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #333;
    background: #1a1a1a;
    color: white;
    font-size: 16px;
  }

  .search-input:focus {
    outline: 1px solid #007bff;
    border-color: #007bff;
  }

  .search-btn {
    padding: 0 25px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .search-btn:hover:not(:disabled) { background: #0056b3; }
  .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .resultados-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .game-card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .game-img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }

  .game-img-placeholder {
    width: 100%;
    height: 160px;
    background: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
  }

  .game-info {
    padding: 15px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .game-info h3 {
    color: #007bff;
    margin: 0 0 10px 0;
    font-size: 18px;
  }

  .game-info p {
    color: #ccc;
    margin: 4px 0;
    font-size: 13px;
  }

  .add-db-btn {
    margin-top: auto;
    padding: 10px;
    background: transparent;
    border: 1px solid #28a745;
    color: #28a745;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
  }

  .add-db-btn:hover {
    background: #28a745;
    color: white;
  }
`;