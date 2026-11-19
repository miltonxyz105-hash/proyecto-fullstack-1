import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled, { keyframes } from 'styled-components';

export default function Layout({ children }) {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  // Extraemos el nombre del email (ej: "milton" de "milton@mail.com")
  const userName = user?.email ? user.email.split('@')[0] : 'Jugador';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <StyledWrapper>
      <Sidebar $open={sidebarOpen}>
        <div className="bg-noise"></div>
        
        <Header $open={sidebarOpen}>
          <div className="logo-text">
            <span className="glow">XP</span> LEGACY
          </div>
          <button className="collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarOpen ? (
                <polyline points="15 18 9 12 15 6"></polyline>
              ) : (
                <polyline points="9 18 15 12 9 6"></polyline>
              )}
            </svg>
          </button>
        </Header>

        <ProfileSection $open={sidebarOpen}>
          <AvatarHex>
            <div className="hex-inner">
              <span className="initial">{initial}</span>
            </div>
            <div className="level-badge">LVL 42</div>
          </AvatarHex>
          {sidebarOpen && (
            <div className="user-info">
              <h2 className="user-name">{userName}</h2>
              <span className="user-status">
                <div className="status-dot"></div>
                Online
              </span>
            </div>
          )}
        </ProfileSection>

        <NavMenu>
          <NavLink to="/" end className="nav-link">
            <div className="active-indicator"></div>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-label">Dashboard</span>}
            <div className="scan-line"></div>
          </NavLink>

          <NavLink to="/juegos" className="nav-link">
            <div className="active-indicator"></div>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                <path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"></path>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-label">Mis Juegos</span>}
            <div className="scan-line"></div>
          </NavLink>

          <NavLink to="/reviews" className="nav-link">
            <div className="active-indicator"></div>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-label">Reviews</span>}
            <div className="scan-line"></div>
          </NavLink>

          <NavLink to="/favoritos" className="nav-link">
            <div className="active-indicator"></div>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-label">Favoritos</span>}
            <div className="scan-line"></div>
          </NavLink>

          <NavLink to="/tareas" className="nav-link">
            <div className="active-indicator"></div>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-label">Tareas</span>}
            <div className="scan-line"></div>
          </NavLink>
        </NavMenu>

        <Spacer />

        <LogoutSection $open={sidebarOpen}>
          <button className="logout-btn" onClick={onLogout}>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            {sidebarOpen && <span className="nav-label">Desconectar</span>}
          </button>
        </LogoutSection>
      </Sidebar>

      <MainContent $open={sidebarOpen}>
        {children}
      </MainContent>
    </StyledWrapper>
  );
}

