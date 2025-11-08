// Manejador global de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de MySQL duplicado
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Ya existe un registro con estos datos.',
      details: 'Email duplicado'
    });
  }

  // Error de MySQL de llave foránea
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: 'Referencia inválida a otro registro.'
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido en la solicitud.'
    });
  }

  // Error de validación de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado.'
    });
  }

  // Error genérico del servidor
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Manejador de rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = errorHandler;