import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  getMisReviews,
  getJuegos,
  createReview,
  updateReview,
  deleteReview,
} from '../api';

const INITIAL_FORM = {
  juego_id: '',
  puntaje: 5,
  texto: '',
};

export default function Reviews() {
  const [reviewsData, setReviewsData] = useState([]);
  const [misJuegos, setMisJuegos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del modal de Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resReviews, resJuegos] = await Promise.all([
        getMisReviews(),
        getJuegos(),
      ]);

      const listaReviews = Array.isArray(resReviews.data)
        ? resReviews.data
        : resReviews.data?.data || [];
      const listaJuegos = Array.isArray(resJuegos.data)
        ? resJuegos.data
        : resJuegos.data?.data || [];

      setReviewsData(listaReviews);
      setMisJuegos(listaJuegos);
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Color neón según escala 1 a 5 de tu tabla SQL
  const getScoreColor = (score) => {
    const val = Number(score) || 0;
    if (val >= 5) return '#00e5ff'; // Cyan para obra maestra (5/5)
    if (val >= 4) return '#00ff88'; // Verde neón para muy bueno (4/5)
    if (val >= 3) return '#ffaa00'; // Naranja para regular (3/5)
    return '#ff0055'; // Rojo para malo (1-2/5)
  };

  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return 'SIN FECHA';
    const d = new Date(fechaRaw);
    if (isNaN(d.getTime())) return String(fechaRaw);
    return d.toLocaleDateString('es-AR');
  };

  const handleAbrirCrear = () => {
    setEditingId(null);
    const primerJuego = misJuegos[0];
    setFormData({
      juego_id: primerJuego ? String(primerJuego.id) : '',
      puntaje: 5,
      texto: '',
    });
    setModalOpen(true);
  };

  const handleAbrirEditar = (review) => {
    const juego = review.juegos || {};
    setEditingId(review.id);
    setFormData({
      juego_id: String(review.juego_id || juego.id || ''),
      puntaje: review.puntaje ?? 5,
      texto: review.texto || '',
    });
    setModalOpen(true);
  };

  const handleGuardarReview = async (e) => {
    e.preventDefault();
    if (!formData.texto.trim()) return;
    if (!formData.juego_id) {
      alert('Primero debés tener al menos un juego en tu biblioteca para reseñarlo.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        juego_id: Number(formData.juego_id) || formData.juego_id,
        puntaje: Math.min(5, Math.max(1, Math.round(Number(formData.puntaje) || 1))),
        texto: formData.texto.trim(),
      };

      if (editingId) {
        await updateReview(editingId, payload);
      } else {
        await createReview(payload);
      }

      await cargarDatos();
      setModalOpen(false);
      setFormData(INITIAL_FORM);
      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar el análisis:', error);
      alert('No se pudo guardar el análisis. Revisá los datos o tu sesión.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar definitivamente tu reseña de "${titulo}"?`)) return;

    try {
      await deleteReview(id);
      setReviewsData((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      alert('No se pudo eliminar la reseña.');
    }
  };

  return (
    <ReviewsWrapper>
      <div className="bg-grid"></div>

      <Header>
        <div className="title-area">
          <h1>Análisis & Reseñas</h1>
          <p>Tus veredictos y registros de juego</p>
        </div>
        <NewReviewButton onClick={handleAbrirCrear}>
          <span className="btn-text">+ NUEVO ANÁLISIS</span>
        </NewReviewButton>
      </Header>

      {loading ? (
        <EmptyState>Descifrando registros de análisis...</EmptyState>
      ) : reviewsData.length === 0 ? (
        <EmptyState>
          Todavía no escribiste ningún análisis. Hacé clic en{' '}
          <strong>+ NUEVO ANÁLISIS</strong> para registrar tu primer veredicto.
        </EmptyState>
      ) : (
        <ReviewsGrid>
          {reviewsData.map((review) => {
            const juegoRelacionado =
              review.juegos ||
              misJuegos.find((j) => String(j.id) === String(review.juego_id)) ||
              {};

            const gameTitle =
              juegoRelacionado.nombre ||
              juegoRelacionado.title ||
              'Juego Registrado';
            const image =
              juegoRelacionado.imagen ||
              `https://via.placeholder.com/150/111/00e5ff?text=${encodeURIComponent(gameTitle)}`;
            const score = review.puntaje ?? 0;
            const date = formatearFecha(review.created_at);
            const hoursPlayed = juegoRelacionado.horas ?? 0;
            const recommended = Number(score) >= 3;
            const text = review.texto || '';

            return (
              <ReviewCard key={review.id} $scoreColor={getScoreColor(score)}>
                <div className="card-header">
                  <div className="game-art">
                    <img
                      src={image}
                      alt={gameTitle}
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/150/111/00e5ff?text=HUD';
                      }}
                    />
                    <div className="art-overlay"></div>
                  </div>

                  <div className="header-info">
                    <h2>{gameTitle}</h2>
                    <div className="meta-data">
                      <span className="terminal-text">
                        REGISTRO_{review.id} // {date}
                      </span>
                    </div>
                  </div>

                  <div className="score-hexagon">
                    <div className="hex-inner">
                      <span className="score-value">{score}/5</span>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="quote-icon">"</div>
                  <p>{text}</p>
                </div>

                <div className="card-footer">
                  <div className="hours-logged">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{hoursPlayed} HRS REGISTRADAS</span>
                  </div>

                  <div className="footer-right">
                    <div className={`recommendation ${recommended ? 'yes' : 'no'}`}>
                      {recommended ? (
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

                    <ActionMiniBtn
                      title="Editar análisis"
                      onClick={() => handleAbrirEditar(review)}
                    >
                      ✎
                    </ActionMiniBtn>
                    <ActionMiniBtn
                      className="danger"
                      title="Eliminar análisis"
                      onClick={() => handleEliminar(review.id, gameTitle)}
                    >
                      ✕
                    </ActionMiniBtn>
                  </div>
                </div>
              </ReviewCard>
            );
          })}
        </ReviewsGrid>
      )}

      {/* MODAL PARA CREAR / EDITAR ANÁLISIS */}
      {modalOpen && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Editar Análisis' : 'Nuevo Análisis'}</h2>

            <form onSubmit={handleGuardarReview}>
              <div className="field">
                <label>Juego de tu biblioteca *</label>
                <select
                  required
                  value={formData.juego_id}
                  disabled={Boolean(editingId)}
                  onChange={(e) =>
                    setFormData({ ...formData, juego_id: e.target.value })
                  }
                >
                  {misJuegos.length === 0 ? (
                    <option value="">No tenés juegos cargados aún</option>
                  ) : (
                    misJuegos.map((juego) => (
                      <option key={juego.id} value={juego.id}>
                        {juego.nombre || juego.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="field">
                <label>Puntaje (1 a 5 estrellas)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="5"
                  required
                  value={formData.puntaje}
                  onChange={(e) =>
                    setFormData({ ...formData, puntaje: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Veredicto / Reseña *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.texto}
                  onChange={(e) =>
                    setFormData({ ...formData, texto: e.target.value })
                  }
                  placeholder="Escribí tu análisis técnico y experiencia con el juego..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setModalOpen(false)}
                >
                  CANCELAR
                </button>
                <button type="submit" className="save" disabled={saving}>
                  {saving ? 'GUARDANDO...' : 'PUBLICAR'}
                </button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </ReviewsWrapper>
  );
}

// --- ANIMACIONES ---
const pulseBorder = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(var(--score-color-rgb), 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(var(--score-color-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--score-color-rgb), 0); }
`;

// --- ESTILOS ---
const ReviewsWrapper = styled.div`
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
    mask-image: radial-gradient(circle at top left, black, transparent 80%);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6a6a8a;
  border: 1px dashed #1a1a2e;
  border-radius: 16px;
  background: rgba(10, 10, 20, 0.4);
  font-size: 16px;

  strong {
    color: #00e5ff;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 50px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
  padding-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;

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

  --score-color: ${(props) => props.$scoreColor};
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
        font-size: 18px;
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
    gap: 12px;
    flex-wrap: wrap;
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

    .footer-right {
      display: flex;
      align-items: center;
      gap: 8px;
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

const ActionMiniBtn = styled.button`
  background: #11111f;
  border: 1px solid #1a1a2e;
  color: #8a8aa8;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    color: #00e5ff;
    border-color: #00e5ff;
  }

  &.danger:hover {
    color: #ff0055;
    border-color: #ff0055;
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

    input, select, textarea {
      background: #11111f;
      border: 1px solid #1a1a2e;
      color: #fff;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #00e5ff;
      }
    }
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