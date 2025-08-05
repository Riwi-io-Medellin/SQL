// server.js - CRUD Express mínimo para usuarios (MongoDB local)
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'crud_usuarios';
const COLLECTION_NAME = 'users';

let db;

// Conectar a MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Conectado a MongoDB: ${DB_NAME}`);
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Listar usuarios
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection(COLLECTION_NAME).find({}).toArray();
    // Convertir _id a id para mantener compatibilidad con el frontend
    const usersFormatted = users.map(user => ({
      id: user._id,
      username: user.username,
      role: user.role
    }));
    res.json(usersFormatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear usuario
app.post('/users', async (req, res) => {
  try {
    const { username, role = 'member' } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'El username es requerido' });
    }

    const newUser = { username, role };
    const result = await db.collection(COLLECTION_NAME).insertOne(newUser);
    
    // Retornar el usuario creado con formato compatible
    const createdUser = {
      id: result.insertedId,
      username,
      role
    };
    
    res.json(createdUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar usuario
app.patch('/users/:id', async (req, res) => {
  try {
    const { username, role } = req.body;
    const userId = req.params.id;

    // Validar ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Construir objeto de actualización solo con campos proporcionados
    const updateFields = {};
    if (username !== undefined) updateFields.username = username;
    if (role !== undefined) updateFields.role = role;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Formatear respuesta
    const updatedUser = {
      id: result.value._id,
      username: result.value.username,
      role: result.value.role
    };

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Validar ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const result = await db.collection(COLLECTION_NAME).findOneAndDelete({
      _id: new ObjectId(userId)
    });

    if (!result.value) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Formatear respuesta
    const deletedUser = {
      id: result.value._id,
      username: result.value.username,
      role: result.value.role
    };

    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

const PORT = process.env.PORT || 3000;

// Inicializar servidor
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
