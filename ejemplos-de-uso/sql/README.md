# CRUD SQL - PostgreSQL con Supabase

Este ejemplo demuestra un CRUD completo usando **SQL tradicional** con PostgreSQL a través de Supabase.

## 🗂️ Archivos

- `index.html` - Interfaz de usuario con Tailwind CSS
- `app.js` - Lógica de aplicación y operaciones CRUD
- `README.md` - Esta documentación

## 🚀 Cómo usar

### 1. Configurar Supabase

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a SQL Editor y ejecutar:

```sql
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Configurar RLS (Row Level Security):

```sql
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas las operaciones" ON productos
FOR ALL USING (true);
```

### 2. Configurar credenciales

**✅ PROYECTO CASI LISTO PARA USAR**

Las credenciales del proyecto ya están configuradas en `app.js`:

```javascript
const SUPABASE_URL = 'https://nplgifhzzbgkjuvnmmsl.supabase.co'
const SUPABASE_ANON_KEY = 'tu-clave-anonima-aqui' // Solo falta esta clave
```

**Solo necesitas obtener la ANON KEY:**
1. Ir a [tu dashboard de Supabase](https://supabase.com/dashboard)
2. Settings → API
3. Copiar "anon public" key
4. Reemplazar en `app.js`

### 📋 Información de conexión completa (LISTA)

```bash
# ✅ Para aplicaciones Node.js (con contraseña real)
DATABASE_URL=postgresql://postgres:dhU7DPdp+gf@db.nplgifhzzbgkjuvnmmsl.supabase.co:5432/postgres

# ✅ Para conexión directa con psql (con contraseña real)
psql -h aws-0-ap-northeast-1.pooler.supabase.com -p 6543 -d postgres -U postgres.nplgifhzzbgkjuvnmmsl
# Password: dhU7DPdp+gf

# 🔑 Para el cliente JavaScript (usado en este ejemplo)
URL: https://nplgifhzzbgkjuvnmmsl.supabase.co
ANON_KEY: [obtener desde dashboard - último paso]
```

### 3. Ejecutar

Abrir `index.html` en tu navegador.

## 📊 Características SQL demostradas

### Esquema Rígido
- Tabla con columnas fijas y tipos específicos
- Restricciones NOT NULL
- Claves primarias auto-incrementales
- Timestamps automáticos

### Operaciones CRUD
- **CREATE**: `INSERT INTO productos (...) VALUES (...)`
- **READ**: `SELECT * FROM productos ORDER BY id`
- **UPDATE**: `UPDATE productos SET ... WHERE id = ?`
- **DELETE**: `DELETE FROM productos WHERE id = ?`

### Validaciones
- Tipos de datos estrictos (VARCHAR, DECIMAL, INTEGER)
- Restricciones de longitud
- Valores requeridos vs opcionales

## 🎨 Interfaz

- **Tabla estructurada** - Refleja la naturaleza tabular de SQL
- **Formulario con validaciones** - Campos requeridos claramente marcados
- **Colores azules** - Representan el paradigma SQL tradicional

## 🔧 Estructura del código

```
app.js
├── Configuración de Supabase
├── Variables globales
├── Funciones de utilidad
├── Operaciones CRUD
│   ├── createProduct()
│   ├── getProducts()
│   ├── updateProduct()
│   └── deleteProduct()
├── Funciones de interfaz
└── Manejo de eventos
```

## 📝 Notas importantes

- Los datos se almacenan en PostgreSQL (base de datos relacional)
- Esquema fijo definido previamente
- Validaciones estrictas del lado del servidor
- Ideal para datos estructurados y relaciones complejas
- Transacciones ACID garantizadas
