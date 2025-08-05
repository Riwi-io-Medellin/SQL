# Ejemplo de Aplicación CRUD con Node.js y PostgreSQL

Este proyecto demuestra una arquitectura cliente-servidor simple para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre una base de datos PostgreSQL local. Consiste en un backend minimalista construido con Node.js y Express, y un frontend estático de vainilla JS que consume la API del backend.

El objetivo es proporcionar un ejemplo claro y funcional sin dependencias complejas como ORMs o SDKs, centrándose en la interacción directa con la base de datos a través de un servidor intermedio.

## Estructura del Proyecto

```
ejemplos/
├── backend-express/
│   ├── server.js           # Servidor Express con la lógica de la API
│   ├── package.json        # Dependencias del backend
│   └── .env                # Archivo para variables de entorno (crear manualmente)
├── frontend-estatico/
│   ├── index.html          # Estructura de la página web
│   ├── app.js              # Lógica del cliente (peticiones a la API)
│   └── style.css           # Estilos visuales
└── README.md               # Este archivo de documentación
```

## Componentes

### Backend (Express.js)

Un servidor simple que expone una API REST para gestionar una tabla `users`.

- **Tecnologías**: Node.js, Express, `node-postgres` (pg), `dotenv`, `cors`.
- **Funcionalidad**: Provee endpoints para listar, crear, actualizar y eliminar usuarios.
- **Conexión**: Se conecta directamente a una instancia local de PostgreSQL usando credenciales de un archivo `.env`.

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
- **PostgreSQL**: Una instancia local en ejecución.
- **NPM**: Gestor de paquetes de Node.js (incluido con Node.js).

### 1. Clonar y Configurar el Entorno

Primero, clona el repositorio y navega a la carpeta del proyecto.

```bash
npm install
```

Crea un archivo `.env` en la raíz del proyecto, basándote en el archivo `.env.example`. Este archivo contendrá las credenciales de tu base de datos.

```bash
cp .env.example .env
```

Ahora, edita el archivo `.env` con tus credenciales de PostgreSQL:

```
DB_USER=tu_usuario
DB_HOST=localhost
DB_DATABASE=tu_base_de_datos
DB_PASSWORD=tu_contraseña
DB_PORT=5432
```

### 2. Configuración de la Base de Datos

Conéctese a su instancia de PostgreSQL y ejecute el siguiente comando SQL para crear la tabla `users` requerida por la aplicación.

```sql
A continuación, puedes poblar la tabla con algunos datos de ejemplo:

```sql
INSERT INTO public.users (username, role) VALUES
('admin', 'admin'),
('user1', 'member'),
('user2', 'member');
```

CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Configuración del Backend

1.  **Navegue al directorio del backend**:
    ```bash
    cd ejemplos/backend-express
    ```

2.  **Instale las dependencias**:
    ```bash
    npm install
    ```

3.  **Cree y configure el archivo de entorno**:
    Cree un archivo llamado `.env` en la raíz de `backend-express` y agregue las credenciales de su base de datos local.

    ```env
    # Archivo: ejemplos/backend-express/.env
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=postgres
    DB_USER=YOUR_POSTGRES_USER
    DB_PASSWORD=YOUR_POSTGRES_PASSWORD
    ```

4.  **Iniciar el Servidor**

Para iniciar el servidor en modo de desarrollo (se reinicia automáticamente con los cambios), ejecuta:

```bash
npm run dev
```

Si prefieres iniciarlo en modo de producción, usa:

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`.

### 3. Uso del Frontend

1.  **Abra el archivo `index.html`** en su navegador web.
    ```bash
    # Puede hacer doble clic en el archivo desde su explorador de archivos
    # o usar una extensión de servidor en vivo si lo prefiere.
    ```

2.  La página cargará y automáticamente solicitará los datos al backend. Ahora puede utilizar la interfaz para gestionar los usuarios.

## Endpoints de la API

El backend expone los siguientes endpoints:

- `GET /users`: Devuelve un array con todos los usuarios.
- `POST /users`: Crea un nuevo usuario. Requiere `username` y `role` (opcional) en el cuerpo de la solicitud.
- `PATCH /users/:id`: Actualiza un usuario existente. Puede recibir `username` y/o `role`.
- `DELETE /users/:id`: Elimina un usuario por su ID.
- `GET /health`: Endpoint de chequeo de salud que devuelve `{ "ok": true }`.
