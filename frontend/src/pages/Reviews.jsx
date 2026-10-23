import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styled from 'styled-components';

import Modal from '../components/Modal';
import {
  ButtonRow,
  Field,
  GhostButton,
  ModalForm,
  PrimaryButton,
  Select,
  Textarea,
} from '../components/FormControls';
import { EmptyState, ErrorView, LoadingView } from '../components/StateViews';
import {
  createReview,
  deleteReview,
  getJuegos,
  getMisReviews,
  updateReview,
} from '../api';
import { getApiErrorMessage } from '../utils/apiError';

const FORM_INICIAL = { juego_id: '', puntuacion: 5, comentario: '' };

const asArray = (posible) => (Array.isArray(posible) ? posible : []);

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);

  const loadData = useCallback(async () => {
    try {
      const [reviewsRes, juegosRes] = await Promise.all([getMisReviews(), getJuegos()]);
      setReviews(asArray(reviewsRes.data?.data));
      setJuegos(asArray(juegosRes.data?.data));
      setErrorCarga(null);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setReviews([]);
      setJuegos([]);
      setErrorCarga(
        getApiErrorMessage(error, 'No se pudieron cargar tus reseñas.')
      );
    } finally {
      setCargando(false);
    }
  }, []);

  const recargar = () => {
    setCargando(true);
    loadData();
  };

  useEffect(() => {
    async function cargar() {
      await loadData();
    }
    cargar();
  }, [loadData]);

  const abrirNuevo = () => {
    if (juegos.length === 0) {
      toast.error('Primero añade un juego a tu biblioteca para poder reseñarlo.');
      return;
    }
    setEditingReview(null);
    setFormData(FORM_INICIAL);
    setShowModal(true);
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      juego_id: review.juego_id,
      puntuacion: review.puntuacion,
      comentario: review.comentario || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReview(null);
    setFormData(FORM_INICIAL);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'puntuacion' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGuardando(true);

    try {
      if (editingReview) {
        await updateReview(editingReview.id, {
          puntuacion: formData.puntuacion,
          comentario: formData.comentario,
        });
        toast.success('Reseña actualizada');
      } else {
        await createReview({
          juego_id: Number(formData.juego_id),
          puntuacion: formData.puntuacion,
          comentario: formData.comentario,
        });
        toast.success('Reseña publicada');
      }
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error al guardar review:', error);
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la reseña.'));
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (id, nombreJuego) => {
    if (!window.confirm(`¿Eliminar tu reseña de "${nombreJuego}"?`)) return;

    try {
      await deleteReview(id);
      toast.success('Reseña eliminada');
      await loadData();
    } catch (error) {
      console.error('Error al eliminar review:', error);
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar la reseña.'));
    }
  };

  const getJuegoNombre = (juegoId) => {
    const juego = juegos.find((item) => item.id === juegoId);
    return juego ? juego.nombre : 'Juego no encontrado';
  };

  return (
    <PageWrapper>
      <header className="page-header">
        <div>
          <h1>Mis Reviews</h1>
          <p>Tus opiniones sobre los juegos</p>
        </div>
        <button type="button" className="add-btn" onClick={abrirNuevo}>
          ➕ Agregar Review
        </button>
      </header>

      {cargando ? (
        <LoadingView mensaje="Cargando tus reseñas..." />
      ) : (
        <>
          {errorCarga && <ErrorView error={errorCarga} onReintentar={recargar} />}

          {!errorCarga && reviews.length === 0 ? (
            <EmptyState
              icono="📝"
              titulo="No tienes reseñas aún"
              descripcion={
                juegos.length === 0
                  ? 'Añade juegos a tu biblioteca y podrás reseñarlos.'
                  : 'Cuéntanos qué te parecieron los juegos que juegas.'
              }
            >
              <button type="button" className="empty-cta" onClick={abrirNuevo}>
                Escribir mi primera reseña
              </button>
            </EmptyState>
          ) : (
            <List>
              {reviews.map((review) => (
                <Card key={review.id}>
                  <div className="review-info">
                    <h3>{getJuegoNombre(review.juego_id)}</h3>
                    <p className="score">⭐ {review.puntuacion}/10</p>
                    <p className="comment">{review.comentario}</p>
                  </div>
                  <div className="review-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEdit(review)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(review.id, getJuegoNombre(review.juego_id))
                      }
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </Card>
              ))}
            </List>
          )}
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingReview ? 'Editar Review' : 'Agregar Review'}
      >
        <ModalForm onSubmit={handleSubmit}>
          <Field>
            Juego
            <Select
              name="juego_id"
              value={formData.juego_id}
              onChange={handleChange}
              disabled={Boolean(editingReview)}
              required
            >
              <option value="">Selecciona un juego</option>
              {juegos.map((juego) => (
                <option key={juego.id} value={juego.id}>
                  {juego.nombre}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            Puntuación: {formData.puntuacion}/10
            <input
              type="range"
              name="puntuacion"
              min="1"
              max="10"
              step="1"
              value={formData.puntuacion}
              onChange={handleChange}
              style={{ width: '100%', accentColor: '#007bff' }}
            />
          </Field>

          <Field>
            Comentario
            <Textarea
              name="comentario"
              placeholder="¿Qué te pareció?"
              value={formData.comentario}
              onChange={handleChange}
              rows="4"
              maxLength={2000}
              required
            />
          </Field>

          <ButtonRow>
            <GhostButton type="button" onClick={closeModal} disabled={guardando}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </PrimaryButton>
          </ButtonRow>
        </ModalForm>
      </Modal>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 24px;

    h1 {
      color: #fff;
      margin: 0 0 4px;
      font-size: 28px;
    }

    p {
      color: #666;
      margin: 0;
    }
  }

  .add-btn {
    background: #007bff;
    color: #fff;
    border: none;
    padding: 12px 18px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: #0056b3;
    }
  }

  .empty-cta {
    background: #007bff;
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: #0056b3;
    }
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Card = styled.div`
  background: #141414;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  .review-info {
    flex: 1;

    h3 {
      color: #007bff;
      margin: 0 0 6px;
      font-size: 17px;
    }

    .score {
      color: #ffc107;
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 600;
    }

    .comment {
      color: #bbb;
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  .review-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    button {
      background: transparent;
      border: 1px solid;
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 15px;
    }

    .edit-btn {
      border-color: #007bff;
      color: #007bff;

      &:hover {
        background: #007bff;
        color: #161616;
      }
    }

    .delete-btn {
      border-color: #dc3545;
      color: #dc3545;

      &:hover {
        background: #dc3545;
        color: #161616;
      }
    }
  }
`;
