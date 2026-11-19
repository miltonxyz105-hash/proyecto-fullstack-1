import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { buscarCatalogo } from '../api';
import axios from 'axios';

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

  // Función para guardar el juego en Supabase (Próximo paso en el backend)
  const guardarEnMisJuegos = async (juego) => {
    try {
      // Tomamos el ID del usuario si lo tenés guardado (ajustá esto según tu auth)
      const usuario_id = localStorage.getItem("usuario_id") || "ID_TEST"; 

      // Alerta temporal hasta que armemos la ruta en el backend
      alert(`Preparando para guardar: \${juego.nombre}. \n¡Falta crear la ruta en el backend!`);
      
      /* ESTE SERÁ EL CÓDIGO REAL:
      await axios.post("https://TU_BACKEND_EN_RENDER.onrender.com/juegos/guardar", {
        id_externo: juego.id_externo,
        nombre: juego.nombre,
        imagen: juego.imagen,
        generos: juego.generos.join(", "),
        plataforma: juego.plataformas[0] || "PC",
        usuario_id: usuario_id
      });
      alert("¡Juego guardado en tu perfil!");
      */
    } catch (error) {
      console.error("Error al guardar el juego:", error);
      alert("Hubo un error al guardar el juego.");
    }
  };

  return (
    <StyledWrapper>
      <div id="form">
        <div id="form-body">
          <div id="welcome-lines">
            <div id="welcome-line-1">Catálogo Mundial </div>
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

          <div className="resultados-list">
            {!loading && searched && resultados.length === 0 && (
              <p style={{ color: 'white', textAlign: 'center' }}>
                No se encontraron juegos con ese nombre.
              </p>
            )}

            {resultados.map((juego) => (
              <div key={juego.id_externo} className="game-card-horizontal">
                {juego.imagen ? (
                  <img src={juego.imagen} alt={juego.nombre} className="game-img-horizontal" />
                ) : (
                  <div className="game-img-placeholder-horizontal">Sin imagen</div>
                )}
                
                <div className="game-info-horizontal">
                  <h3>{juego.nombre}</h3>
                  <p className="game-genres">{juego.generos.join(', ') || 'Varios'}</p>
                </div>
                
                <div className="game-actions">
                  <button className="add-db-btn" onClick={() => guardarEnMisJuegos(juego)}>
                    ➕ Añadir a mi lista
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

  #welcome-line-1 { color: #007bff; font-weight: 600; font-size: 32px; }
  #welcome-line-2 { color: #ffffff; margin-top: 10px; font-size: 16px; }

  #menu { display: flex; gap: 10px; margin-bottom: 20px; }

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

  .search-form { display: flex; gap: 10px; margin-bottom: 30px; }

  .search-input {
    flex: 1;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #333;
    background: #1a1a1a;
    color: white;
    font-size: 16px;
  }
  .search-input:focus { outline: 1px solid #007bff; border-color: #007bff; }

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

  /* NUEVOS ESTILOS PARA LA LISTA HORIZONTAL */
  .resultados-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .game-card-horizontal {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    transition: border-color 0.3s;
  }
  
  .game-card-horizontal:hover {
    border-color: #007bff;
  }

  .game-img-horizontal {
    width: 250px;
    height: 140px;
    object-fit: cover;
  }

  .game-img-placeholder-horizontal {
    width: 250px;
    height: 140px;
    background: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
  }

  .game-info-horizontal {
    padding: 15px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
  }

  .game-info-horizontal h3 {
    color: #fff;
    margin: 0 0 5px 0;
    font-size: 20px;
  }

  .game-genres {
    color: #888;
    margin: 0;
    font-size: 14px;
  }

  .game-actions {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid #333;
  }

  .add-db-btn {
    padding: 10px 20px;
    background: transparent;
    border: 1px solid #28a745;
    color: #28a745;
    border;}
`;
