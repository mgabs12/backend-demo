const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

async function register(req, res) {
  try {
    const { name, lastname, email, password, role, phone } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'Faltan campos requeridos' });

    const existing = await userModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    const id = await userModel.createUser(name, lastname, email, hash, role, phone ?? null);

    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: { id, name, lastname, email, role, phone: phone ?? null }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error en el registro' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
}

module.exports = { register, login };