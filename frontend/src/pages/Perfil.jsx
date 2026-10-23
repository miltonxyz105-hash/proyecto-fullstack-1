import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Modal from '../components/Modal';
import {
  ButtonRow,
  Field,
  GhostButton,
  Input,
  InputRow,
  ModalForm,
  PrimaryButton,
} from '../components/FormControls';
import { EmptyState, ErrorView, LoadingView } from '../components/StateViews';
import {
  getJuegos,
  getMisFavoritos,
  getMisReviews,
  updateMyUser,
} from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import { useAuth } from '../contexts/AuthContext';

const asArray = (posible) => (Array.isArray(posible) ? posible : []);

export default function Perfil() {
  const { user, refreshUser } = useAuth();

  const [juegos, setJuegos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', edad: '' });

  const loadPerfil = useCallback(async () => {
    try {
      const [juegosRes, reviewsRes, favoritosRes] = await Promise.all([
        getJuegos(),
        getMisReviews(),
        getMisFavoritos(),
      ]);
      setJuegos(asArray(juegosRes.data?.data));
      setReviews(asArray(reviewsRes.data?.data));
      setFavoritos(asArray(favoritosRes.data?.data));
      setErrorCarga(null);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setJuegos([]);
      setReviews([]);
      setFavoritos([]);
      setErrorCarga(getApiErrorMessage(error, 'No se pudo cargar tu perfil.'));
    } finally {
      setCargando(false);
    }
  }, []);

  const recargarPerfil = () => {
    setCargando(true);
    loadPerfil();
  };

  useEffect(() => {
    async function cargar() {
      await loadPerfil();
    }
    cargar();
  }, [loadPerfil]);

  const platinados = juegos.filter((juego) => juego.platinado);
  const horasTotales = juegos.reduce(
    (total, juego) => total + (Number(juego.horas_jugadas) || 0),
    0
  );
  const progresoMedio =
    juegos.length > 0
      ? Math.round(
          juegos.reduce(
            (total, juego) => total + (Number(juego.porcentaje_completado) || 0),
            0
          ) / juegos.length
        )
      : 0;

  const abrirEdicion = () => {
    setFormData({
      nombre: user?.nombre || '',
      edad: user?.edad ?? '',
    });
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGuardando(true);

    try {
      await updateMyUser({
        nombre: formData.nombre,
        edad: parseInt(formData.edad, 10),
      });
      await refreshUser();
      toast.success('Perfil actualizado');
      setShowModal(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el perfil.'));
    } finally {
      setGuardando(false);
    }
  };

  const iniciales = (user?.nombre || user?.email || '?')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <PageWrapper>
      <header className="perfil-header">
        <Avatar>{iniciales}</Avatar>
        <div className="perfil-info">
          <h1>{user?.nombre || 'Jugador sin nombre'}</h1>
          <p className="email">{user?.email}</p>
          {user?.edad ? <p className="meta">Edad: {user.edad} años</p> : null}
        </div>
        <button type="button" className="edit-btn" onClick={abrirEdicion}>
          ✏️ Editar perfil
        </button>
      </header>

      {cargando ? (
        <LoadingView mensaje="Cargando tu perfil..." />
      ) : (
        <>
          {errorCarga && <ErrorView error={errorCarga} onReintentar={recargarPerfil} />}

          {!errorCarga && (
            <>
              <StatsGrid>
                <Stat>
                  <span className="value">{juegos.length}</span>
                  <span className="label">Juegos</span>
                </Stat>
                <Stat className="platino">
                  <span className="value">🏆 {platinados.length}</span>
                  <span className="label">Platinos</span>
                </Stat>
                <Stat>
                  <span className="value">{horasTotales}h</span>
                  <span className="label">Horas jugadas</span>
                </Stat>
                <Stat>
                  <span className="value">{progresoMedio}%</span>
                  <span className="label">Completitud media</span>
                </Stat>
                <Stat>
                  <span className="value">{reviews.length}</span>
                  <span className="label">Reviews</span>
                </Stat>
                <Stat>
                  <span className="value">{favoritos.length}</span>
                  <span className="label">Favoritos</span>
                </Stat>
              </StatsGrid>

              <section className="platinos-section">
                <div className="section-header">
                  <h2>Vitrina de Platinos</h2>
                  <Link to="/juegos">Ver biblioteca →</Link>
                </div>

                {platinados.length === 0 ? (
                  <EmptyState
                    icono="🏆"
                    titulo="Aún no tienes platinos"
                    descripcion="Marca un juego como platinado en tu biblioteca y aparecerá aquí."
                  >
                    <Link to="/juegos" className="empty-cta">
                      Ir a mi biblioteca
                    </Link>
                  </EmptyState>
                ) : (
                  <PlatinoGrid>
                    {platinados.map((juego) => (
                      <PlatinoCard key={juego.id}>
                        <span className="trofeo">🏆</span>
                        <div className="detalle">
                          <h3>{juego.nombre}</h3>
                          <p>
                            {juego.genero || 'Sin género'} · {juego.plataforma || '—'}
                          </p>
                          <p className="horas">
                            {juego.horas_jugadas ?? 0}h · {juego.porcentaje_completado ?? 100}%
                          </p>
                        </div>
                      </PlatinoCard>
                    ))}
                  </PlatinoGrid>
                )}
              </section>
            </>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Editar perfil">
        <ModalForm onSubmit={handleSubmit}>
          <Field>
            Nombre
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={80}
            />
          </Field>

          <InputRow>
            <Field>
              Edad
              <Input
                type="number"
                name="edad"
                min="1"
                max="120"
                value={formData.edad}
                onChange={handleChange}
                required
              />
            </Field>
          </InputRow>

          <ButtonRow>
            <GhostButton
              type="button"
              onClick={() => setShowModal(false)}
              disabled={guardando}
            >
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

  .perfil-header {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 28px;

    .perfil-info {
      flex: 1;
      min-width: 200px;

      h1 {
        color: #fff;
        font-size: 26px;
        margin: 0 0 4px;
      }

      .email {
        color: #007bff;
        margin: 0 0 4px;
        font-size: 14px;
      }

      .meta {
        color: #666;
        margin: 0;
        font-size: 13px;
      }
    }

    .edit-btn {
      background: transparent;
      border: 1px solid #007bff;
      color: #007bff;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: #007bff;
        color: #fff;
      }
    }
  }

  .platinos-section {
    margin-top: 32px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h2 {
        color: #fff;
        font-size: 20px;
        margin: 0;
      }

      a {
        color: #00d4ff;
        font-size: 14px;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .empty-cta {
    display: inline-block;
    background: #007bff;
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      background: #0056b3;
    }
  }
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff, #00d4ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
`;

const Stat = styled.div`
  background: #141414;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
  padding: 16px;
  text-align: center;

  .value {
    display: block;
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .label {
    color: #666;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  &.platino .value {
    color: #00d4ff;
  }
`;

const PlatinoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
`;

const PlatinoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #00d4ff10, transparent);
  border: 1px solid #00d4ff40;
  border-radius: 12px;
  padding: 16px;

  .trofeo {
    font-size: 30px;
  }

  .detalle {
    flex: 1;
    min-width: 0;

    h3 {
      color: #fff;
      font-size: 15px;
      margin: 0 0 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      color: #888;
      font-size: 12px;
      margin: 0;
    }

    .horas {
      color: #00d4ff;
      margin-top: 2px;
    }
  }
`;
