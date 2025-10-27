require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // <- CJS, ok
const authRoutes = require('./routes/auth.routes'); // <- SIN llaves

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (_, res) => {
  const [rows] = await pool.query('SELECT NOW() AS now');
  res.json({ ok: true, now: rows[0].now });
});

app.use('/api/auth', authRoutes); // <- pasa el router (función)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));