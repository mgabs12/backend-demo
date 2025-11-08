const db = require('../config/database');

class Bid {
  // Crear puja
  static async create(bidData) {
    const { auction_id, user_id, amount } = bidData;

    const [result] = await db.execute(
      'INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)',
      [auction_id, user_id, amount]
    );

    return result.insertId;
  }

  // Obtener pujas de una subasta
  static async findByAuction(auctionId) {
    const [rows] = await db.execute(
      `SELECT b.*, u.name as bidder_name, u.lastname as bidder_lastname
       FROM bids b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.auction_id = ? 
       ORDER BY b.amount DESC, b.created_at DESC`,
      [auctionId]
    );
    return rows;
  }

  // Obtener pujas de un usuario
  static async findByUser(userId) {
    const [rows] = await db.execute(
      `SELECT b.*, a.title as auction_title, a.status as auction_status
       FROM bids b 
       JOIN auctions a ON b.auction_id = a.id 
       WHERE b.user_id = ? 
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Obtener la puja más alta de una subasta
  static async getHighestBid(auctionId) {
    const [rows] = await db.execute(
      `SELECT b.*, u.name as bidder_name, u.lastname as bidder_lastname
       FROM bids b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.auction_id = ? 
       ORDER BY b.amount DESC 
       LIMIT 1`,
      [auctionId]
    );
    return rows[0];
  }

  // Contar pujas de un usuario en una subasta
  static async countUserBids(auctionId, userId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM bids WHERE auction_id = ? AND user_id = ?',
      [auctionId, userId]
    );
    return rows[0].count;
  }

  // Obtener estadísticas de pujas
  static async getStats(auctionId) {
    const [rows] = await db.execute(
      `SELECT 
        COUNT(*) as total_bids,
        COUNT(DISTINCT user_id) as unique_bidders,
        MAX(amount) as highest_bid,
        AVG(amount) as average_bid
       FROM bids 
       WHERE auction_id = ?`,
      [auctionId]
    );
    return rows[0];
  }
}

module.exports = Bid;