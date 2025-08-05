// server.js - CRUD Express mínimo para usuarios (Postgres local)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false // Quita esto si usas Supabase
});

// Listar usuarios
app.get('/users', async (req, res) => {
  const r = await pool.query('SELECT * FROM users ORDER BY id');
  res.json(r.rows);
});

// Crear usuario
app.post('/users', async (req, res) => {
  const { username, role = 'member' } = req.body;
  const r = await pool.query(
    'INSERT INTO users (username, role) VALUES ($1, $2) RETURNING *',
    [username, role]
  );
  res.json(r.rows[0]);
});

// Actualizar usuario
app.patch('/users/:id', async (req, res) => {
  const { username, role } = req.body;
  const r = await pool.query(
    'UPDATE users SET username=COALESCE($2, username), role=COALESCE($3, role) WHERE id=$1 RETURNING *',
    [req.params.id, username, role]
  );
  res.json(r.rows[0] || null);
});

// Eliminar usuario
app.delete('/users/:id', async (req, res) => {
  const r = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [req.params.id]);
  res.json(r.rows[0] || null);
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
