const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

// PUT /api/users/profile - Actualizar perfil
router.put('/profile', 
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('lastname').optional().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().trim().isLength({ min: 8, max: 20 })
  ],
  validate,
  userController.updateProfile
);

// GET /api/users/history - Obtener historial
router.get('/history', authenticate, userController.getHistory);

module.exports = router;