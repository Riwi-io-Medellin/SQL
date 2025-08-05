# Ejemplo de Aplicación CRUD con Node.js y MongoDB

Este proyecto demuestra una arquitectura cliente-servidor simple para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre una base de datos MongoDB local. Consiste en un backend minimalista construido con Node.js y Express, y un frontend estático de vainilla JS que consume la API del backend.

El objetivo es proporcionar un ejemplo claro y funcional sin dependencias complejas como ORMs o SDKs, centrándose en la interacción directa con MongoDB a través de un servidor intermedio.

## Estructura del Proyecto

```
ejemplos-mongodb/
├── backend-express/
│   ├── server.js           # Servidor Express con la lógica de la API
│   ├── package.json        # Dependencias del backend
│   └── env-sample.txt      # Archivo de ejemplo para variables de entorno
├── frontend-estatico/
│   ├── index.html          # Estructura de la página web
│   ├── app.js              # Lógica del cliente (peticiones a la API)
│   └── style.css           # Estilos visuales
└── README.md               # Este archivo de documentación
```

## Componentes

### Backend (Express.js)

Un servidor simple que expone una API REST para gestionar una colección `users` en MongoDB.

- **Tecnologías**: Node.js, Express, `mongodb` (driver nativo), `dotenv`, `cors`.
- **Funcionalidad**: Provee endpoints para listar, crear, actualizar y eliminar usuarios.
- **Conexión**: Se conecta directamente a una instancia local de MongoDB usando credenciales de un archivo `.env`.

### Frontend (HTML, CSS, JS)

Una interfaz de usuario básica que permite interactuar con la API del backend de forma visual.

- **Tecnologías**: Vanilla JavaScript (sin frameworks), HTML5, CSS3.
- **Funcionalidad**: Muestra una tabla de usuarios, permite agregar nuevos, y editar o eliminar existentes.
- **Comunicación**: Utiliza la API `fetch` para realizar peticiones HTTP al backend.

---

## Guía de Instalación y Uso

Siga estos pasos para ejecutar el proyecto en su entorno local.

### Prerrequisitos

- **Node.js**: Versión 18 o superior.
- **MongoDB**: Una instancia local en ejecución o acceso a MongoDB Atlas.
- **NPM**: Gestor de paquetes de Node.js (incluido con Node.js).

### Paso 1: Configurar MongoDB

#### Opción A: MongoDB con Docker (Recomendado)
1. Asegúrate de tener Docker instalado y ejecutándose
2. Ejecuta MongoDB en un contenedor Docker:
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```
3. Verifica que el contenedor esté ejecutándose:
   ```bash
   docker ps
   ```

#### Opción B: MongoDB Local
1. Descarga e instala MongoDB Community Server desde [mongodb.com](https://www.mongodb.com/try/download/community)
2. Inicia el servicio MongoDB:
   ```bash
   # En Linux/macOS
   sudo systemctl start mongod
   # o
   brew services start mongodb/brew/mongodb-community
   
   # En Windows
   net start MongoDB
   ```

#### Opción C: MongoDB Atlas (Cloud)
1. Crea una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un cluster y obtén la cadena de conexión
3. Asegúrate de permitir conexiones desde tu IP

### Paso 2: Configurar el Backend

1. **Navegar al directorio del backend**:
   ```bash
   cd backend-express
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp env-sample.txt .env
   ```
   
   Edita el archivo `.env` con tu configuración:
   ```env
   # Para MongoDB local o Docker
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=crud_usuarios
   PORT=3001
   
   # Para MongoDB Atlas
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net
   DB_NAME=crud_usuarios
   PORT=3001
   ```
   
   **Nota**: Se recomienda usar el puerto 3001 para evitar conflictos con otras aplicaciones que puedan estar usando el puerto 3000.

4. **Ejecutar el servidor**:
   ```bash
   # Opción 1: Usando el puerto configurado en .env
   npm run dev
   
   # Opción 2: Especificando el puerto directamente (recomendado)
   PORT=3001 npm start
   ```
   
   El servidor estará disponible en `http://localhost:3001`
   
   **Verificación**: Deberías ver los siguientes mensajes:
   ```
   Conectado a MongoDB: crud_usuarios
   Servidor ejecutándose en http://localhost:3001
   ```

