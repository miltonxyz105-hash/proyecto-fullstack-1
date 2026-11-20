import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea,
} from '../api';

const INITIAL_FORM = {
  titulo: '',
  descripcion: '',
  tipo: 'MAIN QUEST',
  recompensa: '500 XP',
  urgente: false,
  completada: false,
};

export default function Tareas() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el modal de Crear / Editar contrato
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const res = await getTareas();
      const lista = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTasks(lista);
    } catch (error) {
      console.error('Error al cargar misiones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalizador para soportar nombres de columnas en español o inglés
  const normalizarTarea = (task) => ({
    id: task.id,
    titulo: task.titulo || task.title || 'Misión sin título',
    descripcion: task.descripcion || task.description || '',
    tipo: (task.tipo || task.type || 'SIDE QUEST').toUpperCase(),
    recompensa: task.recompensa || task.reward || '100 XP',
    completada:
      task.completada !== undefined
        ? Boolean(task.completada)
        : Boolean(task.completed),
    urgente:
      task.urgente !== undefined
        ? Boolean(task.urgente)
        : Boolean(task.urgent),
  });

  const toggleTask = async (rawTask) => {
    const task = normalizarTarea(rawTask);
    const nuevoEstado = !task.completada;

    // Actualización optimista inmediata en pantalla
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, completada: nuevoEstado, completed: nuevoEstado }
          : t
      )
    );

    try {
      await updateTarea(task.id, {
        titulo: task.titulo,
        descripcion: task.descripcion,
        tipo: task.tipo,
        recompensa: task.recompensa,
        urgente: task.urgente,
        completada: nuevoEstado,
      });
    } catch (error) {
      console.error('Error al actualizar estado de la misión:', error);
      // Si falla el backend, revertimos el cambio visual
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, completada: task.completada, completed: task.completada }
            : t
        )
      );
      alert('No se pudo actualizar el estado de la misión.');
    }
  };

  const handleAbrirCrear = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setModalOpen(true);
  };

  const handleAbrirEditar = (e, rawTask) => {
    e.stopPropagation(); // Evita que al editar se marque/desmarque la tarea
    const task = normalizarTarea(rawTask);
    setEditingId(task.id);
    setFormData({
      titulo: task.titulo,
      descripcion: task.descripcion,
      tipo: task.tipo,
      recompensa: task.recompensa,
      urgente: task.urgente,
      completada: task.completada,
    });
    setModalOpen(true);
  };

  const handleGuardarTarea = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) return;

    try {
      setSaving(true);
      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        tipo: formData.tipo,
        recompensa: formData.recompensa.trim() || '100 XP',
        urgente: Boolean(formData.urgente),
        completada: Boolean(formData.completada),
      };

      if (editingId) {
        const res = await updateTarea(editingId, payload);
        const actualizada = res.data?.data || res.data || { id: editingId, ...payload };
        setTasks((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...actualizada } : t))
        );
      } else {
        const res = await createTarea(payload);
        const nueva = res.data?.data || res.data;
        if (nueva && nueva.id) {
          setTasks((prev) => [nueva, ...prev]);
        } else {
          await cargarTareas();
        }
      }

      setModalOpen(false);
      setFormData(INITIAL_FORM);
      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar el contrato:', error);
      alert('No se pudo guardar la misión. Revisá los campos o tu sesión.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (e, id, titulo) => {
    e.stopPropagation(); // Evita disparar el toggleTask de la tarjeta
    if (!window.confirm(`¿Abandonar y eliminar la misión "${titulo}"?`)) return;

    try {
      await deleteTarea(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error al eliminar misión:', error);
      alert('No se pudo eliminar la misión.');
    }
  };

  const normalizedTasks = tasks.map(normalizarTarea);
  const completedCount = normalizedTasks.filter((t) => t.completada).length;
  const progress =
    normalizedTasks.length > 0
      ? Math.round((completedCount / normalizedTasks.length) * 100)
      : 0;

  return (
    <TasksWrapper>
      <div className="bg-grid"></div>

      <Header>
        <div className="title-area">
          <h1>Registro de Misiones</h1>
          <p>Gestiona tus objetivos, compras y backlog</p>
        </div>

        <ProgressDisplay>
          <div className="progress-info">
            <span className="label">PROGRESO DEL SECTOR</span>
            <span className="percent">{progress}%</span>
          </div>
          <div className="bar-bg">
            <div className="bar-fill" style={{ width: `${progress}%` }}>
              <div className="glow-tip"></div>
            </div>
          </div>
        </ProgressDisplay>
      </Header>

      <ControlsRow>
        <NewQuestButton onClick={handleAbrirCrear}>
          <span className="icon">+</span> ACEPTAR NUEVO CONTRATO
        </NewQuestButton>
      </ControlsRow>

      {loading ? (
        <EmptyState>Sincronizando contratos activos con el servidor...</EmptyState>
      ) : normalizedTasks.length === 0 ? (
        <EmptyState>
          No tenés contratos activos en este sector. Hacé clic en{' '}
          <strong>+ ACEPTAR NUEVO CONTRATO</strong> para crear tu primera misión.
        </EmptyState>
      ) : (
        <TaskList>
          {normalizedTasks.map((task) => (
            <QuestCard
              key={task.id}
              $completed={task.completada}
              $urgent={task.urgente}
              onClick={() => toggleTask(task)}
            >
              <div className="status-indicator">
                <div className="checkbox">
                  {task.completada && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                {!task.completada && <div className="pulse-line"></div>}
              </div>

              <div className="quest-content">
                <div className="quest-meta">
                  <span className={`quest-type ${task.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                    [{task.tipo}]
                  </span>
                  {task.urgente && !task.completada && (
                    <span className="urgent-tag">⚠ ALTA PRIORIDAD</span>
                  )}
                </div>

                <h2 className="quest-title">{task.titulo}</h2>
                {task.descripcion && <p className="quest-desc">{task.descripcion}</p>}
              </div>

              <div className="quest-reward">
                <span className="reward-label">RECOMPENSA</span>
                <span className="reward-value">{task.recompensa}</span>

                <div className="card-mini-actions">
                  <MiniBtn
                    title="Editar misión"
                    onClick={(e) => handleAbrirEditar(e, task)}
                  >
                    ✎
                  </MiniBtn>
                  <MiniBtn
                    className="danger"
                    title="Eliminar misión"
                    onClick={(e) => handleEliminar(e, task.id, task.titulo)}
                  >
                    ✕
                  </MiniBtn>
                </div>
              </div>

              <div className="hover-glitch"></div>
            </QuestCard>
          ))}
        </TaskList>
      )}

      {/* MODAL CYBERPUNK PARA CREAR / EDITAR CONTRATO */}
      {modalOpen && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Modificar Contrato' : 'Nuevo Contrato'}</h2>

            <form onSubmit={handleGuardarTarea}>
              <div className="field">
                <label>Objetivo / Título de la misión *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Platinar Sekiro: Shadows Die Twice"
                />
              </div>

              <div className="field">
                <label>Detalles del contrato</label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Requisitos o notas adicionales..."
                />
              </div>

              <div className="row-2">
                <div className="field">
                  <label>Clasificación</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="MAIN QUEST">MAIN QUEST</option>
                    <option value="SIDE QUEST">SIDE QUEST</option>
                    <option value="DAILY">DAILY</option>
                  </select>
                </div>

                <div className="field">
                  <label>Recompensa</label>
                  <input
                    type="text"
                    value={formData.recompensa}
                    onChange={(e) =>
                      setFormData({ ...formData, recompensa: e.target.value })
                    }
                    placeholder="Ej: 1000 XP / Trofeo Platino"
                  />
                </div>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formData.urgente}
                  onChange={(e) =>
                    setFormData({ ...formData, urgente: e.target.checked })
                  }
                />
                <span>Marcar como ALTA PRIORIDAD ⚠</span>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setModalOpen(false)}
                >
                  CANCELAR
                </button>
                <button type="submit" className="save" disabled={saving}>
                  {saving ? 'PROCESANDO...' : 'ACEPTAR CONTRATO'}
                </button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </TasksWrapper>
  );
}

// --- ANIMACIONES ---
const scan = keyframes`
  0% { transform: translateY(-10px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(30px); opacity: 0; }
`;

const pulseWarning = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 0, 85, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 0, 85, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 0, 85, 0); }
`;

// --- ESTILOS ---
const TasksWrapper = styled.div`
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
    mask-image: radial-gradient(circle at top right, black, transparent 80%);
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
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
  padding-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;

  .title-area {
    h1 {
      font-size: 42px;
      font-weight: 900;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #fff;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
    }
    p {
      margin: 5px 0 0 0;
      color: #4a4a6a;
      font-size: 16px;
      letter-spacing: 1px;
    }
  }
`;

const ProgressDisplay = styled.div`
  width: 300px;
  background: rgba(10, 10, 20, 0.6);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #1a1a2e;

  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .label {
      font-size: 12px;
      color: #4a4a6a;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .percent {
      font-size: 14px;
      color: #00e5ff;
      font-weight: 900;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
    }
  }

  .bar-bg {
    width: 100%;
    height: 6px;
    background: #040406;
    border-radius: 4px;
    overflow: hidden;

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #00e5ff);
      position: relative;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);

      .glow-tip {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 15px;
        background: #fff;
        filter: blur(3px);
      }
    }
  }
`;

const ControlsRow = styled.div`
  margin-bottom: 30px;
`;

const NewQuestButton = styled.button`
  background: rgba(0, 229, 255, 0.05);
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.3);
  padding: 16px 32px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;

  .icon {
    font-size: 20px;
    font-weight: 900;
  }

  &:hover {
    background: rgba(0, 229, 255, 0.15);
    border-color: #00e5ff;
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.3), inset 0 0 10px rgba(0, 229, 255, 0.2);
    transform: translateX(5px);
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestCard = styled.div`
  display: flex;
  align-items: stretch;
  background: ${(props) => (props.$completed ? 'rgba(10, 10, 20, 0.4)' : 'linear-gradient(90deg, #0a0a14 0%, #06060a 100%)')};
  border: 1px solid ${(props) => {
    if (props.$completed) return '#1a1a2e';
    if (props.$urgent) return 'rgba(255, 0, 85, 0.4)';
    return '#1a1a2e';
  }};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${(props) => (props.$completed ? 0.6 : 1)};

  &:hover {
    background: ${(props) => (props.$completed ? 'rgba(10, 10, 20, 0.8)' : '#0c0c16')};
    border-color: ${(props) => (props.$completed ? '#4a4a6a' : '#00e5ff')};
    transform: translateX(10px);
    box-shadow: ${(props) => (props.$completed ? 'none' : '0 5px 20px rgba(0, 123, 255, 0.15)')};

    .hover-glitch {
      opacity: ${(props) => (props.$completed ? 0 : 0.1)};
    }
    
    .checkbox {
      border-color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }
  }

  .status-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-right: 24px;
    border-right: 1px solid #1a1a2e;
    position: relative;

    .checkbox {
      width: 28px;
      height: 28px;
      border: 2px solid ${(props) => (props.$completed ? '#00e5ff' : '#4a4a6a')};
      border-radius: ${(props) => (props.$completed ? '50%' : '6px')};
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s;
      background: ${(props) => (props.$completed ? 'rgba(0, 229, 255, 0.1)' : 'transparent')};

      svg {
        width: 16px;
        height: 16px;
        color: #00e5ff;
        filter: drop-shadow(0 0 5px rgba(0, 229, 255, 0.8));
      }
    }

    .pulse-line {
      position: absolute;
      bottom: -20px;
      width: 2px;
      height: 40px;
      background: linear-gradient(to bottom, #00e5ff, transparent);
      animation: ${scan} 2s infinite;
    }
  }

  .quest-content {
    flex: 1;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .quest-meta {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
      align-items: center;

      .quest-type {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #00e5ff;
        
        &.main-quest { color: #ffd700; }
        &.daily { color: #00ff88; }
        &.side-quest { color: #b57cff; }
      }

      .urgent-tag {
        background: rgba(255, 0, 85, 0.1);
        color: #ff0055;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255, 0, 85, 0.3);
        animation: ${pulseWarning} 2s infinite;
      }
    }

    .quest-title {
      margin: 0 0 6px 0;
      font-size: 20px;
      font-weight: 800;
      color: ${(props) => (props.$completed ? '#4a4a6a' : '#fff')};
      text-decoration: ${(props) => (props.$completed ? 'line-through' : 'none')};
      transition: color 0.3s;
    }

    .quest-desc {
      margin: 0;
      font-size: 14px;
      color: #b0b0c0;
      line-height: 1.5;
    }
  }

  .quest-reward {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    padding-left: 24px;
    border-left: 1px solid #1a1a2e;
    gap: 6px;

    .reward-label {
      font-size: 10px;
      color: #4a4a6a;
      letter-spacing: 1px;
    }

    .reward-value {
      font-size: 18px;
      font-weight: 900;
      color: ${(props) => (props.$completed ? '#4a4a6a' : '#00e5ff')};
      text-shadow: ${(props) => (props.$completed ? 'none' : '0 0 10px rgba(0, 229, 255, 0.4)')};
    }

    .card-mini-actions {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }
  }

  .hover-glitch {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.2), transparent);
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.5s ease, opacity 0.3s ease;
  }

  &:hover .hover-glitch {
    transform: translateX(100%);
  }
`;

const MiniBtn = styled.button`
  background: #11111f;
  border: 1px solid #1a1a2e;
  color: #8a8aa8;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
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

  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
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

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: #ff0055;
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