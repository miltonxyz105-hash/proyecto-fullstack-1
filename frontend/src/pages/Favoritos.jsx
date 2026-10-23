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
} from '../components/FormControls';
import { EmptyState, ErrorView, LoadingView } from '../components/StateViews';
import {
  agregarFavorito,
  eliminarFavorito,
  getJuegos,
  getMisFavoritos,
} from '../api';
import { getApiErrorMessage } from '../utils/apiError';

const asArray = (posible) => (Array.isArray(posible) ? posible : []);

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedJuego, setSelectedJuego] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [favRes, juegosRes] = await Promise.all([getMisFavoritos(), getJuegos()]);
      setFavoritos(asArray(favRes.data?.data));
      setJuegos(asArray(juegosRes.data?.data));
      setErrorCarga(null);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setFavoritos([]);
      setJuegos([]);
      setErrorCarga(
        getApiErrorMessage(error, 'No se pudieron cargar tus favoritos.')
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

  const handleAgregar = async (event) => {
    event.preventDefault();
    if (!selectedJuego) return;

    setGuardando(true);
    try {
      await agregarFavorito({ juego_id: Number(selectedJuego) });
      toast.success('Añadido a favoritos ❤️');
      closeModal();
      await loadData();
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      toast.error(getApiErrorMessage(error, 'No se pudo añadir a favoritos.'));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (juegoId, nombre) => {
    if (!window.confirm(`¿Quitar "${nombre}" de tus favoritos?`)) return;

    try {
      await eliminarFavorito(juegoId);
      toast.success('Eliminado de favoritos');
      await loadData();
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      toast.error(getApiErrorMessage(error, 'No se pudo quitar de favoritos.'));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJuego('');
  };

  const getJuego = (juegoId) => juegos.find((juego) => juego.id === juegoId);

  const idsFavoritos = favoritos.map((fav) => fav.juego_id);
  const juegosNoFavoritos = juegos.filter(
    (juego) => !idsFavoritos.includes(juego.id)
  );

  return (
    <PageWrapper>
      <header className="page-header">
        <div>
          <h1>Mis Favoritos</h1>
          <p>Tus juegos preferidos</p>
        </div>
        <button
          type="button"
          className="add-btn"
          onClick={() => setShowModal(true)}
          disabled={juegosNoFavoritos.length === 0}
        >
          ➕ Agregar Favorito
        </button>
      </header>

      {cargando ? (
        <LoadingView mensaje="Cargando tus favoritos..." />
      ) : (
        <>
          {errorCarga && <ErrorView error={errorCarga} onReintentar={recargar} />}

          {!errorCarga && favoritos.length === 0 ? (
            <EmptyState
              icono="❤️"
              titulo="No tienes favoritos aún"
              descripcion="Marca tus juegos preferidos para tenerlos siempre a mano."
            />
          ) : (
            <List>
              {favoritos.map((fav) => {
                const juego = getJuego(fav.juego_id);
                return (
                  <Card key={fav.id}>
                    <div className="favorito-info">
                      <h3>{juego ? juego.nombre : 'Juego no encontrado'}</h3>
                      {juego && (
                        <p>
                          🎮 {juego.genero || '—'} | 🖥️ {juego.plataforma || '—'}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleEliminar(
                          fav.juego_id,
                          juego ? juego.nombre : 'este juego'
                        )
                      }
                      title="Quitar de favoritos"
                    >
                      💔
                    </button>
                  </Card>
                );
              })}
            </List>
          )}
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Agregar a Favoritos"
      >
        <ModalForm onSubmit={handleAgregar}>
          <Field>
            Selecciona un juego
            <Select
              value={selectedJuego}
              onChange={(event) => setSelectedJuego(event.target.value)}
              required
            >
              <option value="">Selecciona un juego</option>
              {juegosNoFavoritos.map((juego) => (
                <option key={juego.id} value={juego.id}>
                  {juego.nombre}
                </option>
              ))}
            </Select>
          </Field>

          <ButtonRow>
            <GhostButton type="button" onClick={closeModal} disabled={guardando}>
              Cancelar
            </GhostButton>
            <PrimaryButton type="submit" disabled={!selectedJuego || guardando}>
              {guardando ? 'Agregando...' : 'Agregar'}
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

    &:hover:not(:disabled) {
      background: #0056b3;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
  align-items: center;
  gap: 12px;

  .favorito-info {
    flex: 1;

    h3 {
      color: #007bff;
      margin: 0 0 6px;
      font-size: 17px;
      word-break: break-word;
    }

    p {
      color: #999;
      margin: 0;
      font-size: 13px;
    }
  }

  .delete-btn {
    background: transparent;
    border: 1px solid #dc3545;
    border-radius: 6px;
    padding: 10px 12px;
    cursor: pointer;
    font-size: 16px;
    color: #dc3545;

    &:hover {
      background: #dc3545;
      color: #161616;
    }
  }
`;