// --- ANIMACIONES ---
const pulseDot = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(0, 255, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
`;

const scan = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// --- ESTILOS ---
const StyledWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #040406;
  color: white;
`;

const Sidebar = styled.aside`
  width: ${props => props.$open ? '280px' : '80px'};
  min-height: 100vh;
  background-color: #050508;
  border-right: 1px solid #1a1a2e;
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1);
  overflow-x: hidden;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;

  .bg-noise {
    position: absolute;
    inset: 0;
    opacity: 0.02;
    background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
    pointer-events: none;
    z-index: -1;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: ${props => props.$open ? 'space-between' : 'center'};
  align-items: center;
  padding: 24px ${props => props.$open ? '24px' : '0'};
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);

  .logo-text {
    display: ${props => props.$open ? 'block' : 'none'};
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 2px;
    
    .glow {
      color: #00e5ff;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
    }
  }

  .collapse-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #1a1a2e;
    color: #4a4a6a;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;

    &:hover {
      color: #00e5ff;
      border-color: #00e5ff;
      background: rgba(0, 229, 255, 0.1);
    }
    
    svg { width: 16px; height: 16px; }
  }
`;

const ProfileSection = styled.div`
  padding: 30px ${props => props.$open ? '24px' : '0'};
  display: flex;
  justify-content: ${props => props.$open ? 'flex-start' : 'center'};
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #1a1a2e;
  background: linear-gradient(180deg, rgba(0, 229, 255, 0.02) 0%, transparent 100%);

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    white-space: nowrap;

    .user-name {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.5px;
      text-transform: capitalize;
    }

    .user-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #00ff88;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;

      .status-dot {
        width: 6px;
        height: 6px;
        background: #00ff88;
        border-radius: 50%;
        animation: ${pulseDot} 2s infinite;
      }
    }
  }
`;

const AvatarHex = styled.div`
  position: relative;
  width: 46px;
  height: 46px;
  background: rgba(0, 229, 255, 0.1);
  border: 2px solid #00e5ff;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(45deg);
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
  flex-shrink: 0;

  .hex-inner {
    transform: rotate(-45deg);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .initial {
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.8);
  }

  .level-badge {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%) rotate(-45deg);
    background: #00e5ff;
    color: #040406;
    font-size: 8px;
    font-weight: 900;
    padding: 2px 4px;
    border-radius: 4px;
    letter-spacing: 1px;
    white-space: nowrap;
  }
`;

const NavMenu = styled.nav`
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .nav-link {
    position: relative;
    display: flex;
    align-items: center;
    padding: 14px 24px;
    cursor: pointer;
    color: #4a4a6a;
    transition: all 0.3s ease;
    overflow: hidden;
    text-decoration: none;

    .active-indicator {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #00e5ff;
      transform: scaleY(0);
      transition: transform 0.3s ease;
      box-shadow: 0 0 10px #00e5ff;
    }

    .icon-wrapper {
      margin-right: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 20px;
      
      svg {
        width: 20px;
        height: 20px;
        transition: all 0.3s ease;
      }
    }

    .nav-label {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1px;
      z-index: 2;
      white-space: nowrap;
    }

    .scan-line {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 50px;
      background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.4), transparent);
      animation: ${scan} 2s infinite linear;
      pointer-events: none;
      display: none; /* Se activa solo al estar active */
    }

    &:hover {
      color: #fff;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
      
      .icon-wrapper svg {
        transform: scale(1.1);
        color: #fff;
      }
    }

    /* React Router DOM aplica la clase 'active' automáticamente a la ruta actual */
    &.active {
      color: #fff;
      background: linear-gradient(90deg, rgba(0, 229, 255, 0.1) 0%, transparent 100%);

      .active-indicator {
        transform: scaleY(1);
      }

      .icon-wrapper svg {
        color: #00e5ff;
        filter: drop-shadow(0 0 5px rgba(0, 229, 255, 0.5));
      }

      .scan-line {
        display: block;
      }
    }
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const LogoutSection = styled.div`
  padding: 24px ${props => props.$open ? '24px' : '14px'};
  border-top: 1px solid #1a1a2e;

  .logout-btn {
    width: 100%;
    background: transparent;
    border: 1px solid rgba(255, 0, 85, 0.2);
    display: flex;
    align-items: center;
    justify-content: ${props => props.$open ? 'flex-start' : 'center'};
    padding: 12px ${props => props.$open ? '16px' : '0'};
    border-radius: 8px;
    cursor: pointer;
    color: #ff0055;
    transition: all 0.3s ease;
    overflow: hidden;

    .icon-wrapper {
      margin-right: ${props => props.$open ? '12px' : '0'};
      display: flex;
      align-items: center;
      justify-content: center;
      svg { width: 18px; height: 18px; }
    }

    .nav-label {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    &:hover {
      background: rgba(255, 0, 85, 0.1);
      border-color: #ff0055;
      box-shadow: 0 0 15px rgba(255, 0, 85, 0.2), inset 0 0 10px rgba(255, 0, 85, 0.1);
      transform: translateY(-2px);
    }
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.$open ? '280px' : '80px'};
  transition: margin-left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1);
  min-height: 100vh;
  background: #040406;
  position: relative;
`;