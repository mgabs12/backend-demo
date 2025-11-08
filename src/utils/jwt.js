const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'CarbidMyM';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Verificar token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Decodificar token sin verificar (útil para debugging)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};