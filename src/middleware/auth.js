const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Middleware para verificar autenticación
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado. Token no proporcionado.'
      });
    }

    // Extraer token
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido o expirado.'
      });
    }

    // Verificar que el usuario exista
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado.'
      });
    }

    // Agregar usuario completo al request (incluyendo nombre)
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      lastname: user.lastname
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({
      error: 'Error al verificar autenticación.',
      details: error.message
    });
  }
};

// Middleware para verificar rol de vendedor
const esVendedor = (req, res, next) => {
  if (req.user.role !== 'vendedor') {
    return res.status(403).json({
      error: 'Acceso denegado. Solo vendedores pueden realizar esta acción.'
    });
  }
  next();
};

// Middleware para verificar rol de comprador
const esComprador = (req, res, next) => {
  if (req.user.role !== 'comprador') {
    return res.status(403).json({
      error: 'Acceso denegado. Solo compradores pueden realizar esta acción.'
    });
  }
  next();
};

// Middleware opcional de autenticación (no bloquea si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            lastname: user.lastname
          };
        }
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  esVendedor,
  esComprador,
  optionalAuth
};