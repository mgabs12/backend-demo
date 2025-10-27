// src/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');           // usa bcryptjs para evitar binarios nativos
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

/**
 * POST /api/auth/register
 * Body esperado: { name, lastname, email, password, role, phone }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, lastname, email, password, role = 'buyer', phone = null } = req.body;

    // Validaciones mínimas
    if (!name || !lastname || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // ¿email ya existe?
    const [dup] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (dup.length) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hash de contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Inserción
    const [result] = await pool.query(
      'INSERT INTO users (name, lastname, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, lastname, email, password_hash, role, phone]
    );

    const userId = result.insertId;

    // Traer usuario limpio (sin hash)
    const [rows] = await pool.query(
      'SELECT id, name, lastname, email, role, phone FROM users WHERE id = ?',
      [userId]
    );
    const user = rows[0];

    // JWT
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('Error en /register:', err);
    return res.status(500).json({ error: 'Error del servidor al registrar' });
  }
});

module.exports = router; // <- Exporta el router directamente