const pool = require('../db');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function createUser(name, lastname, email, passwordHash, role, phone = null) {
  const [result] = await pool.query(
    'INSERT INTO users (name, lastname, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [name, lastname, email, passwordHash, role, phone]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

module.exports = { findByEmail, createUser, findById };