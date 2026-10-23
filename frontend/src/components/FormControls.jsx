import styled from 'styled-components';

/**
 * Primitivas de formulario compartidas por los modales.
 * Solo exportan estilos (sin componentes React con lógica) para mantener
 * el Fast Refresh estable.
 */

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #888;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const controlStyles = `
  width: 100%;
  padding: 12px;
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Select = styled.select`
  ${controlStyles}
`;

export const Textarea = styled.textarea`
  ${controlStyles}
  resize: vertical;
`;

export const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 4px;
`;

const buttonBase = `
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled.button`
  ${buttonBase}
  background: #007bff;
  color: #fff;

  &:hover:not(:disabled) {
    background: #0056b3;
  }
`;

export const GhostButton = styled.button`
  ${buttonBase}
  background: transparent;
  color: #888;
  border-color: #333;

  &:hover:not(:disabled) {
    color: #fff;
    border-color: #555;
  }
`;

export const DangerButton = styled.button`
  ${buttonBase}
  background: transparent;
  color: #dc3545;
  border-color: #dc3545;

  &:hover:not(:disabled) {
    background: #dc3545;
    color: #fff;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  cursor: pointer;
  user-select: none;

  input {
    width: auto;
    accent-color: #007bff;
  }
`;
