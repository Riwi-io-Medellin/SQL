const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false } // Necesario para Supabase
});

// Middleware para manejo de errores de base de datos
const handleDbError = (res, error, operation) => {
  console.error(`Error en ${operation}:`, error);
  res.status(500).json({ 
    error: 'Error interno del servidor', 
    details: error.message 
  });
};

// GET /users - Obtener todos los usuarios
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.users ORDER BY id');
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    handleDbError(res, error, 'obtener usuarios');
  }
});

// POST /users - Crear nuevo usuario
app.post('/users', async (req, res) => {
  const { username, role = 'member' } = req.body;
  
  // Validación básica
  if (!username || username.trim() === '') {
    return res.status(400).json({ 
      error: 'El campo username es requerido' 
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO public.users (username, role) VALUES ($1, $2) RETURNING *',
      [username.trim(), role]
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    // Manejo específico de errores de duplicados (si existe unique constraint)
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'El usuario ya existe' 
      });
    }
    handleDbError(res, error, 'crear usuario');
  }
});

// PATCH /users/:id - Actualizar usuario
app.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, role } = req.body;
  
  // Validar que el ID sea un número
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: 'ID de usuario inválido' 
    });
  }

  // Validar que al menos un campo esté presente
  if (!username && !role) {
    return res.status(400).json({ 
      error: 'Se debe proporcionar al menos username o role para actualizar' 
    });
  }

  try {
    // Usar COALESCE para actualizar solo los campos proporcionados
    const result = await pool.query(`
      UPDATE public.users 
      SET 
        username = COALESCE($2, username),
        role = COALESCE($3, role),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `, [parseInt(id), username?.trim(), role]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    handleDbError(res, error, 'actualizar usuario');
  }
});

// DELETE /users/:id - Eliminar usuario
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  
  // Validar que el ID sea un número
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: 'ID de usuario inválido' 
    });
  }

  try {
    const result = await pool.query(
      'DELETE FROM public.users WHERE id = $1 RETURNING *',
      [parseInt(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    handleDbError(res, error, 'eliminar usuario');
  }
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    availableEndpoints: [
      'GET /users',
      'POST /users', 
      'PATCH /users/:id',
      'DELETE /users/:id',
      'GET /health'
    ]
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Usuarios API: http://localhost:${PORT}/users`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

/* 
=== COMANDOS CURL DE EJEMPLO ===

# 1. Obtener todos los usuarios
curl -X GET http://localhost:3000/users

# 2. Crear nuevo usuario
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "juan_perez", "role": "admin"}'

# 3. Crear usuario con role por defecto
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "maria_garcia"}'

# 4. Actualizar solo el username
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"username": "juan_carlos"}'

# 5. Actualizar solo el role
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"role": "moderator"}'

# 6. Actualizar ambos campos
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"username": "juan_admin", "role": "admin"}'

# 7. Eliminar usuario
curl -X DELETE http://localhost:3000/users/1

# 8. Health check
curl -X GET http://localhost:3000/health

=== TABLA REQUERIDA ===
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

=== INSTALACIÓN Y USO ===
1. npm init -y
2. npm install express pg dotenv
3. Crear archivo .env con las variables
4. node server.js
*/
