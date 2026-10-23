import styled from 'styled-components';

/** Pantalla de carga uniforme para todas las páginas. */
export function LoadingView({ mensaje = 'Cargando...' }) {
  return (
    <Loading role="status">
      <Spinner aria-hidden="true" />
      <span>{mensaje}</span>
    </Loading>
  );
}

/** Estado vacío con llamada a la acción opcional. */
export function EmptyState({ icono = '🎮', titulo, descripcion, children }) {
  return (
    <Empty>
      <span className="icon">{icono}</span>
      <h3>{titulo}</h3>
      {descripcion && <p>{descripcion}</p>}
      {children}
    </Empty>
  );
}

/** Banner de error con botón de reintento. */
export function ErrorView({ error, onReintentar, titulo = 'Algo salió mal' }) {
  const mensaje =
    typeof error === 'string'
      ? error
      : error?.message || 'No se pudo cargar la información.';

  return (
    <ErrorBanner role="alert">
      <span className="icon" aria-hidden="true">
        ⚠️
      </span>
      <div className="body">
        <strong>{titulo}</strong>
        <p>{mensaje}</p>
      </div>
      {onReintentar && (
        <Retry type="button" onClick={onReintentar}>
          Reintentar
        </Retry>
      )}
    </ErrorBanner>
  );
}

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #888;
  padding: 80px 0;
  font-size: 15px;
`;

const Spinner = styled.span`
  width: 22px;
  height: 22px;
  border: 3px solid #1a1a2e;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: xp-spin 0.8s linear infinite;

  @keyframes xp-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 72px 16px;

  .icon {
    font-size: 56px;
    display: block;
    margin-bottom: 12px;
  }

  h3 {
    color: #fff;
    margin: 0 0 8px;
    font-size: 18px;
  }

  p {
    color: #666;
    margin: 0 auto 16px;
    max-width: 420px;
    line-height: 1.5;
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.45);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 20px;

  .icon {
    font-size: 20px;
  }

  .body {
    flex: 1;

    strong {
      color: #ff6b81;
      display: block;
      font-size: 14px;
      margin-bottom: 2px;
    }

    p {
      color: #ccc;
      margin: 0;
      font-size: 13px;
      line-height: 1.45;
    }
  }
`;

const Retry = styled.button`
  background: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #dc3545;
    color: #fff;
  }
`;
