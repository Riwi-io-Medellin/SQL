# 🗄️ Ejemplos CRUD con Supabase/Postgres (Sin ORM/SDK)

Este repositorio contiene dos ejemplos didácticos completos para enseñar operaciones CRUD contra PostgreSQL en Supabase **sin usar ORMs ni SDKs**, conectándose directamente a las APIs nativas.

## 📁 Estructura del Proyecto

```
ejemplos-supabase/
├── frontend-estatico/
│   └── index.html          # Frontend 100% estático con vanilla JS
├── backend-express/
│   ├── server.js           # Backend Express minimalista
│   ├── package.json        # Dependencias Node.js
│   └── env-sample.txt      # Variables de entorno de ejemplo
└── README.md               # Este archivo
```

## 🎯 Ejemplo 1: Frontend Estático (HTML + JS Vanilla)

### Características
- **100% estático**: Solo HTML, CSS y JavaScript vanilla
- **REST API nativa**: Conecta directamente a `/rest/v1` de Supabase
- **Autenticación**: Headers `apikey` y `Authorization: Bearer <anon_key>`
- **Tabla objetivo**: `public.items` con columnas `id serial` y `name text`
- **Funcionalidades**: Listar, crear, actualizar (con prompt), eliminar
- **UI mínima**: Tabla con botones "Editar/Eliminar"
- **Manejo de errores**: Usa `alert()` para feedback inmediato

### Configuración Requerida

1. **Crear la tabla en Supabase**:
```sql
CREATE TABLE public.items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
```

2. **Configurar RLS (Row Level Security)**:
```sql
-- Habilitar RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Crear política permisiva para desarrollo
CREATE POLICY "Allow all operations" ON public.items 
FOR ALL USING (true);
```

3. **Configurar CORS** (si es necesario):
   - Ve a tu proyecto Supabase > Settings > API
   - En "CORS origins", agrega tu dominio o `*` para desarrollo

### Uso
1. Abre `frontend-estatico/index.html` en tu navegador
2. Completa la configuración con tu URL y anon key de Supabase
3. ¡Listo para hacer CRUD!

## 🚀 Ejemplo 2: Backend Express Minimalista

### Características
- **Node.js ≥ 18**: Usa las últimas características
- **Dependencias mínimas**: `express`, `pg`, `dotenv`
- **Conexión directa**: Se conecta al host PostgreSQL de Supabase con SSL
- **Rutas REST completas**:
  - `GET /users` → `SELECT * FROM public.users ORDER BY id`
  - `POST /users` → Inserta con `{ username, role='member' }`
  - `PATCH /users/:id` → Actualiza con COALESCE
  - `DELETE /users/:id` → Elimina por ID
- **Respuestas JSON**: Formato consistente con manejo de errores 404/500
- **Comandos curl**: Ejemplos incluidos en el código

### Configuración Requerida

1. **Crear la tabla en Supabase**:
```sql
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **Instalar dependencias**:
```bash
cd backend-express
npm install
```

3. **Configurar variables de entorno**:
```bash
cp env-sample.txt .env
# Editar .env con tus datos de Supabase
```

4. **Ejecutar el servidor**:
```bash
npm start
# o para desarrollo con auto-reload:
npm run dev
```

### Ejemplos de Uso con curl

```bash
# Obtener todos los usuarios
curl -X GET http://localhost:3000/users

# Crear usuario
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "juan_perez", "role": "admin"}'

# Actualizar usuario
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"username": "juan_carlos"}'

# Eliminar usuario
curl -X DELETE http://localhost:3000/users/1
```

## 🔒 Seguridad y Buenas Prácticas

### ¿Por qué el enfoque directo NO es inseguro?

**El uso directo de `fetch()` con `anon_key` es seguro cuando las RLS están bien configuradas** por las siguientes razones:

1. **Row Level Security (RLS)**: Las políticas de RLS se ejecutan a nivel de base de datos, no importa cómo se acceda
2. **Anon key limitada**: La clave anónima solo tiene permisos básicos definidos por tus políticas
3. **Validación en BD**: Todas las validaciones críticas deben estar en la base de datos, no en el cliente
4. **Auditoría**: Supabase registra todas las operaciones para auditoría

### Cuándo usar Backend Propio

Considera migrar a un backend propio cuando necesites:

- **Lógica de negocio compleja**: Validaciones, cálculos, integraciones
- **Autenticación personalizada**: Sistemas de auth externos o complejos
- **APIs de terceros**: Integraciones que requieren claves secretas
- **Transformación de datos**: Procesamiento pesado antes de guardar
- **Caching avanzado**: Redis, memcached, etc.
- **Rate limiting**: Control granular de límites de uso

### Configuración de Seguridad

#### 1. CORS (Cross-Origin Resource Sharing)
```javascript
// Para desarrollo local
CORS_ORIGINS: ["http://localhost:3000", "http://127.0.0.1:5500"]

// Para producción
CORS_ORIGINS: ["https://tu-dominio.com"]
```

#### 2. RLS (Row Level Security)
```sql
-- Siempre habilitar RLS en tablas públicas
ALTER TABLE public.mi_tabla ENABLE ROW LEVEL SECURITY;

-- Políticas específicas por operación
CREATE POLICY "Users can read own data" ON public.users 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON public.users 
FOR UPDATE USING (auth.uid() = user_id);
```

#### 3. SSL/TLS
```javascript
// Backend: Siempre usar SSL para Supabase
ssl: { rejectUnauthorized: false }

// Frontend: Siempre HTTPS en producción
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
```

### Mejores Prácticas Generales

1. **Nunca hardcodear credenciales**: Usa variables de entorno
2. **Validar en el servidor**: El cliente puede ser manipulado
3. **Usar HTTPS**: Especialmente en producción
4. **Implementar rate limiting**: Prevenir abuso de APIs
5. **Logs y monitoreo**: Registrar operaciones importantes
6. **Backup regular**: Configurar backups automáticos en Supabase
7. **Principio de menor privilegio**: Solo los permisos necesarios

## 🎓 Valor Didáctico

Estos ejemplos enseñan:

- **Conceptos fundamentales**: HTTP, REST, SQL directo
- **Arquitecturas diferentes**: Cliente-servidor vs. serverless
- **Seguridad real**: RLS, CORS, SSL en práctica
- **Debugging**: Manejo de errores y logging
- **Escalabilidad**: Cuándo y cómo evolucionar la arquitectura

## 📚 Recursos Adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [REST API Reference](https://supabase.com/docs/guides/api)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**💡 Tip**: Estos ejemplos son perfectos para entender los fundamentos antes de adoptar herramientas más complejas como ORMs o frameworks full-stack.
