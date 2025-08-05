// server.js - CRUD Express mínimo para usuarios (MongoDB local)
// Este archivo implementa un servidor web básico con operaciones CRUD para gestionar usuarios usando MongoDB

// ========== IMPORTACIÓN DE DEPENDENCIAS ==========
const express = require('express');                    // Framework web para Node.js
const { MongoClient, ObjectId } = require('mongodb');  // Driver nativo de MongoDB y ObjectId para IDs únicos
const cors = require('cors');                          // Middleware para permitir peticiones desde otros dominios
require('dotenv').config();                            // Carga variables de entorno desde archivo .env

// ========== CONFIGURACIÓN DEL SERVIDOR EXPRESS ==========
const app = express();                                 // Crea una instancia de la aplicación Express

// Middleware: funciones que se ejecutan antes de llegar a las rutas
app.use(cors());                                       // Permite peticiones desde cualquier origen (frontend)
app.use(express.json());                               // Permite que Express entienda JSON en el body de las peticiones

// ========== CONFIGURACIÓN DE MONGODB ==========
// Variables de configuración con valores por defecto
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';  // URI de conexión a MongoDB
const DB_NAME = process.env.DB_NAME || 'crud_usuarios';                  // Nombre de la base de datos
const COLLECTION_NAME = 'users';                                         // Nombre de la colección (equivalente a tabla en SQL)

// Variable global para mantener la conexión a la base de datos
let db;

// ========== FUNCIÓN DE CONEXIÓN A MONGODB ==========
// Establece la conexión con la base de datos MongoDB
async function connectDB() {
  try {
    // Crear cliente de MongoDB con la URI de conexión
    const client = new MongoClient(MONGO_URI);
    
    // Conectar al servidor MongoDB (operación asíncrona)
    await client.connect();
    
    // Seleccionar la base de datos específica
    db = client.db(DB_NAME);
    
    console.log(`✅ Conectado exitosamente a MongoDB: ${DB_NAME}`);
  } catch (error) {
    // Si falla la conexión, mostrar error y terminar la aplicación
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);  // Termina el proceso con código de error
  }
}

