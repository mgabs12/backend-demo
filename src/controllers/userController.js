const User = require('../models/User');

// Actualizar perfil de usuario
exports.updateProfile = async (req, res) => {
  try {
    const { name, lastname, phone } = req.body;
    const userId = req.user.id;

    const updated = await User.update(userId, { name, lastname, phone });

    if (!updated) {
      return res.status(400).json({
        error: 'No se pudo actualizar el perfil.'
      });
    }

    const user = await User.findById(userId);

    res.json({
      message: 'Perfil actualizado exitosamente',
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
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error al actualizar perfil.',
      details: error.message
    });
  }
};

// Obtener historial del usuario
exports.getHistory = async (req, res) => {
  try {
    const history = await User.getHistory(req.user.id);

    res.json({
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      error: 'Error al obtener historial.',
      details: error.message
    });
  }
};