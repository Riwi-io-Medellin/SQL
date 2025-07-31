# DDL y Estructura de Datos: Construyendo los Cimientos de tu Base de Datos

¡Bienvenidos de nuevo! En este módulo vamos a convertirnos en los arquitectos de nuestras bases de datos. Aquí es donde realmente entiendes cómo diseñar y construir estructuras sólidas que soporten el peso de millones de datos.

## Comandos DDL: Los Maestros Constructores

### CREATE TABLE: Diseñando el Plano Perfecto

Crear una tabla es como diseñar una casa. Necesitas pensar en cada habitación (columna), qué propósito tiene, y cómo se conecta con el resto de la estructura.

#### Ejemplo Completo: Sistema de una Librería

```sql
-- MySQL
CREATE TABLE autores (
    id INT AUTO_INCREMENT PRIMARY KEY,     -- Identificador único que se incrementa solo
    nombre VARCHAR(100) NOT NULL,          -- Nombre del autor, máximo 100 caracteres
    apellido VARCHAR(100) NOT NULL,        -- Apellido del autor, obligatorio
    fecha_nacimiento DATE,                 -- Fecha de nacimiento (opcional)
    nacionalidad VARCHAR(50),              -- País de origen del autor
    biografia TEXT,                        -- Biografía larga del autor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Cuándo se creó el registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Cuándo se actualizó
);
```

```sql
-- PostgreSQL
CREATE TABLE autores (
    id SERIAL PRIMARY KEY,                 -- SERIAL es el equivalente a AUTO_INCREMENT
    nombre VARCHAR(100) NOT NULL,          -- Nombre del autor, máximo 100 caracteres
    apellido VARCHAR(100) NOT NULL,        -- Apellido del autor, obligatorio
    fecha_nacimiento DATE,                 -- Fecha de nacimiento (opcional)
    nacionalidad VARCHAR(50),              -- País de origen del autor
    biografia TEXT,                        -- Biografía larga del autor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Cuándo se creó el registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Cuándo se actualizó
);

-- En PostgreSQL necesitamos un trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;    -- Actualiza la fecha automáticamente
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_autores_updated_at 
    BEFORE UPDATE ON autores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

Ahora creemos la tabla de libros con relaciones:

```sql
-- MySQL
CREATE TABLE libros (
    id INT AUTO_INCREMENT PRIMARY KEY,     -- ID único del libro
    titulo VARCHAR(200) NOT NULL,          -- Título del libro, obligatorio
    isbn VARCHAR(20) UNIQUE,               -- ISBN único para cada libro
    autor_id INT,                          -- Referencia al autor (clave foránea)
    genero ENUM('Ficción', 'No Ficción', 'Ciencia', 'Historia', 'Biografía'), -- Opciones limitadas
    precio DECIMAL(8,2) CHECK (precio > 0), -- Precio con validación positiva
    stock INT DEFAULT 0,                   -- Cantidad en inventario, por defecto 0
    fecha_publicacion DATE,                -- Cuándo se publicó
    activo BOOLEAN DEFAULT TRUE,           -- Si está disponible para venta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE SET NULL -- Si se borra el autor, el libro queda sin autor
);
```

```sql
-- PostgreSQL
CREATE TYPE genero_libro AS ENUM ('Ficción', 'No Ficción', 'Ciencia', 'Historia', 'Biografía');

CREATE TABLE libros (
    id SERIAL PRIMARY KEY,                 -- ID único del libro
    titulo VARCHAR(200) NOT NULL,          -- Título del libro, obligatorio
    isbn VARCHAR(20) UNIQUE,               -- ISBN único para cada libro
    autor_id INTEGER,                      -- Referencia al autor (clave foránea)
    genero genero_libro,                   -- Usamos el tipo ENUM creado
    precio NUMERIC(8,2) CHECK (precio > 0), -- Precio con validación positiva
    stock INTEGER DEFAULT 0,               -- Cantidad en inventario, por defecto 0
    fecha_publicacion DATE,                -- Cuándo se publicó
    activo BOOLEAN DEFAULT TRUE,           -- Si está disponible para venta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE SET NULL -- Si se borra el autor, el libro queda sin autor
);
```

### Tipos de Datos: Eligiendo el Material Correcto

Elegir el tipo de dato correcto es como elegir el material para construir una casa. No usarías madera para los cimientos ni concreto para las ventanas.

#### Tipos Numéricos

```sql
-- Números Enteros
-- MySQL
CREATE TABLE ejemplos_numericos (
    muy_pequeno TINYINT,        -- -128 a 127 (1 byte)
    pequeno SMALLINT,           -- -32,768 a 32,767 (2 bytes)
    mediano MEDIUMINT,          -- -8,388,608 a 8,388,607 (3 bytes)
    normal INT,                 -- -2,147,483,648 a 2,147,483,647 (4 bytes)
    grande BIGINT               -- Números muy grandes (8 bytes)
);

