// server.js - CRUD Express mínimo para usuarios (Postgres local)
// Este archivo implementa un servidor web básico con operaciones CRUD para gestionar usuarios

// ========== IMPORTACIÓN DE DEPENDENCIAS ==========
// server.js - CRUD Express mínimo para usuarios (Postgres local)
// Este archivo implementa un servidor web básico con operaciones CRUD para gestionar usuarios

// ========== IMPORTACIÓN DE DEPENDENCIAS ==========
const express = require('express');     // Framework web para Node.js
const { Pool } = require('pg');         // Cliente de PostgreSQL para Node.js
const cors = require('cors');           // Middleware para permitir peticiones desde otros dominios
require('dotenv').config();             // Carga variables de entorno desde archivo .env
const multer = require('multer');       // Middleware para manejar subida de archivos (form-data)
const fs = require('fs');               // Módulo del sistema de archivos para leer y eliminar archivos
const path = require('path');           // Módulo para trabajar con rutas de archivos
const csv = require('csv-parser');      // Parser para archivos CSV

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

// ========== ENDPOINT: SUBIDA MASIVA DE USUARIOS (CREATE) ==========
// Configuración de Multer para guardar archivos en la carpeta 'uploads'
// Crea el directorio 'uploads' si no existe, para evitar errores con multer
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuración de Multer para guardar archivos en la carpeta 'uploads'
const upload = multer({ dest: uploadsDir });

// POST /users/upload - Sube un archivo CSV o TXT para crear usuarios masivamente
app.post('/users/upload', upload.single('file'), async (req, res) => {
  // Verifica si se subió un archivo
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }

  const filePath = req.file.path; // Ruta del archivo temporal subido por multer
  const fileExt = path.extname(req.file.originalname).toLowerCase(); // Extensión del archivo original
  const usersToInsert = [];

  try {
    // Procesa el archivo según su extensión
    if (fileExt === '.csv') {
      // Procesa un archivo CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            // Busca el username en varias columnas posibles para mayor flexibilidad
            const username = row.username || row.user || row.name || row.nombre;
            if (username) {
              usersToInsert.push({ username: username.trim(), role: row.role || 'member' });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (fileExt === '.txt') {
      // Procesa un archivo de texto plano (un username por línea)
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split(/\r?\n/); // Divide por saltos de línea
      lines.forEach(line => {
        const username = line.trim();
        if (username) { // Ignora líneas vacías
          usersToInsert.push({ username, role: 'member' });
        }
      });
    } else {
      // Si el formato no es soportado, devuelve un error
            // Si el formato no es soportado, se devolverá un error y el archivo se limpiará en el `finally`
      return res.status(400).json({ error: 'Formato de archivo no soportado. Use CSV o TXT.' });
    }

    // Si no se encontraron usuarios para insertar, termina el proceso
    if (usersToInsert.length === 0) {
            // Si no se encontraron usuarios, se devolverá un error y el archivo se limpiará en el `finally`
      return res.status(400).json({ error: 'El archivo está vacío o no contiene datos válidos.' });
    }

    // Prepara los datos para una inserción masiva (bulk insert).
    // 1. .map(): Transforma cada objeto de usuario en una cadena SQL como ('nombre', 'rol').
    // 2. .replace(/'/g, "''"): Escapa las comillas simples en los usernames para prevenir inyección SQL.
    // 3. .join(','): Une todas las cadenas en una sola, separada por comas, para la consulta.
    // Esto es mucho más eficiente que hacer un INSERT por cada usuario.
    const values = usersToInsert.map(user => `('${user.username.replace(/'/g, "''")}', '${user.role}')`).join(',');
    const query = `INSERT INTO users (username, role) VALUES ${values} RETURNING *`;
    
    // Ejecuta la consulta de inserción masiva en la base de datos.
    // `await` pausa la ejecución hasta que la base de datos completa la operación.
    // Gracias a `RETURNING *`, la variable `r` contendrá todos los usuarios que se crearon.
    const r = await pool.query(query);

    // Envía una respuesta con el número de usuarios creados y sus datos
    res.status(201).json({ 
      message: `${r.rowCount} usuarios creados exitosamente.`,
      users: r.rows 
    });

  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ error: 'Error interno al procesar el archivo.' });
  } finally {
        // Asegura que el archivo temporal se elimine siempre, si aún existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
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
  console.log('   POST   /users/upload - Cargar usuarios desde archivo');
  console.log('   GET    /health    - Estado del servidor');
});
