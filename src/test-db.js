// src/test-db.js
const pool = require('./db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ Conexión exitosa a la base de datos');
    console.log('Resultado de prueba:', rows[0].result);
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  } finally {
    process.exit();
  }
})();