import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getMisFavoritos, agregarFavorito, eliminarFavorito, getJuegos } from '../api';

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJuego, setSelectedJuego] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [favRes, juegosRes] = await Promise.all([getMisFavoritos(), getJuegos()]);
      setFavoritos(favRes.data.data);
      setJuegos(juegosRes.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!selectedJuego) return;
    try {
      await agregarFavorito({ juego_id: selectedJuego });
      loadData();
      closeModal();
    } catch (error) {
      console.error('Error al agregar favorito:', error);
    }
  };

  const handleEliminar = async (juegoId) => {
    if (window.confirm('¿Estás seguro de quitar este juego de favoritos?')) {
      try {
        await eliminarFavorito(juegoId);
        loadData();
      } catch (error) {
        console.error('Error al eliminar favorito:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJuego('');
  };

  const getJuego = (juegoId) => {
    return juegos.find(j => j.id === juegoId);
  };

  const juegosNoFavoritos = juegos.filter(juego => 
    !favoritos.some(fav => fav.juego_id === juego.id)
  );

  return (
    <StyledWrapper>
      <div id="form">
        <div id="form-body">
          <div id="welcome-lines">
            <div id="welcome-line-1">Mis Favoritos</div>
            <div id="welcome-line-2">Tus juegos preferidos</div>
          </div>

          <div id="menu">
            <Link to="/" className="menu-btn">← Volver al Dashboard</Link>
            <button id="add-btn" onClick={() => setShowModal(true)}>
              ➕ Agregar Favorito
            </button>
          </div>

          <div id="favoritos-list">
            {loading ? (
              <p style={{ color: 'white', textAlign: 'center' }}>Cargando...</p>
            ) : favoritos.length === 0 ? (
              <p style={{ color: 'white', textAlign: 'center' }}>No tienes favoritos aún. ¡Agrega uno!</p>
            ) : (
              favoritos.map(fav => {
                const juego = getJuego(fav.juego_id);
                return (
                  <div key={fav.id} className="favorito-card">
                    <div className="favorito-info">
                      <h3>{juego ? juego.nombre : 'Juego no encontrado'}</h3>
                      {juego && (
                        <p>🎮 {juego.genero} | 🖥️ {juego.plataforma}</p>
                      )}
                    </div>
                    <button className="delete-btn" onClick={() => handleEliminar(fav.juego_id)}>💔</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Agregar a Favoritos</h2>
            <form onSubmit={handleAgregar}>
              <select value={selectedJuego} onChange={(e) => setSelectedJuego(e.target.value)} required>
                <option value="">Selecciona un juego</option>
                {juegosNoFavoritos.map(juego => (
                  <option key={juego.id} value={juego.id}>{juego.nombre}</option>
                ))}
              </select>
              <div className="modal-buttons">
                <button type="submit" className="save-btn" disabled={!selectedJuego}>Agregar</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancelar</button>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
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
    width: 90%;
    max-width: 600px;
    background-color: #161616;
    padding: 25px;
    border-radius: 10px;
    position: relative;
    box-shadow: 0px 15px 60px #007bff;
    outline: 1px solid #007bff;
  }

  #form-body {
    width: 100%;
  }

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

  .menu-btn, #add-btn {
    flex: 1;
    color: #007bff;
    padding: 12px 16px;
    border: 1px solid #007bff;
    border-radius: 8px;
    text-decoration: none;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .menu-btn:hover, #add-btn:hover {
    background-color: #007bff;
    color: #161616;
  }

  #favoritos-list {
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .favorito-card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .favorito-info h3 {
    color: #007bff;
    margin: 0 0 8px 0;
    font-size: 18px;
  }

  .favorito-info p {
    color: #ccc;
    margin: 4px 0;
    font-size: 13px;
  }

  .delete-btn {
    background: transparent;
    border: 1px solid #dc3545;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 16px;
    color: #dc3545;
    transition: background-color 0.3s ease;
  }

  .delete-btn:hover {
    background: #dc3545;
    color: #161616;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #161616;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0px 15px 60px #007bff;
  outline: 1px solid #007bff;

  h2 {
    color: #007bff;
    text-align: center;
    margin-top: 0;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  select {
    width: 100%;
    padding: 12px;
    border: 1px solid #333;
    border-radius: 8px;
    background: #1a1a1a;
    color: white;
    font-size: 14px;
    box-sizing: border-box;
  }

  select:focus {
    outline: 1px solid #007bff;
    border-color: #007bff;
  }

  .modal-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .save-btn, .cancel-btn {
    flex: 1;
    padding: 12px;
    border: 1px solid;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .save-btn {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  .save-btn:hover:not(:disabled) {
    background: #0056b3;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: transparent;
    color: #dc3545;
    border-color: #dc3545;
  }

  .cancel-btn:hover {
    background: #dc3545;
    color: white;
  }
`;
