// src/server.js
require('dotenv').config(); // en EB no afecta; en local carga tu .env

const express = require('express');
const cors = require('cors');
const pool = require('./db');                 // tu pool MySQL (mysql2/promise)
const authRoutes = require('./routes/auth.routes'); // tus rutas de auth

const app = express();

// --- Seguridad / JSON / Proxy ---
app.set('trust proxy', 1);
app.use(express.json());

// --- CORS ---
const ALLOWED_ORIGINS = [
  'https://main.d2h33ckhxk3lu0.amplifyapp.com', // tu front en Amplify
  'http://localhost:5173',                      // dev local (opcional)
];

app.use(
  cors({
    origin(origin, cb) {
      // permitir llamadas de herramientas (curl/Postman) sin origin
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('Origen no permitido por CORS: ' + origin));
    },
    credentials: true,
  })
);

// --- Ruta raíz "de cortesía" (opcional) ---
app.get('/', (_, res) => {
  res.status(200).send('Backend OK - Elastic Beanstalk');
});

// --- Healthcheck (usado por EB y para probar DB) ---
app.get('/api/health', async (_, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.status(200).json({ ok: true, now: rows[0].now });
  } catch (e) {
    // Si falla aquí, suele ser conexión a DB (credenciales/SG/VPC)
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- (Temporal) Debug de variables de entorno ---
// Quita esta ruta cuando termines de verificar en EB.
app.get('/api/debug/env', (_, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST || null,
    DB_USER: process.env.DB_USER ? '<set>' : null,
    DB_NAME: process.env.DB_NAME || null,
    DB_PORT: process.env.DB_PORT || null,
  });
});

// --- Rutas de tu API ---
app.use('/api/auth', authRoutes);

// --- Manejo básico de errores (último middleware) ---
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

// --- Arranque en el puerto asignado por EB ---
const PORT = process.env.PORT || 8080; // EB inyecta PORT
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});