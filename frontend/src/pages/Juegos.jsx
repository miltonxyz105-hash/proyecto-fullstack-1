import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import styled from 'styled-components';

import AddGameModal from '../components/AddGameModal';
import Modal from '../components/Modal';
import {
  ButtonRow,
  CheckboxLabel,
  Field,
  GhostButton,
  Input,
  InputRow,
  ModalForm,
  PrimaryButton,
  Select,
} from '../components/FormControls';
import { EmptyState, ErrorView, LoadingView } from '../components/StateViews';
import { createJuego, deleteJuego, getJuegos, updateJuego } from '../api';
import { getApiErrorMessage } from '../utils/apiError';

const ESTADOS = [
  { valor: 'pendiente', etiqueta: 'Pendiente' },
  { valor: 'jugando', etiqueta: 'Jugando' },
  { valor: 'jugado', etiqueta: 'Jugado' },
  { valor: 'completado', etiqueta: 'Completado' },
  { valor: 'abandonado', etiqueta: 'Abandonado' },
];

const FORM_INICIAL = {
  nombre: '',
  genero: '',
  plataforma: '',
  horas_jugadas: 0,
  estado: 'jugando',
  porcentaje_completado: 0,
  platinado: false,
};

const normalizarEstado = (estado) => (estado || '').toLowerCase();