-- PostgreSQL
CREATE TABLE ejemplos_numericos (
    muy_pequeno SMALLINT,       -- -32,768 a 32,767 (2 bytes)
    pequeno INTEGER,            -- -2,147,483,648 a 2,147,483,647 (4 bytes)
    grande BIGINT,              -- Números muy grandes (8 bytes)
    decimal_exacto NUMERIC(10,2), -- 10 dígitos totales, 2 decimales
    decimal_aprox REAL          -- Número de punto flotante
);
```

#### Tipos de Texto

```sql
-- MySQL
CREATE TABLE ejemplos_texto (
    codigo_corto CHAR(5),       -- Exactamente 5 caracteres (ej: "00001")
    nombre VARCHAR(100),        -- Hasta 100 caracteres variables
    descripcion_corta TEXT,     -- Texto largo (hasta 65,535 caracteres)
    descripcion_larga LONGTEXT  -- Texto muy largo (hasta 4GB)
);

-- PostgreSQL
CREATE TABLE ejemplos_texto (
    codigo_corto CHAR(5),       -- Exactamente 5 caracteres
    nombre VARCHAR(100),        -- Hasta 100 caracteres variables
    descripcion TEXT            -- Texto de longitud ilimitada
);
```

#### Tipos de Fecha y Tiempo

```sql
-- MySQL
CREATE TABLE ejemplos_tiempo (
    solo_fecha DATE,            -- Solo fecha: 2023-12-25
    solo_hora TIME,             -- Solo hora: 14:30:00
    fecha_y_hora DATETIME,      -- Fecha y hora: 2023-12-25 14:30:00
    marca_tiempo TIMESTAMP      -- Incluye zona horaria
);

-- PostgreSQL
CREATE TABLE ejemplos_tiempo (
    solo_fecha DATE,            -- Solo fecha: 2023-12-25
    solo_hora TIME,             -- Solo hora: 14:30:00
    fecha_y_hora TIMESTAMP,     -- Fecha y hora con zona horaria
    marca_tiempo TIMESTAMPTZ    -- Timestamp con zona horaria explícita
);
```

### Restricciones (Constraints): Las Reglas de la Casa

Las restricciones son como las reglas de una casa: mantienen todo en orden y evitan problemas.

#### PRIMARY KEY: El DNI de Cada Registro

```sql
-- Clave primaria simple
-- MySQL
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,     -- Identificador único autoincrementable
    email VARCHAR(100) UNIQUE NOT NULL     -- Email único y obligatorio
);

-- PostgreSQL
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,                 -- Identificador único autoincrementable
    email VARCHAR(100) UNIQUE NOT NULL     -- Email único y obligatorio
);

