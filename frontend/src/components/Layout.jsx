import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styled from 'styled-components'

export default function Layout({ children }) {
  const { user, handleLogout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const onLogout = () => {
    handleLogout()
    navigate('/login')
  }

  return (
    <StyledWrapper>
      <Sidebar $open={sidebarOpen}>
        <div className="sidebar-header">
          <div className="logo">XP LEGACY</div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <div className="user-info">
          <div className="avatar">{user?.email?.charAt(0).toUpperCase()}</div>
          <div className="user-email">{user?.email}</div>
        </div>

        <nav className="nav-menu">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </NavLink>
          <NavLink to="/juegos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🎮</span>
            <span className="nav-text">Mis Juegos</span>
          </NavLink>
          <NavLink to="/reviews" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📝</span>
            <span className="nav-text">Reviews</span>
          </NavLink>
          <NavLink to="/favoritos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">❤️</span>
            <span className="nav-text">Favoritos</span>
          </NavLink>
          <NavLink to="/tareas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📌</span>
            <span className="nav-text">Tareas</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Cerrar Sesión</span>
          </button>
        </div>
      </Sidebar>

      <MainContent $open={sidebarOpen}>
        {children}
      </MainContent>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #0a0a0a;
  color: white;
`

const Sidebar = styled.aside`
  width: ${props => props.$open ? '240px' : '60px'};
  min-height: 100vh;
  background: linear-gradient(180deg, #0d0d0d 0%, #141414 100%);
  border-right: 1px solid #1a1a2e;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow-x: hidden;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #1a1a2e;

    .logo {
      font-size: ${props => props.$open ? '18px' : '0'};
      font-weight: 700;
      color: #007bff;
      white-space: nowrap;
      overflow: hidden;
      transition: font-size 0.3s ease;
    }

    .toggle-btn {
      background: none;
      border: 1px solid #333;
      color: #666;
      cursor: pointer;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      flex-shrink: 0;
      transition: all 0.3s ease;

      &:hover {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: ${props => props.$open ? '12px' : '0'};
    padding: 15px 20px;
    border-bottom: 1px solid #1a1a2e;
    overflow: hidden;
    white-space: nowrap;

    .avatar {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007bff, #00d4ff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      color: white;
    }

    .user-email {
      font-size: 12px;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .nav-menu {
    flex: 1;
    padding: 15px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 8px;
      text-decoration: none;
      color: #888;
      transition: all 0.2s ease;
      white-space: nowrap;
      overflow: hidden;

      .nav-icon {
        font-size: 20px;
        min-width: 24px;
        text-align: center;
      }

      .nav-text {
        font-size: 14px;
        font-weight: 500;
      }

      &:hover {
        background: rgba(0, 123, 255, 0.1);
        color: #007bff;
      }

      &.active {
        background: rgba(0, 123, 255, 0.15);
        color: #007bff;
        border: 1px solid rgba(0, 123, 255, 0.3);
      }
    }
  }

  .sidebar-footer {
    padding: 15px 10px;
    border-top: 1px solid #1a1a2e;

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: #dc3545;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      overflow: hidden;

      .nav-icon {
        font-size: 20px;
        min-width: 24px;
        text-align: center;
      }

      .nav-text {
        font-size: 14px;
      }

      &:hover {
        background: rgba(220, 53, 69, 0.1);
        border-color: rgba(220, 53, 69, 0.3);
      }
    }
  }
`

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.$open ? '240px' : '60px'};
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  background: #0a0a0a;
  padding: 30px;
`