export default function Juegos() {
  const [juegos, setJuegos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingJuego, setEditingJuego] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [soloPlatinados, setSoloPlatinados] = useState(false);

  const loadJuegos = useCallback(async () => {
    try {
      const res = await getJuegos();
      const datos = Array.isArray(res.data) ? res.data : res.data?.data;
      setJuegos(Array.isArray(datos) ? datos : []);
      setErrorCarga(null);
    } catch (error) {
      console.error('Error al cargar juegos:', error);
      setJuegos([]);
      setErrorCarga(getApiErrorMessage(error, 'No se pudo cargar tu biblioteca.'));
    } finally {
      setCargando(false);
    }
  }, []);

  const recargarJuegos = () => {
    setCargando(true);
    loadJuegos();
  };

  useEffect(() => {
    async function cargar() {
      await loadJuegos();
    }
    cargar();
  }, [loadJuegos]);

  const juegosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return juegos.filter((juego) => {
      if (soloPlatinados && !juego.platinado) return false;
      if (filtroEstado && normalizarEstado(juego.estado) !== filtroEstado) return false;
      if (!texto) return true;

      return [juego.nombre, juego.genero, juego.plataforma]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(texto));
    });
  }, [juegos, busqueda, filtroEstado, soloPlatinados]);

  const hayFiltros = Boolean(busqueda || filtroEstado || soloPlatinados);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
    setSoloPlatinados(false);
  };

  const abrirNuevo = () => {
    setEditingJuego(null);
    setFormData(FORM_INICIAL);
    setShowModal(true);
  };

  const handleEdit = (juego) => {
    setEditingJuego(juego);
    setFormData({
      nombre: juego.nombre || '',
      genero: juego.genero || '',
      plataforma: juego.plataforma || '',
      horas_jugadas: juego.horas_jugadas || 0,
      estado: normalizarEstado(juego.estado) || 'jugando',
      porcentaje_completado: juego.porcentaje_completado ?? 0,
      platinado: Boolean(juego.platinado),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJuego(null);
    setFormData(FORM_INICIAL);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox' && name === 'platinado' && checked) {
      // Un platinado es, por definición, un 100% completado.
      setFormData((prev) => ({
        ...prev,
        platinado: true,
        porcentaje_completado: 100,
        estado: prev.estado === 'pendiente' ? 'completado' : prev.estado,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? parseInt(value, 10) || 0
            : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGuardando(true);

    try {
      if (editingJuego) {
        await updateJuego(editingJuego.id, formData);
        toast.success('Juego actualizado');
      } else {
        await createJuego(formData);
        toast.success('Juego añadido a tu biblioteca');
      }
      await loadJuegos();
      closeModal();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el juego.'));
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}" de tu biblioteca?`)) return;

    try {
      await deleteJuego(id);
      toast.success('Juego eliminado');
      await loadJuegos();
    } catch (error) {
      console.error('Error al eliminar juego:', error);
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar el juego.'));
    }
  };

  const handleAddFromCatalog = async (externalGame) => {
    try {
      await createJuego({
        nombre: externalGame.title,
        genero: externalGame.genre || 'Desconocido',
        plataforma: externalGame.platform || 'PC',
        horas_jugadas: 0,
        estado: 'pendiente',
        porcentaje_completado: 0,
        platinado: false,
        comentario_personal: externalGame.short_description || '',
      });
      toast.success(`${externalGame.title} añadido a tu biblioteca`);
      await loadJuegos();
    } catch (error) {
      console.error('Error al agregar juego desde catálogo:', error);
      toast.error(getApiErrorMessage(error, 'No se pudo añadir el juego.'));
    }
  };

  return (
    <PageWrapper>
      <header className="page-header">
        <div>
          <h1>Mis Juegos</h1>
          <p>Gestiona tu colección de videojuegos</p>
        </div>
        <div className="header-actions">
          <button type="button" className="add-btn" onClick={() => setShowCatalogModal(true)}>
            🔍 Buscar en Catálogo
          </button>
          <button type="button" className="add-btn secondary" onClick={abrirNuevo}>
            + Crear Manual
          </button>
        </div>
      </header>

      {cargando ? (
        <LoadingView mensaje="Cargando tu biblioteca..." />
      ) : (
        <>
          {errorCarga && <ErrorView error={errorCarga} onReintentar={recargarJuegos} />}

          {!errorCarga && juegos.length === 0 ? (
            <EmptyState
              icono="🎮"
              titulo="No tienes juegos aún"
              descripcion="Agrega tu primer juego para empezar tu colección."
            >
              <button type="button" className="empty-cta" onClick={abrirNuevo}>
                + Crear mi primer juego
              </button>
            </EmptyState>
          ) : (
            <>
              <Filters>
                <input
                  type="search"
                  placeholder="Buscar por nombre, género o plataforma..."
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  aria-label="Buscar juegos"
                />
                <select
                  value={filtroEstado}
                  onChange={(event) => setFiltroEstado(event.target.value)}
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos los estados</option>
                  {ESTADOS.map((estado) => (
                    <option key={estado.valor} value={estado.valor}>
                      {estado.etiqueta}
                    </option>
                  ))}
                </select>
                <label className="platinados-toggle">
                  <input
                    type="checkbox"
                    checked={soloPlatinados}
                    onChange={(event) => setSoloPlatinados(event.target.checked)}
                  />
                  🏆 Solo platinados
                </label>
                {hayFiltros && (
                  <button type="button" className="clear-filters" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                )}
                <span className="contador">
                  {juegosFiltrados.length} de {juegos.length}
                </span>
              </Filters>

              {juegosFiltrados.length === 0 ? (
                <EmptyState
                  icono="🔍"
                  titulo="Sin resultados"
                  descripcion="Ningún juego coincide con los filtros seleccionados."
                >
                  <button type="button" className="empty-cta" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                </EmptyState>
              ) : (
                <Grid>
                  {juegosFiltrados.map((juego) => (
                    <Card key={juego.id} $platinado={Boolean(juego.platinado)}>
                      <CardHeader>
                        <h3>{juego.nombre}</h3>
                        <Actions>
                          <button
                            type="button"
                            onClick={() => handleEdit(juego)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="delete"
                            onClick={() => handleDelete(juego.id, juego.nombre)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </Actions>
                      </CardHeader>

                      <MetaRow>
                        <span>Género</span>
                        <span>{juego.genero || '—'}</span>
                      </MetaRow>
                      <MetaRow>
                        <span>Plataforma</span>
                        <span>{juego.plataforma || '—'}</span>
                      </MetaRow>
                      <MetaRow>
                        <span>Horas</span>
                        <span>{juego.horas_jugadas ?? 0}h</span>
                      </MetaRow>

                      <ProgressWrap>
                        <ProgressHeader>
                          <span>Progreso</span>
                          <span>{juego.porcentaje_completado ?? 0}%</span>
                        </ProgressHeader>
                        <Bar>
                          <Fill
                            style={{ width: `${juego.porcentaje_completado ?? 0}%` }}
                          />
                        </Bar>
                      </ProgressWrap>

                      <Footer>
                        <Badge data-status={normalizarEstado(juego.estado)}>
                          {juego.estado || 'pendiente'}
                        </Badge>
                        {juego.platinado && <Plat>Platinado 🏆</Plat>}
                      </Footer>
                    </Card>
                  ))}
                </Grid>
              )}
            </>
          )}
        </>
      )}

      <AddGameModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        onGameAdded={handleAddFromCatalog}
      />

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingJuego ? 'Editar Juego' : 'Nuevo Juego'}
      >
        <ModalForm onSubmit={handleSubmit}>
          <Field>
            Nombre del juego
            <Input
              name="nombre"
              placeholder="Elden Ring"
              value={formData.nombre}
              onChange={handleChange}
              required
              maxLength={120}
            />
          </Field>

          <InputRow>
            <Field>
              Género
              <Input
                name="genero"
                placeholder="RPG"
                value={formData.genero}
                onChange={handleChange}
                required
                maxLength={60}
              />
            </Field>
            <Field>
              Plataforma
              <Input
                name="plataforma"
                placeholder="PS5"
                value={formData.plataforma}
                onChange={handleChange}
                required
                maxLength={60}
              />
            </Field>
          </InputRow>

          <InputRow>
            <Field>
              Horas jugadas
              <Input
                type="number"
                name="horas_jugadas"
                min="0"
                value={formData.horas_jugadas}
                onChange={handleChange}
              />
            </Field>
            <Field>
              Estado
              <Select name="estado" value={formData.estado} onChange={handleChange}>
                {ESTADOS.map((estado) => (
                  <option key={estado.valor} value={estado.valor}>
                    {estado.etiqueta}
                  </option>
                ))}
              </Select>
            </Field>
          </InputRow>

          <Field>
            Progreso: {formData.porcentaje_completado}%
            <input
              type="range"
              name="porcentaje_completado"
              min="0"
              max="100"
              value={formData.porcentaje_completado}
              onChange={handleChange}
              style={{ width: '100%', accentColor: '#007bff' }}
            />
          </Field>

          <CheckboxLabel>
            <input
              type="checkbox"
              name="platinado"
              checked={formData.platinado}
              onChange={handleChange}
            />
            Platinado 🏆 (completado al 100%)
          </CheckboxLabel>

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

  .header-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
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

    &.secondary {
      background: #28a745;

      &:hover {
        background: #218838;
      }
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

const Filters = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;

  input[type='search'],
  select {
    background: #141414;
    border: 1px solid #1a1a2e;
    border-radius: 8px;
    color: #fff;
    padding: 10px 12px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }

  input[type='search'] {
    flex: 1;
    min-width: 220px;
  }

  .platinados-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #00d4ff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    user-select: none;

    input {
      accent-color: #00d4ff;
    }
  }

  .clear-filters {
    background: transparent;
    border: 1px solid #333;
    color: #888;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      color: #fff;
      border-color: #555;
    }
  }

  .contador {
    margin-left: auto;
    color: #666;
    font-size: 13px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: #141414;
  border: 1px solid ${(props) => (props.$platinado ? '#00d4ff55' : '#1a1a2e')};
  border-radius: 12px;
  padding: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;

  h3 {
    color: #fff;
    font-size: 17px;
    margin: 0;
    word-break: break-word;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;

  button {
    background: #1a1a2e;
    border: 1px solid #333;
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      border-color: #007bff;
    }

    &.delete:hover {
      border-color: #dc3545;
    }
  }
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;

  span:first-child {
    color: #666;
  }

  span:last-child {
    color: #aaa;
  }
`;

const ProgressWrap = styled.div`
  margin: 16px 0 12px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
`;

const Bar = styled.div`
  height: 6px;
  background: #1a1a2e;
  border-radius: 3px;
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  background: #007bff;
  transition: width 0.3s;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: #1a1a2e;
  color: #888;

  &[data-status='completado'] {
    background: #28a74520;
    color: #28a745;
  }
  &[data-status='jugando'] {
    background: #007bff20;
    color: #007bff;
  }
  &[data-status='jugado'] {
    background: #17a2b820;
    color: #17a2b8;
  }
  &[data-status='pendiente'] {
    background: #ffc10720;
    color: #ffc107;
  }
  &[data-status='abandonado'] {
    background: #dc354520;
    color: #dc3545;
  }
`;

const Plat = styled.span`
  color: #00d4ff;
  font-weight: 600;
  font-size: 13px;
`;