// ========== ENDPOINT: LISTAR USUARIOS (READ) ==========
// GET /users - Obtiene todos los usuarios de la colección MongoDB
app.get('/users', async (req, res) => {
  try {
    // Buscar todos los documentos en la colección 'users'
    // find({}) = buscar sin filtros (equivalente a SELECT * en SQL)
    // toArray() = convertir el cursor a un array de JavaScript
    const users = await db.collection(COLLECTION_NAME).find({}).toArray();
    
    // TRANSFORMACIÓN DE DATOS: MongoDB usa '_id', pero el frontend espera 'id'
    // Convertir _id a id para mantener compatibilidad con el frontend
    const usersFormatted = users.map(user => ({
      id: user._id,           // ObjectId de MongoDB → 'id' para el frontend
      username: user.username,
      role: user.role
    }));
    
    // Devolver los usuarios formateados como JSON
    res.json(usersFormatted);
  } catch (error) {
    // Manejo de errores: log del error y respuesta HTTP 500
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// ========== ENDPOINT: CREAR USUARIO (CREATE) ==========
// POST /users - Crea un nuevo usuario en la colección MongoDB
app.post('/users', async (req, res) => {
  try {
    // Extraer datos del cuerpo de la petición
    // Destructuring con valor por defecto: si no se envía 'role', usa 'member'
    const { username, role = 'member' } = req.body;
    
    // VALIDACIÓN: verificar que el username sea proporcionado
    if (!username) {
      return res.status(400).json({ error: 'El username es requerido' });
    }

    // Crear objeto del nuevo usuario (documento MongoDB)
    const newUser = { username, role };
    
    // Insertar documento en la colección
    // insertOne() = insertar un solo documento (equivalente a INSERT en SQL)
    const result = await db.collection(COLLECTION_NAME).insertOne(newUser);
    
    // FORMATEAR RESPUESTA: convertir ObjectId a string para compatibilidad
    // result.insertedId contiene el _id generado automáticamente por MongoDB
    const createdUser = {
      id: result.insertedId,    // ObjectId generado → 'id' para el frontend
      username,
      role
    };
    
    // Devolver el usuario creado
    res.json(createdUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// ========== ENDPOINT: ACTUALIZAR USUARIO (UPDATE) ==========
// PATCH /users/:id - Actualiza un usuario existente (actualización parcial)
app.patch('/users/:id', async (req, res) => {
  try {
    // Extraer datos del cuerpo de la petición
    const { username, role } = req.body;
    
    // Obtener ID desde los parámetros de la URL (ej: /users/507f1f77bcf86cd799439011)
    const userId = req.params.id;

    // VALIDACIÓN ESPECÍFICA DE MONGODB: verificar que el ID sea un ObjectId válido
    // ObjectId es el tipo de dato que usa MongoDB para IDs únicos (24 caracteres hexadecimales)
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // ACTUALIZACIÓN DINÁMICA: construir objeto solo con campos proporcionados
    // Esto permite actualizaciones parciales (solo username, solo role, o ambos)
    const updateFields = {};
    if (username !== undefined) updateFields.username = username;
    if (role !== undefined) updateFields.role = role;

    // Verificar que al menos un campo fue proporcionado
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    // OPERACIÓN DE ACTUALIZACIÓN EN MONGODB
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },    // Filtro: buscar por _id (convertir string a ObjectId)
      { $set: updateFields },           // Operador $set: actualizar solo los campos especificados
      { returnDocument: 'after' }       // Opción: devolver el documento DESPUÉS de la actualización
    );

    // Verificar si se encontró y actualizó el usuario
    if (!result.value) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // FORMATEAR RESPUESTA: convertir _id a id para compatibilidad con frontend
    const updatedUser = {
      id: result.value._id,
      username: result.value.username,
      role: result.value.role
    };

    res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// ========== ENDPOINT: ELIMINAR USUARIO (DELETE) ==========
// DELETE /users/:id - Elimina un usuario de la colección MongoDB
app.delete('/users/:id', async (req, res) => {
  try {
    // Obtener ID desde los parámetros de la URL
    const userId = req.params.id;

    // VALIDACIÓN DE OBJECTID: verificar formato válido antes de proceder
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // OPERACIÓN DE ELIMINACIÓN EN MONGODB
    // findOneAndDelete: busca un documento y lo elimina en una sola operación atómica
    const result = await db.collection(COLLECTION_NAME).findOneAndDelete({
      _id: new ObjectId(userId)    // Filtro: buscar por _id (convertir string a ObjectId)
    });

    // Verificar si se encontró y eliminó el usuario
    // Si result.value es null, significa que no se encontró ningún documento con ese ID
    if (!result.value) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // FORMATEAR RESPUESTA: devolver los datos del usuario eliminado
    // Esto es útil para confirmación en el frontend
    const deletedUser = {
      id: result.value._id,
      username: result.value.username,
      role: result.value.role
    };

    res.json(deletedUser);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ========== CONFIGURACIÓN DEL PUERTO ==========
const PORT = process.env.PORT || 3000;  // Puerto del servidor (variable de entorno o 3000 por defecto)

// ========== FUNCIÓN DE INICIO DEL SERVIDOR ==========
// Inicializa la conexión a MongoDB y luego inicia el servidor Express
async function startServer() {
  try {
    // PASO 1: Conectar a MongoDB antes de iniciar el servidor
    // Es importante establecer la conexión a la BD antes de aceptar peticiones
    await connectDB();
    
    // PASO 2: Iniciar el servidor Express una vez conectado a MongoDB
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Express ejecutándose en http://localhost:${PORT}`);
      console.log('📋 Endpoints disponibles:');
      console.log('   GET    /users     - Listar usuarios');
      console.log('   POST   /users     - Crear usuario');
      console.log('   PATCH  /users/:id - Actualizar usuario');
      console.log('   DELETE /users/:id - Eliminar usuario');
      console.log('💾 Base de datos: MongoDB');
      console.log(`📁 Colección: ${COLLECTION_NAME}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// ========== INICIO DE LA APLICACIÓN ==========
// Ejecutar la función de inicio y manejar errores no capturados
startServer().catch((error) => {
  console.error('💥 Error fatal al iniciar la aplicación:', error);
  process.exit(1);
});
