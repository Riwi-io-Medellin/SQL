// server.js - CRUD Express mínimo para usuarios (MySQL)
// Este archivo implementa un servidor web básico con operaciones CRUD para gestionar usuarios con MySQL.

// ========== IMPORTACIÓN DE DEPENDENCIAS ==========
const express = require('express');
const mysql = require('mysql2/promise'); // Cliente de MySQL para Node.js con soporte para Promesas
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// ========== CONFIGURACIÓN DEL SERVIDOR EXPRESS ==========
const app = express();
app.use(cors());
app.use(express.json());

// ========== CONFIGURACIÓN DE LA BASE DE DATOS ==========
// Pool de conexiones: mantiene múltiples conexiones para reutilización y mejor rendimiento
const pool = mysql.createPool({
  host: process.env.DB_HOST,        // Dirección del servidor de base de datos
  port: process.env.DB_PORT,        // Puerto de MySQL (generalmente 3306)
  database: process.env.DB_NAME,    // Nombre de la base de datos
  user: process.env.DB_USER,        // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  waitForConnections: true,
  connectionLimit: 10,                // Límite de conexiones en el pool
  queueLimit: 0
});

// ========== ENDPOINT: LISTAR USUARIOS (READ) ==========
app.get('/users', async (req, res) => {
  try {
    // En mysql2, el resultado es un array donde el primer elemento son las filas
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// ========== ENDPOINT: CREAR USUARIO (CREATE) ==========
app.post('/users', async (req, res) => {
  try {
    const { username, role = 'member' } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'El username es requerido' });
    }

    // MySQL no tiene 'RETURNING *', por lo que hacemos dos pasos:
    // 1. Insertar el nuevo usuario
    const [result] = await pool.query(
      'INSERT INTO users (username, role) VALUES (?, ?)',
      [username, role]
    );

    // 2. Seleccionar el usuario recién creado usando el ID de la inserción
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// ========== ENDPOINT: ACTUALIZAR USUARIO (UPDATE) ==========
app.patch('/users/:id', async (req, res) => {
  try {
    const { username, role } = req.body;
    const userId = req.params.id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // 1. Obtener los valores actuales del usuario para asegurar que existe
    const [currentUser] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // 2. Actualizar el usuario. IFNULL es el equivalente de COALESCE en MySQL
    await pool.query(
      'UPDATE users SET username = IFNULL(?, username), role = IFNULL(?, role) WHERE id = ?',
      [username, role, userId]
    );

    // 3. Seleccionar y devolver el usuario actualizado
    const [updatedUser] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    res.json(updatedUser[0]);

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// ========== ENDPOINT: ELIMINAR USUARIO (DELETE) ==========
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // 1. Encontrar el usuario que se va a eliminar para poder devolverlo
    const [userToDelete] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userToDelete.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // 2. Eliminar el usuario
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    
    // 3. Devolver el usuario que fue eliminado
    res.json(userToDelete[0]);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ========== ENDPOINT: SUBIDA MASIVA DE USUARIOS (CREATE) ==========
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const upload = multer({ dest: uploadsDir });

app.post('/users/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }

  const filePath = req.file.path;
  const fileExt = path.extname(req.file.originalname).toLowerCase();
  const usersToInsert = [];

  try {
    if (fileExt === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            const username = row.username || row.user || row.name || row.nombre;
            if (username) {
              usersToInsert.push({ username: username.trim(), role: row.role || 'member' });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (fileExt === '.txt') {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split(/\r?\n/);
      lines.forEach(line => {
        const username = line.trim();
        if (username) {
          usersToInsert.push({ username, role: 'member' });
        }
      });
    } else {
      return res.status(400).json({ error: 'Formato de archivo no soportado. Use CSV o TXT.' });
    }

    if (usersToInsert.length === 0) {
      return res.status(400).json({ error: 'El archivo está vacío o no contiene datos válidos.' });
    }

    // mysql2 puede manejar inserciones masivas de forma segura con un array de arrays
    const values = usersToInsert.map(user => [user.username, user.role]);
    const query = 'INSERT INTO users (username, role) VALUES ?';

    // Ejecuta la consulta de inserción masiva
    const [result] = await pool.query(query, [values]);

    // Envía una respuesta con el número de usuarios creados
    res.status(201).json({ 
      message: `${result.affectedRows} usuarios creados exitosamente.`
    });

  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ error: 'Error interno al procesar el archivo.' });
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// ========== ENDPOINT: VERIFICACIÓN DE SALUD ==========
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ========== INICIO DEL SERVIDOR ==========
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express para MySQL ejecutándose en http://localhost:${PORT}`);
  console.log('📋 Endpoints disponibles:');
  console.log('   GET    /users     - Listar usuarios');
  console.log('   POST   /users     - Crear usuario');
  console.log('   PATCH  /users/:id - Actualizar usuario');
  console.log('   DELETE /users/:id - Eliminar usuario');
  console.log('   POST   /users/upload - Cargar usuarios desde archivo');
  console.log('   GET    /health    - Estado del servidor');
});
