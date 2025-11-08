const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { validateRegister, validateLogin } = require('../utils/validators');

// POST /api/auth/register - Registro de usuario
router.post('/register', validateRegister, validate, authController.register);

// POST /api/auth/login - Login de usuario
router.post('/login', validateLogin, validate, authController.login);

// GET /api/auth/profile - Obtener perfil (requiere autenticación)
router.get('/profile', authenticate, authController.getProfile);

// GET /api/auth/me - Alias para obtener perfil (para compatibilidad con frontend)
router.get('/me', authenticate, authController.getProfile);

module.exports = router;