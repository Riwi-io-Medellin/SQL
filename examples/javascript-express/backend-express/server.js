// server.js - CRUD Express mínimo para usuarios (Postgres local)
// Este archivo implementa un servidor web básico con operaciones CRUD para gestionar usuarios

// ========== IMPORTACIÓN DE DEPENDENCIAS ==========
const express = require('express');     // Framework web para Node.js
const { Pool } = require('pg');         // Cliente de PostgreSQL para Node.js
const cors = require('cors');           // Middleware para permitir peticiones desde otros dominios
require('dotenv').config();             // Carga variables de entorno desde archivo .env

// ========== CONFIGURACIÓN DEL SERVIDOR EXPRESS ==========
const app = express();                  // Crea una instancia de la aplicación Express

// Middleware: funciones que se ejecutan antes de llegar a las rutas
app.use(cors());                        // Permite peticiones desde cualquier origen (frontend)
app.use(express.json());                // Permite que Express entienda JSON en el body de las peticiones

// ========== CONFIGURACIÓN DE LA BASE DE DATOS ==========
// Pool de conexiones: mantiene múltiples conexiones abiertas para mejor rendimiento
const pool = new Pool({
  host: process.env.DB_HOST,            // Dirección del servidor de base de datos
  port: process.env.DB_PORT,            // Puerto de PostgreSQL (generalmente 5432)
  database: process.env.DB_NAME,        // Nombre de la base de datos
  user: process.env.DB_USER,            // Usuario de la base de datos
  password: process.env.DB_PASSWORD,    // Contraseña del usuario
  ssl: false                            // Desactiva SSL para conexiones locales (actívalo para Supabase)
});

// ========== ENDPOINT: LISTAR USUARIOS (READ) ==========
// GET /users - Obtiene todos los usuarios de la base de datos
app.get('/users', async (req, res) => {
  try {
    // Ejecuta consulta SQL para obtener todos los usuarios ordenados por ID
    const r = await pool.query('SELECT * FROM users ORDER BY id');
    
    // Devuelve los resultados como JSON
    // r.rows contiene un array con todos los registros encontrados
    res.json(r.rows);
  } catch (error) {
    // En caso de error, devuelve un mensaje de error
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// ========== ENDPOINT: CREAR USUARIO (CREATE) ==========
// POST /users - Crea un nuevo usuario en la base de datos
app.post('/users', async (req, res) => {
  try {
    // Extrae datos del cuerpo de la petición
    // Si no se proporciona 'role', usa 'member' como valor por defecto
    const { username, role = 'member' } = req.body;
    
    // Validación básica
    if (!username) {
      return res.status(400).json({ error: 'El username es requerido' });
    }
    
    // Ejecuta consulta SQL para insertar nuevo usuario
    // $1, $2 son parámetros seguros que previenen inyección SQL
    // RETURNING * devuelve el registro recién creado
    const r = await pool.query(
      'INSERT INTO users (username, role) VALUES ($1, $2) RETURNING *',
      [username, role]  // Array con los valores para los parámetros $1, $2
    );
    
    // Devuelve el usuario creado (primer elemento del array de resultados)
    res.json(r.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// ========== ENDPOINT: ACTUALIZAR USUARIO (UPDATE) ==========
// PATCH /users/:id - Actualiza un usuario existente (actualización parcial)
app.patch('/users/:id', async (req, res) => {
  try {
    // Extrae datos del cuerpo de la petición
    const { username, role } = req.body;
    
    // req.params.id obtiene el ID desde la URL (ej: /users/123 -> id = 123)
    const userId = req.params.id;
    
    // Validación del ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    
    // COALESCE: si el nuevo valor es NULL, mantiene el valor actual
    // Esto permite actualizaciones parciales (solo username, solo role, o ambos)
    const r = await pool.query(
      'UPDATE users SET username=COALESCE($2, username), role=COALESCE($3, role) WHERE id=$1 RETURNING *',
      [userId, username, role]  // $1=id, $2=username, $3=role
    );
    
    // Si no se encontró el usuario, r.rows[0] será undefined
    // Devuelve el usuario actualizado o null si no existe
    res.json(r.rows[0] || null);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// ========== ENDPOINT: ELIMINAR USUARIO (DELETE) ==========
// DELETE /users/:id - Elimina un usuario de la base de datos
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validación del ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    
    // Ejecuta consulta para eliminar usuario por ID
    // RETURNING * devuelve los datos del registro eliminado
    const r = await pool.query(
      'DELETE FROM users WHERE id=$1 RETURNING *', 
      [userId]
    );
    
    // Si no se encontró el usuario para eliminar, r.rows[0] será undefined
    // Devuelve los datos del usuario eliminado o null si no existía
    res.json(r.rows[0] || null);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ========== ENDPOINT: VERIFICACIÓN DE SALUD ==========
// GET /health - Endpoint simple para verificar que el servidor está funcionando
app.get('/health', (req, res) => {
  // Responde con un JSON simple indicando que el servidor está activo
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ========== INICIO DEL SERVIDOR ==========
// Define el puerto donde el servidor escuchará las peticiones
const PORT = process.env.PORT || 3000;

// Inicia el servidor y muestra mensaje de confirmación
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express ejecutándose en http://localhost:${PORT}`);
  console.log('📋 Endpoints disponibles:');
  console.log('   GET    /users     - Listar usuarios');
  console.log('   POST   /users     - Crear usuario');
  console.log('   PATCH  /users/:id - Actualizar usuario');
  console.log('   DELETE /users/:id - Eliminar usuario');
  console.log('   GET    /health    - Estado del servidor');
});
