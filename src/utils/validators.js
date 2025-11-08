const { body, param, query } = require('express-validator');

// Validaciones para registro de usuario
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('lastname')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('role')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['comprador', 'vendedor']).withMessage('El rol debe ser comprador o vendedor'),
  
  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 8, max: 20 }).withMessage('El teléfono debe tener entre 8 y 20 caracteres')
];

// Validaciones para login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

// Validaciones para crear subasta (USANDO CAMELCASE como envía el frontend)
const validateCreateAuction = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 5, max: 255 }).withMessage('El título debe tener entre 5 y 255 caracteres'),
  
  body('brand')
    .trim()
    .notEmpty().withMessage('La marca es requerida')
    .isLength({ max: 100 }).withMessage('La marca debe tener máximo 100 caracteres'),
  
  body('model')
    .trim()
    .notEmpty().withMessage('El modelo es requerido')
    .isLength({ max: 100 }).withMessage('El modelo debe tener máximo 100 caracteres'),
  
  body('year')
    .notEmpty().withMessage('El año es requerido')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1990 y ${new Date().getFullYear() + 1}`),
  
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('La descripción debe tener máximo 2000 caracteres'),
  
  body('basePrice')
    .notEmpty().withMessage('El precio base es requerido')
    .isFloat({ min: 100 }).withMessage('El precio base debe ser al menos $100'),
  
  body('endDate')
    .notEmpty().withMessage('La fecha de cierre es requerida')
    .isISO8601().withMessage('La fecha debe estar en formato válido')
    .custom((value) => {
      const endDate = new Date(value);
      const now = new Date();
      if (endDate <= now) {
        throw new Error('La fecha de cierre debe ser futura');
      }
      return true;
    }),
  
  body('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('La URL de imagen debe ser válida')
];

// Validaciones para crear puja
const validateCreateBid = [
  body('auction_id')
    .notEmpty().withMessage('El ID de la subasta es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número positivo'),
  
  body('amount')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo')
];

// Validación de ID en parámetros
const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número positivo'),
  
  param('auctionId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID de subasta debe ser un número positivo')
];

// Validaciones para búsqueda de subastas
const validateSearchAuctions = [
  query('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }),
  
  query('year')
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateAuction,
  validateCreateBid,
  validateId,
  validateSearchAuctions
};