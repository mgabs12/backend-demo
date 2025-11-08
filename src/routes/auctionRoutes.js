// backend/src/routes/auctionRoutes.js
const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { authenticate, esVendedor, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { validateCreateAuction, validateId, validateSearchAuctions } = require('../utils/validators');
const upload = require('../config/multer');

// Agrega esto para debug
console.log('Funciones en auctionController:', Object.keys(auctionController));

// GET /api/auctions - Obtener todas las subastas activas (público)
router.get('/', optionalAuth, auctionController.getAllAuctions);

// GET /api/auctions/search - Buscar subastas con filtros
router.get('/search', validateSearchAuctions, validate, auctionController.searchAuctions);

// GET /api/auctions/my-auctions - Obtener mis subastas (requiere ser vendedor)
router.get('/my-auctions', authenticate, esVendedor, auctionController.getMyAuctions);

// GET /api/auctions/:id - Obtener subasta por ID
router.get('/:id', validateId, validate, auctionController.getAuctionById);

// POST /api/auctions - Crear subasta (requiere ser vendedor)
router.post(
  '/', 
  authenticate, 
  esVendedor, 
  upload.array('images', 5),
  validateCreateAuction, 
  validate, 
  auctionController.createAuction
);

// PUT /api/auctions/:id/cancel - Cancelar subasta (requiere ser el vendedor)
router.put('/:id/cancel', authenticate, esVendedor, validateId, validate, auctionController.cancelAuction);

// PUT /api/auctions/:id/close - Cerrar subasta (para admin o proceso automático)
router.put('/:id/close', authenticate, validateId, validate, auctionController.closeAuction);

module.exports = router;