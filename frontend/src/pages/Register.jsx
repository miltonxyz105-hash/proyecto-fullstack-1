import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styled from 'styled-components'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { handleRegister } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await handleRegister(nombre, parseInt(edad), email, password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError("Error al registrar. intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <StyledWrapper>
        <div id="form-ui">
          <div id="form">
            <div id="form-body">
              <div id="welcome-lines">
                <div id="welcome-line-1">XP Legacy</div>
                <div id="welcome-line-2">Registro exitoso!</div>
              </div>
              <p style={{ color: '#ffffff', textAlign: 'center', marginTop: 20, fontSize: 16 }}>
                Redirigiendo al login...
              </p>
            </div>
          </div>
        </div>
      </StyledWrapper>
    )
  }

  return (
    <StyledWrapper>
      <div id="form-ui">
        <form onSubmit={handleSubmit} id="form">
          <div id="form-body">
            <div id="welcome-lines">
              <div id="welcome-line-1">XP Legacy</div>
              <div id="welcome-line-2">Forjá tu historia.</div>
            </div>

            {error && <p style={{ color: '#ff4444', textAlign: 'center', marginTop: 15, fontSize: 14 }}>{error}</p>}

            <div id="input-area">
              <div className="form-inp">
                <input
                  placeholder="Nombre completo"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="form-inp">
                <input
                  placeholder="Edad"
                  type="number"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="form-inp">
                <input
                  placeholder="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-inp">
                <input
                  placeholder="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div id="submit-button-cvr">
              <button id="submit-button" type="submit" disabled={loading}>
                {loading ? 'Cargando...' : 'Registrarse'}
              </button>
            </div>

            <div id="forgot-pass">
              <Link to="/login">Iniciar Sesión</Link>
            </div>

            <div id="bar" />
          </div>
        </form>
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
    min-height: 100vh;
    display: grid;
    place-items: center;
    background-color: #000;

    #form {
        display: grid;
        place-items: center;
        width: 300px;
        height: 600px;
        padding: 25px;
        background-color: #161616;
        box-shadow: 0px 15px 60px #007bff;
        outline: 1px solid #007bff;
        border-radius: 10px;
        position: relative;
    }

    #form-body {
        position: absolute;
        top: 50%;
        right: 25px;
        left: 25px;
        width: 230px;
        margin: -230px auto 0 auto;
    }

    #welcome-lines {
        text-align: center;
        line-height: 1;
    }

    #welcome-line-1 { 
        color: #007bff; 
        font-weight: 600; 
        font-size: 40px;
    }

    #welcome-line-2 { 
        color: #ffffff; 
        font-size: 17px;
        margin-top: 17px;
    }

    #input-area {
        margin-top: 40px;
    }

    .form-inp {
        padding: 11px 25px;
        background-color: transparent;
        border: 1px solid #e3e3e3;
        border-radius: 8px;
        line-height: 1;
        margin-bottom: 15px;
    }

    .form-inp:focus-within {
        border-color: 1px solid #007bff;
    }

    .form-inp input {
        width: 100%;
        background: none;
        font-size: 13.4px; 
        color: #007bff; 
        border: none;
        padding: 0;
        margin: 0;
    }

    .form-inp input:focus {
        outline: none;
    }

    #submit-button-cvr {
        margin-top: 20px; 
    }

    #submit-button {
        display: block;
        width: 100%;
        padding: 14px 13px 12px 13px;
        border: 0;
        outline: 1px solid #007bff; 
        background-color: transparent;
        border-radius: 8px;
        line-height: 1; 
        color: #007bff; 
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        font-weight: 600; 
        font-size: 14px; 
        margin: 0;
    }

    #submit-button:hover:not(:disabled) {
        background-color: #007bff; 
        color: #161616; 
        cursor: pointer;
        transition: all ease-in-out .3s;
    }

    #submit-button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    #forgot-pass {
        text-align: center; 
        margin-top: 15px; 
    }

    #forgot-pass a {
        color: #007bff;
        font-size: 14px; 
        text-decoration: none;
        font-weight: 600;
        padding: 8px 16px;
        border: 1px solid #007bff;
        display: inline-block;
        transition: all 0.3s ease-in-out;
    }

    #forgot-pass a:hover {
        background-color: #007bff; 
        color: #161616; 
    }

    #bar {
        position: absolute;
        left: 50%;
        width: 28px;
        height: 8px;
        background-color: #007bff;
        margin-left: -33px;
        bottom: -50px;
        border-radius: 10px;
    }
        
    #bar:before,
    #bar:after {
        content: "";
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: #ececec;
        border-radius: 50%;
    }

    #bar:before {
        right: -20px;
    }
    #bar:after {
        right: -38px;
    }
`