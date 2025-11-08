const db = require('../config/database');

class Auction {
  // Crear subasta
  static async create(auctionData) {
    const {
      title,
      brand,
      model,
      year,
      description,
      base_price,
      image_url,
      end_time,
      vendedor_id
    } = auctionData;

    const [result] = await db.execute(
      `INSERT INTO auctions 
       (title, brand, model, year, description, base_price, current_bid, 
        image_url, end_time, vendedor_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [title, brand, model, year, description, base_price, base_price, 
       image_url, end_time, vendedor_id]
    );

    return result.insertId;
  }

  // Obtener todas las subastas activas
  static async findAllActive() {
    const [rows] = await db.execute(
      `SELECT a.*, u.name as seller_name, u.lastname as seller_lastname,
              (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
       FROM auctions a 
       JOIN users u ON a.vendedor_id = u.id 
       WHERE a.status = 'activo' AND a.end_time > NOW()
       ORDER BY a.end_time ASC`
    );
    return rows;
  }

  // Obtener subasta por ID
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT a.*, u.name as seller_name, u.lastname as seller_lastname,
              u.email as seller_email, u.phone as seller_phone,
              (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
       FROM auctions a 
       JOIN users u ON a.vendedor_id = u.id 
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Obtener subastas por vendedor
  static async findBySeller(sellerId) {
    const [rows] = await db.execute(
      `SELECT a.*, 
              (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
       FROM auctions a 
       WHERE a.vendedor_id = ? 
       ORDER BY a.created_at DESC`,
      [sellerId]
    );
    return rows;
  }

  // Actualizar puja actual
  static async updateCurrentBid(auctionId, newBid) {
    const [result] = await db.execute(
      'UPDATE auctions SET current_bid = ? WHERE id = ?',
      [newBid, auctionId]
    );
    return result.affectedRows > 0;
  }

  // Cerrar subasta
  static async close(auctionId, winnerId = null) {
    const [result] = await db.execute(
      'UPDATE auctions SET status = ?, winner_id = ? WHERE id = ?',
      ['cerrado', winnerId, auctionId]
    );
    return result.affectedRows > 0;
  }

  // Cancelar subasta
  static async cancel(auctionId) {
    const [result] = await db.execute(
      'UPDATE auctions SET status = ? WHERE id = ?',
      ['cancelado', auctionId]
    );
    return result.affectedRows > 0;
  }

  // Buscar por filtros
  static async search(filters) {
    let query = `
      SELECT a.*, u.name as seller_name, u.lastname as seller_lastname,
             (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
      FROM auctions a 
      JOIN users u ON a.vendedor_id = u.id 
      WHERE a.status = 'activo'
    `;
    const params = [];

    if (filters.brand) {
      query += ' AND a.brand = ?';
      params.push(filters.brand);
    }
    if (filters.minPrice) {
      query += ' AND a.current_bid >= ?';
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      query += ' AND a.current_bid <= ?';
      params.push(filters.maxPrice);
    }
    if (filters.year) {
      query += ' AND a.year = ?';
      params.push(filters.year);
    }

    query += ' ORDER BY a.end_time ASC';

    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = Auction;