-- Clave primaria compuesta (cuando necesitas dos campos para identificar únicamente)
CREATE TABLE ventas_detalle (
    venta_id INT,                          -- ID de la venta
    producto_id INT,                       -- ID del producto
    cantidad INT NOT NULL,                 -- Cantidad vendida
    precio_unitario DECIMAL(8,2),          -- Precio por unidad
    PRIMARY KEY (venta_id, producto_id),   -- La combinación de ambos es única
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

#### FOREIGN KEY: Los Hilos que Conectan Todo

```sql
-- Ejemplo de relaciones entre tablas
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,     -- MySQL
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria_id INT,
    precio DECIMAL(8,2),
    -- Definimos la relación con acciones específicas
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON DELETE RESTRICT                  -- No permite borrar categoría si tiene productos
        ON UPDATE CASCADE                   -- Si cambia el ID de categoría, actualiza automáticamente
);
```

#### CHECK: Validaciones Personalizadas

```sql
-- MySQL (versión 8.0+)
CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad INT CHECK (edad >= 18 AND edad <= 65),    -- Solo mayores de edad y menores de 65
    salario DECIMAL(10,2) CHECK (salario > 0),     -- Salario debe ser positivo
    email VARCHAR(100) UNIQUE,
    departamento VARCHAR(50) CHECK (departamento IN ('Ventas', 'Marketing', 'IT', 'RRHH'))
);

-- PostgreSQL
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad INTEGER CHECK (edad >= 18 AND edad <= 65),
    salario NUMERIC(10,2) CHECK (salario > 0),
    email VARCHAR(100) UNIQUE,
    departamento VARCHAR(50) CHECK (departamento IN ('Ventas', 'Marketing', 'IT', 'RRHH'))
);
```

### ALTER TABLE: Remodelando sin Demoler

A veces necesitas hacer cambios en una casa que ya está habitada. Eso es exactamente lo que hace ALTER TABLE.

#### Agregando Columnas

```sql
-- MySQL
ALTER TABLE empleados 
ADD COLUMN telefono VARCHAR(15),           -- Agregar una columna
ADD COLUMN fecha_nacimiento DATE;          -- Agregar otra columna

-- PostgreSQL (sintaxis idéntica)
ALTER TABLE empleados 
ADD COLUMN telefono VARCHAR(15),
ADD COLUMN fecha_nacimiento DATE;
```

#### Modificando Columnas Existentes

```sql
-- MySQL
ALTER TABLE empleados 
MODIFY COLUMN salario DECIMAL(12,2);       -- Cambiar el tamaño del campo

-- PostgreSQL
ALTER TABLE empleados 
ALTER COLUMN salario TYPE NUMERIC(12,2);   -- En PostgreSQL usamos TYPE
```

#### Agregando Restricciones

```sql
-- MySQL
ALTER TABLE empleados 
ADD CONSTRAINT chk_salario_positivo CHECK (salario > 0),
ADD CONSTRAINT fk_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id);

-- PostgreSQL (sintaxis similar)
ALTER TABLE empleados 
ADD CONSTRAINT chk_salario_positivo CHECK (salario > 0),
ADD CONSTRAINT fk_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id);
```

### Índices: Los Atajos de tu Base de Datos

Los índices son como los atajos en una ciudad: te ayudan a llegar más rápido a tu destino.

#### Creando Índices

```sql
-- Índice simple para búsquedas rápidas por apellido
-- MySQL y PostgreSQL
CREATE INDEX idx_empleados_apellido ON empleados(apellido);

-- Índice compuesto para búsquedas por nombre y apellido
CREATE INDEX idx_empleados_nombre_completo ON empleados(nombre, apellido);

-- Índice único (alternativa a UNIQUE constraint)
CREATE UNIQUE INDEX idx_empleados_email ON empleados(email);
```

#### Cuándo Usar Índices

**SÍ crear índices cuando:**
- Haces búsquedas frecuentes por esa columna
- Usas ORDER BY frecuentemente
- Haces JOINs por esa columna

**NO crear índices cuando:**
- La tabla es muy pequeña (menos de 1000 registros)
- La columna cambia muy frecuentemente
- Tienes muchas operaciones INSERT/UPDATE

### Ejemplo Práctico: Sistema de E-commerce

Vamos a crear un sistema completo paso a paso:

```sql
-- 1. Tabla de categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,     -- MySQL
    nombre VARCHAR(50) NOT NULL UNIQUE,    -- Nombre único de categoría
    descripcion TEXT,                      -- Descripción opcional
    activa BOOLEAN DEFAULT TRUE,           -- Si está activa o no
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) CHECK (precio > 0), -- Precio positivo
    stock INT DEFAULT 0 CHECK (stock >= 0),  -- Stock no negativo
    categoria_id INT,
    sku VARCHAR(50) UNIQUE,                 -- Código único del producto
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- 3. Tabla de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 4. Crear índices para optimizar búsquedas
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_productos_sku ON productos(sku);
```

## Mejores Prácticas para el Diseño

### 1. Nomenclatura Consistente
- Usa nombres descriptivos: `fecha_nacimiento` en lugar de `fn`
- Mantén un estilo: snake_case o camelCase, pero sé consistente
- Los nombres de tablas en plural: `usuarios`, `productos`

### 2. Tipos de Datos Apropiados
- No uses VARCHAR(255) para todo
- DECIMAL para dinero, no FLOAT
- TIMESTAMP para fechas con hora, DATE para solo fechas

### 3. Restricciones Inteligentes
- Siempre define PRIMARY KEYs
- Usa FOREIGN KEYs para mantener integridad
- Agrega CHECKs para validaciones de negocio

## Próximo Paso

En el siguiente módulo vamos a aprender sobre DML (Data Manipulation Language) y cómo trabajar con los datos que ya tenemos estructurados. ¡Prepárate para convertirte en un maestro de la manipulación de datos!

---

**Recuerda:** Un buen diseño de base de datos es como una buena fundación: si está bien hecha, todo lo demás será más fácil. ¡Tómate tu tiempo en esta etapa!
