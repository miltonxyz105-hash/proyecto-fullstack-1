import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  getJuegos,
  createJuego,
  updateJuego,
  deleteJuego,
  agregarFavorito,
} from '../api';

const INITIAL_FORM = {
  nombre: '',
  plataforma: 'PC',
  genero: '',
  estado: 'JUGANDO',
  horas: 0,
  progreso: 0,
  imagen: '',
  platinado: false,
};

export default function Juegos() {
  const [libraryGames, setLibraryGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el modal de Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const filters = ['TODOS', 'JUGANDO', 'COMPLETADO', 'PENDIENTE'];

  useEffect(() => {
    cargarBiblioteca();
  }, []);

  const cargarBiblioteca = async () => {
    try {
      setLoading(true);
      const res = await getJuegos();
      const lista = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setLibraryGames(lista);
    } catch (error) {
      console.error('Error al cargar la biblioteca:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por estado y búsqueda local
  const filteredGames = libraryGames.filter((game) => {
    const estado = (game.estado || game.status || 'PENDIENTE').toUpperCase();
    const titulo = (game.nombre || game.title || '').toLowerCase();
    const coincideEstado = activeFilter === 'TODOS' || estado === activeFilter;
    const coincideBusqueda = titulo.includes(searchTerm.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  // Abrir modal para crear
  const handleAbrirCrear = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleAbrirEditar = (game) => {
    setEditingId(game.id);
    setFormData({
      nombre: game.nombre || game.title || '',
      plataforma: game.plataforma || game.platform || 'PC',
      genero: game.genero || game.generos || game.genre || '',
      estado: (game.estado || game.status || 'JUGANDO').toUpperCase(),
      horas: game.horas ?? game.hours ?? 0,
      progreso: game.progreso ?? game.progress ?? 0,
      imagen: game.imagen || game.cover || '',
      platinado: Boolean(game.platinado),
    });
    setModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleGuardarJuego = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        horas: Number(formData.horas) || 0,
        progreso: Math.min(100, Math.max(0, Number(formData.progreso) || 0)),
      };

      if (editingId) {
        const res = await updateJuego(editingId, payload);
        const actualizado = res.data?.data || res.data || { id: editingId, ...payload };
        setLibraryGames((prev) =>
          prev.map((g) => (g.id === editingId ? { ...g, ...actualizado } : g))
        );
      } else {
        const res = await createJuego(payload);
        const nuevo = res.data?.data || res.data;
        if (nuevo && nuevo.id) {
          setLibraryGames((prev) => [nuevo, ...prev]);
        } else {
          await cargarBiblioteca();
        }
      }

      setModalOpen(false);
      setFormData(INITIAL_FORM);
      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar el juego:', error);
      alert('No se pudo guardar el juego. Revisá los campos o tu sesión.');
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarFavorito = async (game) => {
    try {
      await agregarFavorito({ juego_id: game.id });
      alert(`"${game.nombre || game.title}" agregado a tus favoritos.`);
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      alert('No se pudo agregar a favoritos (puede que ya esté agregado).');
    }
  };

  const handleEliminar = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar "${titulo}" definitivamente de tu biblioteca?`)) return;

    try {
      await deleteJuego(id);
      setLibraryGames((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error('Error al eliminar juego:', error);
      alert('No se pudo eliminar el juego.');
    }
  };

  return (
    <LibraryWrapper>
      <div className="bg-grid"></div>

      <Header>
        <div className="top-row">
          <div className="title-area">
            <h1>Mi Biblioteca</h1>
            <p>Explora tu colección completa de {libraryGames.length} juegos</p>
          </div>

          <CreateButton onClick={handleAbrirCrear}>
            + AGREGAR JUEGO MANUAL
          </CreateButton>
        </div>

        <ControlsRow>
          <FilterContainer>
            {filters.map((filter) => (
              <FilterButton
                key={filter}
                className={activeFilter === filter ? 'active' : ''}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
                {activeFilter === filter && <div className="glow-line"></div>}
              </FilterButton>
            ))}
          </FilterContainer>

          <SearchInput
            type="text"
            placeholder="Filtrar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </ControlsRow>
      </Header>

      {loading ? (
        <div className="empty-state">Sincronizando biblioteca con el servidor...</div>
      ) : (
        <LibraryGrid>
          {filteredGames.map((game) => {
            const titulo = game.nombre || game.title || 'Sin título';
            const plataforma = game.plataforma || game.platform || 'PC';
            const genero = game.genero || game.generos || game.genre || 'Varios';
            const estado = (game.estado || game.status || 'PENDIENTE').toUpperCase();
            const cover =
              game.imagen ||
              game.cover ||
              `https://via.placeholder.com/300x400/1a1a2e/00e5ff?text=${encodeURIComponent(titulo)}`;

            return (
              <GamePoster key={game.id}>
                <div className="poster-image">
                  <img
                    src={cover}
                    alt={titulo}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x400/1a1a2e/00e5ff?text=${encodeURIComponent(titulo)}`;
                    }}
                  />
                  <div className="scanlines"></div>
                </div>

                <div className="status-badge" data-status={estado}>
                  {estado}
                </div>

                <div className="info-overlay">
                  <div className="content">
                    <h3>{titulo}</h3>
                    <div className="tags">
                      <span className="tag">{plataforma}</span>
                      <span className="tag dot">•</span>
                      <span className="tag">{genero}</span>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="play-btn"
                        title="Editar juego"
                        onClick={() => handleAbrirEditar(game)}
                      >
                        EDITAR
                      </button>
                      <button
                        className="fav-btn"
                        title="Agregar a Favoritos"
                        onClick={() => handleAgregarFavorito(game)}
                      >
                        ♥
                      </button>
                      <button
                        className="del-btn"
                        title="Eliminar juego"
                        onClick={() => handleEliminar(game.id, titulo)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </GamePoster>
            );
          })}

          {filteredGames.length === 0 && (
            <div className="empty-state">
              No se encontraron juegos en esta categoría.
            </div>
          )}
        </LibraryGrid>
      )}

      {/* MODAL CYBERPUNK PARA CREAR / EDITAR JUEGO */}
      {modalOpen && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Editar Registro' : 'Nuevo Juego Manual'}</h2>

            <form onSubmit={handleGuardarJuego}>
              <div className="field">
                <label>Nombre del juego *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Elden Ring"
                />
              </div>

              <div className="row-2">
                <div className="field">
                  <label>Plataforma</label>
                  <input
                    type="text"
                    value={formData.plataforma}
                    onChange={(e) => setFormData({ ...formData, plataforma: e.target.value })}
                    placeholder="Steam, PS5, Xbox..."
                  />
                </div>

                <div className="field">
                  <label>Género</label>
                  <input
                    type="text"
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    placeholder="RPG, Shooter, Acción..."
                  />
                </div>
              </div>

              <div className="row-3">
                <div className="field">
                  <label>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="JUGANDO">JUGANDO</option>
                    <option value="COMPLETADO">COMPLETADO</option>
                    <option value="PENDIENTE">PENDIENTE</option>
                  </select>
                </div>

                <div className="field">
                  <label>Horas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.horas}
                    onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Progreso (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progreso}
                    onChange={(e) => setFormData({ ...formData, progreso: e.target.value })}
                  />
                </div>
              </div>

              <div className="field">
                <label>URL de Portada (opcional)</label>
                <input
                  type="text"
                  value={formData.imagen}
                  onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formData.platinado}
                  onChange={(e) => setFormData({ ...formData, platinado: e.target.checked })}
                />
                <span>Juego Platinado 🏆</span>
              </label>

              <div className="modal-actions">
                <button type="button" className="cancel" onClick={() => setModalOpen(false)}>
                  CANCELAR
                </button>
                <button type="submit" className="save" disabled={saving}>
                  {saving ? 'GUARDANDO...' : 'GUARDAR'}
                </button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </LibraryWrapper>
  );
}

// --- ANIMACIONES ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- ESTILOS ---
const LibraryWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
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
    mask-image: radial-gradient(circle at top, black, transparent 80%);
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px;
    color: #4a4a6a;
    font-size: 18px;
    border: 1px dashed rgba(0, 229, 255, 0.2);
    border-radius: 16px;
  }
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 40px;

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 20px;
  }

  .title-area {
    h1 {
      font-size: 48px;
      font-weight: 900;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #fff;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.4), 0 0 10px rgba(138, 43, 226, 0.4);
    }
    p {
      margin: 5px 0 0 0;
      color: #4a4a6a;
      font-size: 16px;
      letter-spacing: 1px;
    }
  }
`;

const CreateButton = styled.button`
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid #00e5ff;
  color: #00e5ff;
  padding: 12px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #00e5ff;
    color: #040406;
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
  }
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  background: rgba(10, 10, 20, 0.6);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 229, 255, 0.1);
  width: fit-content;
  backdrop-filter: blur(10px);
`;

const FilterButton = styled.button`
  background: transparent;
  border: none;
  color: #4a4a6a;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  text-transform: uppercase;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: #00e5ff;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }

  .glow-line {
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #00e5ff;
    box-shadow: 0 0 15px 2px rgba(0, 229, 255, 0.7);
    animation: ${fadeIn} 0.3s ease forwards;
  }
`;

const SearchInput = styled.input`
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid #1a1a2e;
  color: #fff;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 14px;
  min-width: 240px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #00e5ff;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
  }
`;

const LibraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
`;

const GamePoster = styled.div`
  position: relative;
  aspect-ratio: 3/4;
  background: #0a0a14;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  animation: ${fadeIn} 0.5s ease-out forwards;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: #00e5ff;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 229, 255, 0.2) inset;

    .info-overlay {
      transform: translateY(0);
      opacity: 1;
    }

    .poster-image img {
      transform: scale(1.1);
      filter: brightness(0.5) saturate(1.2);
    }
  }

  .poster-image {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.5s ease;
    }

    .scanlines {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.1) 50%,
        rgba(0,0,0,0.1)
      );
      background-size: 100% 4px;
      z-index: 1;
      pointer-events: none;
      opacity: 0.5;
    }
  }

  .status-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    font-size: 10px;
    font-weight: 900;
    padding: 4px 8px;
    border-radius: 4px;
    letter-spacing: 1px;
    backdrop-filter: blur(4px);
    
    &[data-status="JUGANDO"] {
      background: rgba(0, 229, 255, 0.15);
      color: #00e5ff;
      border: 1px solid rgba(0, 229, 255, 0.3);
    }
    &[data-status="COMPLETADO"] {
      background: rgba(138, 43, 226, 0.15);
      color: #b57cff;
      border: 1px solid rgba(138, 43, 226, 0.3);
    }
    &[data-status="PENDIENTE"] {
      background: rgba(255, 255, 255, 0.1);
      color: #b0b0c0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  }

  .info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 65%;
    background: linear-gradient(0deg, rgba(4,4,6,1) 0%, rgba(4,4,6,0.88) 65%, transparent 100%);
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 20px;
    transform: translateY(100%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1);

    .content {
      transform: translateY(10px);
      transition: transform 0.4s ease;
    }
  }

  &:hover .info-overlay .content {
    transform: translateY(0);
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 19px;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }

  .tags {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;

    .tag {
      font-size: 11px;
      color: #00e5ff;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.dot {
        color: #4a4a6a;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;

    button {
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s;
      font-weight: 700;
    }

    .play-btn {
      flex: 1;
      background: rgba(0, 123, 255, 0.2);
      border: 1px solid #007bff;
      color: #00e5ff;
      padding: 9px;
      font-size: 11px;
      letter-spacing: 1px;

      &:hover {
        background: #007bff;
        color: #fff;
        border-color: #00e5ff;
        box-shadow: 0 0 15px rgba(0, 123, 255, 0.5);
      }
    }

    .fav-btn {
      width: 36px;
      background: rgba(255, 0, 85, 0.1);
      border: 1px solid rgba(255, 0, 85, 0.3);
      color: #ff0055;
      font-size: 15px;

      &:hover {
        background: #ff0055;
        color: #fff;
      }
    }

    .del-btn {
      width: 36px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #b0b0c0;
      font-size: 13px;

      &:hover {
        background: #ff0055;
        border-color: #ff0055;
        color: #fff;
      }
    }
  }
`;

// --- ESTILOS DEL MODAL ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: #0a0a14;
  border: 1px solid #00e5ff;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 500px;

  h2 {
    margin: 0 0 20px 0;
    color: #00e5ff;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-size: 22px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .row-3 {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr;
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-size: 12px;
      color: #8a8aa8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    input, select {
      background: #11111f;
      border: 1px solid #1a1a2e;
      color: #fff;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #00e5ff;
      }
    }
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: #ffd700;
    margin-top: 4px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 10px;

    button {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: 1px;
    }

    .cancel {
      background: transparent;
      border: 1px solid #2a2a44;
      color: #8a8aa8;
      &:hover { color: #fff; border-color: #fff; }
    }

    .save {
      background: #007bff;
      border: 1px solid #00e5ff;
      color: #fff;
      &:hover { background: #00e5ff; color: #040406; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }
`;