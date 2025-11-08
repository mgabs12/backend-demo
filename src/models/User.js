const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Crear usuario
  static async create(userData) {
    const { name, lastname, email, password, role, phone } = userData;
    
    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      `INSERT INTO users (name, lastname, email, password, role, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, lastname, email, hashedPassword, role, phone]
    );
    
    return result.insertId;
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Buscar usuario por ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, lastname, email, role, phone, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Validar contraseña
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Actualizar usuario
  static async update(id, userData) {
    const { name, lastname, phone } = userData;
    
    const [result] = await db.execute(
      'UPDATE users SET name = ?, lastname = ?, phone = ? WHERE id = ?',
      [name, lastname, phone, id]
    );
    
    return result.affectedRows > 0;
  }

  // Obtener historial de usuario
  static async getHistory(userId) {
    const [rows] = await db.execute(
      `SELECT h.*, a.title as auction_title 
       FROM user_history h 
       JOIN auctions a ON h.auction_id = a.id 
       WHERE h.user_id = ? 
       ORDER BY h.created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = User;