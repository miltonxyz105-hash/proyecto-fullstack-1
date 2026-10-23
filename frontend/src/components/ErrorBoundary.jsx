import { Component } from 'react';

/**
 * Evita que un fallo de render destruya toda la aplicación.
 * Muestra un mensaje recuperable en lugar de una pantalla en blanco.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[XP Legacy] Error de render:', error, info?.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#0a0a0a',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 460 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h1 style={{ fontSize: 22, margin: '0 0 8px' }}>Algo salió mal</h1>
            <p style={{ color: '#888', lineHeight: 1.6, margin: '0 0 20px' }}>
              Se produjo un error inesperado en la interfaz. Puedes recargar la
              aplicación para continuar.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                background: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
