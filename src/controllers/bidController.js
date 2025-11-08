const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// Crear puja
exports.createBid = async (req, res) => {
  try {
    const { auction_id, amount } = req.body;
    const userId = req.user.id;

    // Obtener subasta
    const auction = await Auction.findById(auction_id);

    if (!auction) {
      return res.status(404).json({
        error: 'Subasta no encontrada.'
      });
    }

    // Verificar que la subasta esté activa
    if (auction.status !== 'activo') {
      return res.status(400).json({
        error: 'La subasta no está activa.'
      });
    }

    // Verificar que no haya expirado
    const now = new Date();
    const endTime = new Date(auction.end_time);
    if (now >= endTime) {
      return res.status(400).json({
        error: 'La subasta ha finalizado.'
      });
    }

    // Verificar que no sea el vendedor
    if (auction.vendedor_id === userId) {
      return res.status(403).json({
        error: 'No puedes pujar en tu propia subasta.'
      });
    }

    // Verificar que la puja sea mayor a la actual
    if (amount <= auction.current_bid) {
      return res.status(400).json({
        error: `La puja debe ser mayor a $${auction.current_bid}.`
      });
    }

    // Crear puja
    const bidId = await Bid.create({
      auction_id,
      user_id: userId,
      amount
    });

    // Actualizar puja actual de la subasta
    await Auction.updateCurrentBid(auction_id, amount);

    // Emitir evento de socket para actualización en tiempo real
    const io = req.app.get('io');
    if (io) {
      io.to(`auction-${auction_id}`).emit('new-bid', {
        bidId,
        auction_id,
        amount,
        bidder: {
          name: req.user.name || 'Usuario',
          id: userId
        },
        timestamp: new Date()
      });
    }

    res.status(201).json({
      message: 'Puja realizada exitosamente',
      bid: {
        id: bidId,
        auction_id,
        amount,
        user_id: userId
      }
    });
  } catch (error) {
    console.error('Error al crear puja:', error);
    res.status(500).json({
      error: 'Error al realizar puja.',
      details: error.message
    });
  }
};

// Obtener pujas de una subasta
exports.getAuctionBids = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const bids = await Bid.findByAuction(auctionId);

    res.json({
      count: bids.length,
      bids
    });
  } catch (error) {
    console.error('Error al obtener pujas:', error);
    res.status(500).json({
      error: 'Error al obtener pujas.',
      details: error.message
    });
  }
};

// Obtener pujas del usuario autenticado
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.findByUser(req.user.id);

    res.json({
      count: bids.length,
      bids
    });
  } catch (error) {
    console.error('Error al obtener mis pujas:', error);
    res.status(500).json({
      error: 'Error al obtener tus pujas.',
      details: error.message
    });
  }
};

// Obtener estadísticas de pujas de una subasta
exports.getBidStats = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const stats = await Bid.getStats(auctionId);

    res.json({
      auction_id: auctionId,
      stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas.',
      details: error.message
    });
  }
};