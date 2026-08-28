import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getTareas, createTarea, updateTarea, deleteTarea } from '../api';

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTarea, setEditingTarea] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: 'pendiente',
    fecha_limite: ''
  });

  useEffect(() => {
    loadTareas();
  }, []);

  const loadTareas = async () => {
    try {
      const res = await getTareas();
      setTareas(res.data.data);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTarea) {
        await updateTarea(editingTarea.id, formData);
      } else {
        await createTarea(formData);
      }
      loadTareas();
      closeModal();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
    }
  };

  const handleEdit = (tarea) => {
    setEditingTarea(tarea);
    setFormData(tarea);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        await deleteTarea(id);
        loadTareas();
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    }
  };

  const handleToggleEstado = async (tarea) => {
    const nuevoEstado = tarea.estado === 'pendiente' ? 'completada' : 'pendiente';
    try {
      await updateTarea(tarea.id, { ...tarea, estado: nuevoEstado });
      loadTareas();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTarea(null);
    setFormData({
      titulo: '',
      descripcion: '',
      estado: 'pendiente',
      fecha_limite: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getEstadoColor = (estado) => {
    return estado === 'completada' ? '#28a745' : '#ffc107';
  };

  return (
    <StyledWrapper>
      <div id="form">
        <div id="form-body">
          <div id="welcome-lines">
            <div id="welcome-line-1">Mis Tareas</div>
            <div id="welcome-line-2">Gestiona tus pendientes</div>
          </div>

          <div id="menu">
            <Link to="/" className="menu-btn">← Volver al Dashboard</Link>
            <button id="add-btn" onClick={() => setShowModal(true)}>
              ➕ Agregar Tarea
            </button>
          </div>

          <div id="tareas-list">
            {loading ? (
              <p style={{ color: 'white', textAlign: 'center' }}>Cargando...</p>
            ) : tareas.length === 0 ? (
              <p style={{ color: 'white', textAlign: 'center' }}>No tienes tareas aún. ¡Agrega una!</p>
            ) : (
              tareas.map(tarea => (
                <div key={tarea.id} className="tarea-card">
                  <div className="tarea-info">
                    <h3 style={{ textDecoration: tarea.estado === 'completada' ? 'line-through' : 'none' }}>
                      {tarea.titulo}
                    </h3>
                    {tarea.descripcion && <p>{tarea.descripcion}</p>}
                    <div className="tarea-meta">
                      <span className="estado-badge" style={{ backgroundColor: getEstadoColor(tarea.estado) }}>
                        {tarea.estado}
                      </span>
                      {tarea.fecha_limite && <span>📅 {tarea.fecha_limite}</span>}
                    </div>
                  </div>
                  <div className="tarea-actions">
                    <button className="toggle-btn" onClick={() => handleToggleEstado(tarea)} title="Cambiar estado">
                      {tarea.estado === 'completada' ? '↩️' : '✅'}
                    </button>
                    <button className="edit-btn" onClick={() => handleEdit(tarea)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(tarea.id)}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>{editingTarea ? 'Editar Tarea' : 'Agregar Tarea'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="titulo"
                placeholder="Título"
                value={formData.titulo}
                onChange={handleChange}
                required
              />
              <textarea
                name="descripcion"
                placeholder="Descripción (opcional)"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
              />
              <select name="estado" value={formData.estado} onChange={handleChange}>
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
              </select>
              <input
                type="date"
                name="fecha_limite"
                placeholder="Fecha límite (opcional)"
                value={formData.fecha_limite}
                onChange={handleChange}
              />
              <div className="modal-buttons">
                <button type="submit" className="save-btn">Guardar</button>
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

  #tareas-list {
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .tarea-card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .tarea-info h3 {
    color: #007bff;
    margin: 0 0 8px 0;
    font-size: 18px;
  }

  .tarea-info p {
    color: #ccc;
    margin: 4px 0;
    font-size: 13px;
  }

  .tarea-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 8px;
  }

  .estado-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #000;
  }

  .tarea-actions {
    display: flex;
    gap: 8px;
  }

  .toggle-btn, .edit-btn, .delete-btn {
    background: transparent;
    border: 1px solid;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
  }

  .toggle-btn {
    border-color: #ffc107;
    color: #ffc107;
  }

  .toggle-btn:hover {
    background: #ffc107;
    color: #000;
  }

  .edit-btn {
    border-color: #007bff;
    color: #007bff;
  }

  .edit-btn:hover {
    background: #007bff;
    color: #161616;
  }

  .delete-btn {
    border-color: #dc3545;
    color: #dc3545;
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

  input, select, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #333;
    border-radius: 8px;
    background: #1a1a1a;
    color: white;
    font-size: 14px;
    box-sizing: border-box;
    font-family: inherit;
  }

  textarea {
    resize: vertical;
  }

  input:focus, select:focus, textarea:focus {
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

  .save-btn:hover {
    background: #0056b3;
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