### Paso 3: Configurar el Frontend

1. **Verificar la configuración del puerto**:
   Asegúrate de que el archivo `frontend-estatico/app.js` tenga la URL correcta:
   ```javascript
   const API_URL = 'http://localhost:3001/users'; // URL del backend Express (MongoDB)
   ```

2. **Abrir el archivo HTML**:
   Abre `frontend-estatico/index.html` en tu navegador web.

3. **Verificar la conexión**:
   La página debería cargar y mostrar una tabla vacía de usuarios.
   
4. **Probar la funcionalidad**:
   - Intenta agregar un usuario nuevo
   - Verifica que aparezca en la tabla
   - Prueba editar y eliminar usuarios

---

## Diferencias con la Versión PostgreSQL

### Cambios en el Backend

1. **Driver de Base de Datos**: 
   - PostgreSQL: `pg` 
   - MongoDB: `mongodb` (driver nativo)

2. **Estructura de Datos**:
   - PostgreSQL: Tablas con esquemas fijos
   - MongoDB: Colecciones con documentos flexibles

3. **Identificadores**:
   - PostgreSQL: `id` (integer autoincremental)
   - MongoDB: `_id` (ObjectId), convertido a `id` para compatibilidad

4. **Consultas**:
   - PostgreSQL: SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
   - MongoDB: Métodos del driver (`find()`, `insertOne()`, `updateOne()`, `deleteOne()`)

### Ejemplo de Conversión de Consultas

```javascript
// PostgreSQL
const result = await pool.query('SELECT * FROM users ORDER BY id');

// MongoDB
const users = await db.collection('users').find({}).toArray();
```

```javascript
// PostgreSQL
const result = await pool.query(
  'INSERT INTO users (username, role) VALUES ($1, $2) RETURNING *',
  [username, role]
);

// MongoDB
const result = await db.collection('users').insertOne({ username, role });
```

---

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/users` | Obtener todos los usuarios |
| POST   | `/users` | Crear un nuevo usuario |
| PATCH  | `/users/:id` | Actualizar un usuario existente |
| DELETE | `/users/:id` | Eliminar un usuario |

### Ejemplos de Uso

```bash
# Listar usuarios
curl http://localhost:3001/users

# Crear usuario
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"username": "juan", "role": "admin"}'

# Actualizar usuario
curl -X PATCH http://localhost:3001/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"role": "member"}'

# Eliminar usuario
curl -X DELETE http://localhost:3001/users/507f1f77bcf86cd799439011
```

---

## Estructura de Datos

### Documento de Usuario en MongoDB

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "juan",
  "role": "admin"
}
```

### Respuesta de la API (formato compatible)

```javascript
{
  "id": "507f1f77bcf86cd799439011",
  "username": "juan",
  "role": "admin"
}
```

---

## Solución de Problemas

### Error de Conexión a MongoDB
- Verifica que MongoDB esté ejecutándose
- Revisa la URI de conexión en el archivo `.env`
- Para MongoDB Atlas, verifica la configuración de red

### Puerto en Uso
- Si el puerto 3001 está ocupado, usa otro puerto: `PORT=3002 npm start`
- Cambia el puerto en el archivo `.env` o úsalo como variable de entorno
- Actualiza la URL en `frontend-estatico/app.js` si cambias el puerto
- Verifica procesos en uso: `lsof -i :3001`

### CORS Issues
- El backend ya incluye configuración CORS
- Si usas un dominio diferente, ajusta la configuración en `server.js`

---

## Próximos Pasos

- Agregar validación de esquemas con Mongoose
- Implementar autenticación y autorización
- Agregar paginación y filtros
- Implementar logging y manejo de errores más robusto
- Agregar tests unitarios e integración
