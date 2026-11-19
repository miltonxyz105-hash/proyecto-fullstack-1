import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

export default function QuestLog() {
  // Datos de ejemplo simulando misiones
  const [tasks, setTasks] = useState([
    {
      id: 1,
      type: 'MAIN QUEST',
      title: 'Platinar Sekiro: Shadows Die Twice',
      description: 'Conseguir los 4 finales distintos en New Game+ para desbloquear el último logro.',
      reward: '1000 XP',
      completed: false,
      urgent: true,
    },
    {
      id: 2,
      type: 'DAILY',
      title: 'Revisar Wishlist en Steam',
      description: 'Chequear si Hollow Knight o Hades bajaron más del 50% en las ofertas de otoño.',
      reward: '50 XP',
      completed: true,
      urgent: false,
    },
    {
      id: 3,
      type: 'SIDE QUEST',
      title: 'Limpiar el Backlog',
      description: 'Terminar al menos 2 juegos indies que llevan más de 6 meses juntando polvo digital.',
      reward: '300 XP',
      completed: false,
      urgent: false,
    }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

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

      <div className="controls">
        <NewQuestButton>
          <span className="icon">+</span> ACEPTAR NUEVO CONTRATO
        </NewQuestButton>
      </div>

      <TaskList>
        {tasks.map((task) => (
          <QuestCard 
            key={task.id} 
            $completed={task.completed} 
            $urgent={task.urgent}
            onClick={() => toggleTask(task.id)}
          >
            <div className="status-indicator">
              <div className="checkbox">
                {task.completed && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              {!task.completed && <div className="pulse-line"></div>}
            </div>

            <div className="quest-content">
              <div className="quest-meta">
                <span className={`quest-type ${task.type.toLowerCase().replace(' ', '-')}`}>
                  [{task.type}]
                </span>
                {task.urgent && !task.completed && (
                  <span className="urgent-tag">⚠ ALTA PRIORIDAD</span>
                )}
              </div>
              
              <h2 className="quest-title">{task.title}</h2>
              <p className="quest-desc">{task.description}</p>
            </div>

            <div className="quest-reward">
              <span className="reward-label">RECOMPENSA</span>
              <span className="reward-value">{task.reward}</span>
            </div>

            <div className="hover-glitch"></div>
          </QuestCard>
        ))}
      </TaskList>
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

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
  padding-bottom: 20px;

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

const controls = styled.div`
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
  margin-bottom: 30px;

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
  background: ${(props) => props.$completed ? 'rgba(10, 10, 20, 0.4)' : 'linear-gradient(90deg, #0a0a14 0%, #06060a 100%)'};
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
  opacity: ${(props) => props.$completed ? 0.6 : 1};

  &:hover {
    background: ${(props) => props.$completed ? 'rgba(10, 10, 20, 0.8)' : '#0c0c16'};
    border-color: ${(props) => props.$completed ? '#4a4a6a' : '#00e5ff'};
    transform: translateX(10px);
    box-shadow: ${(props) => props.$completed ? 'none' : '0 5px 20px rgba(0, 123, 255, 0.15)'};

    .hover-glitch {
      opacity: ${(props) => props.$completed ? 0 : 0.1};
    }
    
    .checkbox {
      border-color: ${(props) => props.$completed ? '#00e5ff' : '#00e5ff'};
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
      border: 2px solid ${(props) => props.$completed ? '#00e5ff' : '#4a4a6a'};
      border-radius: ${(props) => props.$completed ? '50%' : '6px'};
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s;
      background: ${(props) => props.$completed ? 'rgba(0, 229, 255, 0.1)' : 'transparent'};

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
      color: ${(props) => props.$completed ? '#4a4a6a' : '#fff'};
      text-decoration: ${(props) => props.$completed ? 'line-through' : 'none'};
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

    .reward-label {
      font-size: 10px;
      color: #4a4a6a;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .reward-value {
      font-size: 18px;
      font-weight: 900;
      color: ${(props) => props.$completed ? '#4a4a6a' : '#00e5ff'};
      text-shadow: ${(props) => props.$completed ? 'none' : '0 0 10px rgba(0, 229, 255, 0.4)'};
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