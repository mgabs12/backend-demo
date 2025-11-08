const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { name, lastname, email, password, role, phone } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'El email ya está registrado.'
      });
    }

    // Crear usuario
    const userId = await User.create({
      name,
      lastname,
      email,
      password,
      role,
      phone
    });

    // Obtener usuario creado (sin contraseña)
    const user = await User.findById(userId);

    // Generar token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
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
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error al registrar usuario.'
    });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas.'
      });
    }

    // Validar contraseña
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas.'
      });
    }

    // Generar token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      message: 'Login exitoso',
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
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión.'
    });
  }
};

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado.'
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error al obtener perfil.'
    });
  }
};
