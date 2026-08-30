import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getJuegos, createJuego, updateJuego, deleteJuego } from '../api';
import AddGameModal from '../components/AddGameModal';

export default function Juegos() {
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingJuego, setEditingJuego] = useState(null);

  const initialFormState = {
    nombre: '',
    genero: '',
    plataforma: '',
    horas_jugadas: 0,
    estado: 'jugando', // En minúsculas para coincidir con la base de datos
    fecha_inicio: '',
    fecha_fin: '',
    porcentaje_completado: 0,
    platinado: false,
    logros: '',
    comentario_personal: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadJuegos();
  }, []);

  const loadJuegos = async () => {
    try {
      const res = await getJuegos();
      const arrayJuegos = Array.isArray(res.data) ? res.data : res.data?.data;
      setJuegos(Array.isArray(arrayJuegos) ? arrayJuegos : []);
    } catch (error) {
      console.error('Error al cargar juegos:', error);
      setJuegos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJuego) {
        await updateJuego(editingJuego.id, formData);
      } else {
        await createJuego(formData);
      }
      await loadJuegos();
      closeModal();
    } catch (error) {
      console.error('Error detallado al guardar:', error.response?.data || error);
      alert('Error al guardar el juego: ' + (error.response?.data?.detail || 'Verifica los campos'));
    }
  };

  const handleAddFromCatalog = async (externalGame) => {
    const newGame = {
      nombre: externalGame.title,
      genero: externalGame.genre || 'Desconocido',
      plataforma: externalGame.platform || 'PC',
      horas_jugadas: 0,
      estado: 'pendiente',
      porcentaje_completado: 0,
      platinado: false,
      comentario_personal: externalGame.short_description || ''
    };

    try {
      await createJuego(newGame);
      await loadJuegos();
    } catch (error) {
      console.error('Error al agregar juego desde catálogo:', error);
    }
  };

  const handleEdit = (juego) => {
    setEditingJuego(juego);
    setFormData({
      ...juego,
      estado: juego.estado?.toLowerCase() || 'jugando'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar juego?')) {
      try {
        await deleteJuego(id);
        loadJuegos();
      } catch (error) {
        console.error('Error al eliminar juego:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJuego(null);
    setFormData(initialFormState);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <PageWrapper>
      <header className="page-header">
        <div>
          <h1>Mis Juegos</h1>
          <p>Gestiona tu colección de videojuegos</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="add-btn" onClick={() => setShowCatalogModal(true)}>
            🔍 Buscar en Catálogo
          </button>
          <button className="add-btn secondary" onClick={() => setShowModal(true)}>
            + Crear Manual
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : juegos.length === 0 ? (
        <EmptyState>
          <span className="icon">🎮</span>
          <h3>No tienes juegos aún</h3>
          <p>Agrega tu primer juego para empezar tu colección.</p>
        </EmptyState>
      ) : (
        <Grid>
          {juegos.map((juego) => (
            <Card key={juego.id || juego.nombre}>
              <CardHeader>
                <h3>{juego.nombre}</h3>
                <Actions>
                  <button onClick={() => handleEdit(juego)} title="Editar">✏️</button>
                  <button className="delete" onClick={() => handleDelete(juego.id)} title="Eliminar">🗑️</button>
                </Actions>
              </CardHeader>

              <MetaRow><span>Género</span><span>{juego.genero}</span></MetaRow>
              <MetaRow><span>Plataforma</span><span>{juego.plataforma}</span></MetaRow>
              <MetaRow><span>Horas</span><span>{juego.horas_jugadas}h</span></MetaRow>

              <ProgressWrap>
                <ProgressHeader><span>Progreso</span><span>{juego.porcentaje_completado}%</span></ProgressHeader>
                <Bar><Fill style={{ width: juego.porcentaje_completado + '%' }} /></Bar>
              </ProgressWrap>

              <Footer>
                <Badge data-status={juego.estado?.toLowerCase()}>{juego.estado}</Badge>
                {juego.platinado && <Plat>Platinado 🏆</Plat>}
              </Footer>
            </Card>
          ))}
        </Grid>
      )}

      {/* Modal Catálogo de Juegos */}
      <AddGameModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        onGameAdded={handleAddFromCatalog}
      />

      {/* Modal Formulario Manual */}
      {showModal && (
        <Overlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h2>{editingJuego ? 'Editar Juego' : 'Nuevo Juego'}</h2>
            <Form onSubmit={handleSubmit}>
              <Input
                name="nombre"
                placeholder="Nombre del juego"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <InputRow>
                <Input
                  name="genero"
                  placeholder="Género (ej: shooter)"
                  value={formData.genero}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="plataforma"
                  placeholder="Plataforma (ej: steam)"
                  value={formData.plataforma}
                  onChange={handleChange}
                  required
                />
              </InputRow>
              <InputRow>
                <Input
                  type="number"
                  name="horas_jugadas"
                  placeholder="Horas jugadas"
                  value={formData.horas_jugadas}
                  onChange={handleChange}
                />
                <Select name="estado" value={formData.estado} onChange={handleChange}>
                  <option value="jugando">Jugando</option>
                  <option value="completado">Completado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="abandonado">Abandonado</option>
                  <option value="jugado">Jugado</option>
                </Select>
              </InputRow>

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', margin: '0 0 8px 0' }}>{formData.porcentaje_completado}% completado</p>
                <input
                  type="range"
                  name="porcentaje_completado"
                  min="0"
                  max="100"
                  value={formData.porcentaje_completado}
                  onChange={handleChange}
                  style={{ width: '100%', accentColor: '#007bff' }}
                />
              </div>

              <CheckLabel>
                <input
                  type="checkbox"
                  name="platinado"
                  checked={formData.platinado}
                  onChange={handleChange}
                />
                Platinado 🏆
              </CheckLabel>

              <ModalBtns>
                <CancelBtn type="button" onClick={closeModal}>Cancelar</CancelBtn>
                <SaveBtn type="submit">Guardar</SaveBtn>
              </ModalBtns>
            </Form>
          </Modal>
        </Overlay>
      )}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 20px;
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    h1 { color: #fff; margin-bottom: 4px; }
    p { color: #666; }
    .add-btn {
      background: #007bff; color: #fff; border: none;
      padding: 12px 20px; border-radius: 8px;
      font-weight: 600; cursor: pointer;
      &:hover { background: #0056b3; }
      &.secondary {
        background: #28a745;
        &:hover { background: #218838; }
      }
    }
  }
  .loading { text-align: center; color: #888; padding: 80px 0; }
`;

const EmptyState = styled.div`
  text-align: center; padding: 80px 0;
  .icon { font-size: 64px; }
  h3 { color: #fff; margin-bottom: 8px; }
  p { color: #666; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: #141414;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
  padding: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  h3 { color: #fff; font-size: 18px; margin: 0; }
`;

const Actions = styled.div`
  display: flex; gap: 4px;
  button {
    background: #1a1a2e; border: 1px solid #333;
    color: #fff; padding: 6px 10px; border-radius: 6px;
    cursor: pointer; font-size: 14px;
    &:hover { border-color: #007bff; }
    &.delete:hover { border-color: #dc3545; }
  }
`;

const MetaRow = styled.div`
  display: flex; justify-content: space-between;
  padding: 6px 0; font-size: 14px;
  span:first-child { color: #666; }
  span:last-child { color: #aaa; }
`;

const ProgressWrap = styled.div`
  margin: 16px 0 12px;
`;

const ProgressHeader = styled.div`
  display: flex; justify-content: space-between;
  font-size: 12px; color: #888; margin-bottom: 6px;
`;

const Bar = styled.div`
  height: 6px; background: #1a1a2e; border-radius: 3px; overflow: hidden;
`;

const Fill = styled.div`
  height: 100%; background: #007bff; transition: width 0.3s;
`;

const Footer = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-top: 12px;
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;
  &[data-status='completado'] { background: #28a74520; color: #28a745; }
  &[data-status='jugando'] { background: #007bff20; color: #007bff; }
  &[data-status='jugado'] { background: #17a2b820; color: #17a2b8; }
  &[data-status='pendiente'] { background: #ffc10720; color: #ffc107; }
  &[data-status='abandonado'] { background: #dc354520; color: #dc3545; }
`;

const Plat = styled.span`
  color: #00d4ff; font-weight: 600; font-size: 13px;
`;

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.8);
  display: grid; place-items: center; z-index: 1000;
`;

const Modal = styled.div`
  background: #141414; border: 1px solid #007bff; border-radius: 12px;
  padding: 30px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto;
  h2 { color: #007bff; margin: 0 0 20px; text-align: center; }
`;

const Form = styled.form`
  display: flex; flex-direction: column; gap: 16px;
`;

const Input = styled.input`
  width: 100%; padding: 12px; background: #1a1a2e; border: 1px solid #333;
  border-radius: 8px; color: #fff; font-size: 14px; box-sizing: border-box;
  &:focus { outline: none; border-color: #007bff; }
`;

const Select = styled.select`
  width: 100%; padding: 12px; background: #1a1a2e; border: 1px solid #333;
  border-radius: 8px; color: #fff; font-size: 14px; box-sizing: border-box;
  &:focus { outline: none; border-color: #007bff; }
`;

const InputRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
`;

const CheckLabel = styled.label`
  display: flex; align-items: center; gap: 8px; color: #fff; cursor: pointer;
  input { width: auto; }
`;

const ModalBtns = styled.div`
  display: flex; gap: 12px;
`;

const SaveBtn = styled.button`
  flex: 1; padding: 12px; background: #007bff; color: #fff;
  border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
  &:hover { background: #0056b3; }
`;

const CancelBtn = styled.button`
  flex: 1; padding: 12px; background: transparent; color: #dc3545;
  border: 1px solid #dc3545; border-radius: 8px; font-weight: 600; cursor: pointer;
  &:hover { background: #dc3545; color: #fff; }
`;