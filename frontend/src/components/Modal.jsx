import { useEffect } from 'react';
import styled from 'styled-components';

/**
 * Modal reutilizable: centraliza overlay, cierre con Escape y click exterior.
 * Las primitivas de formulario viven en `FormControls.jsx`.
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Box $maxWidth={maxWidth} onClick={(event) => event.stopPropagation()}>
        <Header>
          <h2>{title}</h2>
          <CloseButton type="button" onClick={onClose} aria-label="Cerrar">
            ✕
          </CloseButton>
        </Header>
        {children}
      </Box>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 1000;
`;

const Box = styled.div`
  background: #141414;
  border: 1px solid #007bff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: ${(props) => props.$maxWidth}px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    color: #007bff;
    font-size: 20px;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background: #1a1a2e;
    color: #fff;
  }
`;
