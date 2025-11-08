const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { validateCreateBid, validateId } = require('../utils/validators');

// POST /api/bids - Crear puja (requiere autenticación)
router.post('/', authenticate, validateCreateBid, validate, bidController.createBid);

// GET /api/bids/my-bids - Obtener mis pujas
router.get('/my-bids', authenticate, bidController.getMyBids);

// GET /api/bids/auction/:auctionId - Obtener pujas de una subasta
router.get('/auction/:auctionId', validateId, validate, bidController.getAuctionBids);

// GET /api/bids/auction/:auctionId/stats - Obtener estadísticas de pujas
router.get('/auction/:auctionId/stats', validateId, validate, bidController.getBidStats);

module.exports = router;