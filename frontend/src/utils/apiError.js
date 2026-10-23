/** Normaliza cualquier error de axios a un mensaje entendible por el usuario. */
export function getApiErrorMessage(error, fallback = 'Se produjo un error inesperado.') {
  const detalle = error?.response?.data?.detail;

  // Detalle simple del backend: {"detail": "Texto"}
  if (typeof detalle === 'string' && detalle.trim()) {
    return detalle;
  }

  // Errores de validación de Pydantic: {"detail": [{loc, msg}, ...]}
  if (Array.isArray(detalle) && detalle.length > 0) {
    const mensajes = detalle
      .map((item) => {
        const campo = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : null;
        if (!item?.msg) return null;
        return campo && campo !== 'body' ? `${campo}: ${item.msg}` : item.msg;
      })
      .filter(Boolean);

    if (mensajes.length > 0) return mensajes.join(' · ');
  }

  // Sin respuesta: el backend no está accesible (caído, CORS, red...).
  if (!error?.response) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }

  const status = error.response.status;
  if (status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (status === 404) return 'No se encontró el recurso solicitado.';
  if (status === 409) return 'La operación entra en conflicto con el estado actual.';
  if (status === 413) return 'Los datos enviados son demasiado grandes.';
  if (status === 422) return 'Revisa los datos del formulario, alguno no es válido.';
  if (status >= 500) {
    return 'El servidor tuvo un problema. Inténtalo de nuevo en unos segundos.';
  }

  return fallback;
}

export default getApiErrorMessage;
