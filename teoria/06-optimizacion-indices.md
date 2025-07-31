# Optimización e Índices: Haciendo que SQL Vuele como un Cohete

¡Bienvenidos al mundo de la velocidad! Si hasta ahora hemos aprendido a hacer consultas, ahora vamos a aprender a hacerlas súper rápidas. Es la diferencia entre caminar y volar en jet.

## ¿Qué Son los Índices?

Los índices son como el índice de un libro gigante. Imagínate que tienes una enciclopedia de 10,000 páginas y necesitas encontrar información sobre "SQL". Sin índice, tendrías que leer página por página hasta encontrarlo. Con un índice, vas directamente a la página correcta.

### Analogía del Mundo Real

Piensa en los índices como:
- **Biblioteca**: El catálogo te dice exactamente en qué estante está cada libro
- **Diccionario**: Las palabras están ordenadas alfabéticamente para búsqueda rápida
- **GPS**: Te dice la ruta más rápida sin tener que explorar todas las calles

## Tipos de Índices

### 1. Índice Primario (PRIMARY KEY)

```sql
-- Se crea automáticamente con PRIMARY KEY
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- MySQL: índice automático
    -- id SERIAL PRIMARY KEY,             -- PostgreSQL: índice automático
    email VARCHAR(100) UNIQUE,            -- También crea índice automático
    nombre VARCHAR(100)
);
-- El índice primario es único y no puede tener NULLs
```

### 2. Índice Único (UNIQUE)

```sql
-- Crear índice único para evitar duplicados
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios(email);

-- O al crear la tabla
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50),
    nombre VARCHAR(200),
    UNIQUE INDEX idx_productos_sku (sku)  -- Índice único en SKU
);
```

### 3. Índice Simple

```sql
-- Índice para búsquedas frecuentes por apellido
CREATE INDEX idx_usuarios_apellido ON usuarios(apellido);

-- Índice para filtros por fecha
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);

-- Índice para búsquedas por estado
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
```

### 4. Índice Compuesto (Múltiples Columnas)

```sql
-- Índice compuesto para búsquedas por nombre Y apellido
CREATE INDEX idx_usuarios_nombre_apellido ON usuarios(nombre, apellido);

-- Índice compuesto para filtros complejos
CREATE INDEX idx_productos_categoria_precio ON productos(categoria_id, precio);

-- Índice para análisis de ventas
CREATE INDEX idx_pedidos_fecha_cliente_estado ON pedidos(fecha_pedido, cliente_id, estado);
```

## Cuándo Crear Índices

### ✅ SÍ Crear Índices Cuando:

1. **Búsquedas frecuentes por esa columna**
```sql
-- Si frecuentemente buscas por email
SELECT * FROM usuarios WHERE email = 'juan@email.com';
-- Crear: CREATE INDEX idx_usuarios_email ON usuarios(email);
```

2. **JOINs frecuentes**
```sql
-- Si frecuentemente haces este JOIN
SELECT p.nombre, c.nombre 
FROM productos p 
JOIN categorias c ON p.categoria_id = c.id;
-- Crear: CREATE INDEX idx_productos_categoria ON productos(categoria_id);
```

3. **ORDER BY frecuente**
```sql
-- Si frecuentemente ordenas por fecha
SELECT * FROM pedidos ORDER BY fecha_pedido DESC;
-- Crear: CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);
```

4. **WHERE con rangos**
```sql
-- Si frecuentemente filtras por rangos de precio
SELECT * FROM productos WHERE precio BETWEEN 100 AND 500;
-- Crear: CREATE INDEX idx_productos_precio ON productos(precio);
```

### ❌ NO Crear Índices Cuando:

1. **Tablas muy pequeñas** (menos de 1000 registros)
2. **Columnas que cambian frecuentemente**
3. **Muchas operaciones INSERT/UPDATE/DELETE**
4. **Columnas con pocos valores únicos** (ej: género, estado activo/inactivo)

## Análisis de Rendimiento

### EXPLAIN: Tu Detective de Rendimiento

```sql
-- MySQL: Analizar plan de ejecución
EXPLAIN SELECT * FROM productos WHERE precio > 100;

-- PostgreSQL: Análisis más detallado
EXPLAIN ANALYZE SELECT * FROM productos WHERE precio > 100;
```

#### Interpretando EXPLAIN

```sql
-- Ejemplo de consulta lenta
EXPLAIN SELECT p.nombre, c.nombre 
FROM productos p 
JOIN categorias c ON p.categoria_id = c.id 
WHERE p.precio > 100;

-- Resultados típicos:
-- type: ALL (malo - escaneo completo)
-- type: index (mejor - usa índice)
-- type: ref (bueno - búsqueda por referencia)
-- type: eq_ref (excelente - búsqueda única)
```

### Optimizando Consultas Paso a Paso

#### Ejemplo 1: Optimización de Búsqueda

```sql
-- ❌ CONSULTA LENTA (sin índices)
SELECT * FROM productos 
WHERE categoria_id = 5 
  AND precio BETWEEN 100 AND 500 
  AND activo = TRUE;

-- Análisis: EXPLAIN muestra "type: ALL" (escaneo completo)

-- ✅ SOLUCIÓN: Crear índice compuesto
CREATE INDEX idx_productos_optimizado ON productos(categoria_id, activo, precio);

-- ¿Por qué este orden?
-- 1. categoria_id: mayor selectividad (filtra más registros)
-- 2. activo: filtro adicional
-- 3. precio: para el rango BETWEEN
```

#### Ejemplo 2: Optimización de JOIN

```sql
-- ❌ CONSULTA LENTA
SELECT 
    u.nombre,
    COUNT(p.id) AS total_pedidos,
    SUM(p.total) AS total_gastado
FROM usuarios u
LEFT JOIN pedidos p ON u.id = p.usuario_id
WHERE u.activo = TRUE
  AND p.fecha_pedido >= '2023-01-01'
GROUP BY u.id, u.nombre;

-- ✅ ÍNDICES NECESARIOS
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_pedidos_usuario_fecha ON pedidos(usuario_id, fecha_pedido);

-- ✅ CONSULTA OPTIMIZADA
SELECT 
    u.nombre,
    COUNT(p.id) AS total_pedidos,
    SUM(p.total) AS total_gastado
FROM usuarios u
LEFT JOIN pedidos p ON u.id = p.usuario_id 
    AND p.fecha_pedido >= '2023-01-01'  -- Mover condición al JOIN
WHERE u.activo = TRUE
GROUP BY u.id, u.nombre;
```

## Índices Avanzados

### Índices Funcionales

```sql
-- MySQL 8.0+: Índice en expresión
CREATE INDEX idx_usuarios_email_lower ON usuarios((LOWER(email)));

-- Ahora esta consulta será rápida:
SELECT * FROM usuarios WHERE LOWER(email) = 'juan@email.com';

-- PostgreSQL: Índices funcionales nativos
CREATE INDEX idx_usuarios_email_lower ON usuarios(LOWER(email));
CREATE INDEX idx_pedidos_año ON pedidos(EXTRACT(YEAR FROM fecha_pedido));
```

### Índices Parciales (PostgreSQL)

```sql
-- PostgreSQL: Índice solo para registros activos
CREATE INDEX idx_productos_activos_precio ON productos(precio) 
WHERE activo = TRUE;

-- Esto es más eficiente que indexar todos los productos
-- si solo consultas productos activos
```

### Índices de Texto Completo

```sql
-- MySQL: Búsqueda de texto completo
CREATE FULLTEXT INDEX idx_productos_busqueda ON productos(nombre, descripcion);

-- Búsqueda rápida en texto
SELECT * FROM productos 
WHERE MATCH(nombre, descripcion) AGAINST('laptop gaming' IN NATURAL LANGUAGE MODE);

-- PostgreSQL: Usar extensiones como pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_productos_nombre_trgm ON productos USING gin(nombre gin_trgm_ops);

-- Búsqueda difusa
SELECT * FROM productos WHERE nombre % 'laptop';  -- Búsqueda por similitud
```

## Vistas: Consultas Reutilizables

Las vistas son como tener consultas guardadas que puedes usar como si fueran tablas.

### Vistas Simples

```sql
-- Crear vista de productos activos con información completa
CREATE VIEW vista_productos_activos AS
SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.stock,
    c.nombre AS categoria,
    p.fecha_creacion
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = TRUE;

-- Usar la vista como una tabla normal
SELECT * FROM vista_productos_activos 
WHERE precio > 100 
ORDER BY precio DESC;
```

### Vistas Complejas con Agregaciones

```sql
-- Vista de resumen de ventas por producto
CREATE VIEW vista_resumen_productos AS
SELECT 
    p.id,
    p.nombre,
    p.precio,
    c.nombre AS categoria,
    COALESCE(COUNT(vd.id), 0) AS veces_vendido,
    COALESCE(SUM(vd.cantidad), 0) AS unidades_vendidas,
    COALESCE(SUM(vd.cantidad * vd.precio_unitario), 0) AS ingresos_generados,
    CASE 
        WHEN COALESCE(SUM(vd.cantidad), 0) = 0 THEN 'Sin ventas'
        WHEN COALESCE(SUM(vd.cantidad), 0) < 10 THEN 'Pocas ventas'
        WHEN COALESCE(SUM(vd.cantidad), 0) < 50 THEN 'Ventas moderadas'
        ELSE 'Altas ventas'
    END AS categoria_ventas
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN ventas_detalle vd ON p.id = vd.producto_id
WHERE p.activo = TRUE
GROUP BY p.id, p.nombre, p.precio, c.nombre;

-- Usar la vista para análisis rápidos
SELECT categoria, COUNT(*) AS productos, AVG(ingresos_generados) AS ingreso_promedio
FROM vista_resumen_productos 
GROUP BY categoria
ORDER BY ingreso_promedio DESC;
```

### Vistas Materializadas (PostgreSQL)

```sql
-- PostgreSQL: Vista materializada (datos precalculados)
CREATE MATERIALIZED VIEW mv_resumen_ventas_mensual AS
SELECT 
    EXTRACT(YEAR FROM fecha_pedido) AS año,
    EXTRACT(MONTH FROM fecha_pedido) AS mes,
    COUNT(*) AS total_pedidos,
    SUM(total) AS ingresos_totales,
    AVG(total) AS ticket_promedio,
    COUNT(DISTINCT cliente_id) AS clientes_unicos
FROM pedidos 
GROUP BY EXTRACT(YEAR FROM fecha_pedido), EXTRACT(MONTH FROM fecha_pedido);

-- Crear índice en la vista materializada
CREATE INDEX idx_mv_resumen_año_mes ON mv_resumen_ventas_mensual(año, mes);

-- Refrescar datos (debe hacerse manualmente)
REFRESH MATERIALIZED VIEW mv_resumen_ventas_mensual;

-- Consulta súper rápida
SELECT * FROM mv_resumen_ventas_mensual 
WHERE año = 2023 
ORDER BY mes;
```

## Estrategias de Optimización Avanzadas

### 1. Particionamiento de Tablas

```sql
-- MySQL: Particionamiento por rango de fechas
CREATE TABLE pedidos_particionada (
    id INT AUTO_INCREMENT,
    cliente_id INT,
    fecha_pedido DATE,
    total DECIMAL(10,2),
    PRIMARY KEY (id, fecha_pedido)  -- Clave primaria debe incluir columna de partición
)
PARTITION BY RANGE (YEAR(fecha_pedido)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- PostgreSQL: Particionamiento declarativo
CREATE TABLE pedidos_particionada (
    id SERIAL,
    cliente_id INT,
    fecha_pedido DATE,
    total NUMERIC(10,2)
) PARTITION BY RANGE (fecha_pedido);

-- Crear particiones
CREATE TABLE pedidos_2023 PARTITION OF pedidos_particionada
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE pedidos_2024 PARTITION OF pedidos_particionada
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 2. Desnormalización Controlada

```sql
-- Agregar columnas calculadas para evitar JOINs frecuentes
ALTER TABLE pedidos 
ADD COLUMN cliente_nombre VARCHAR(100),
ADD COLUMN cliente_email VARCHAR(100);

-- Trigger para mantener sincronización (MySQL)
DELIMITER //
CREATE TRIGGER tr_pedidos_cliente_info
    BEFORE INSERT ON pedidos
    FOR EACH ROW
BEGIN
    SELECT nombre, email INTO NEW.cliente_nombre, NEW.cliente_email
    FROM clientes 
    WHERE id = NEW.cliente_id;
END//
DELIMITER ;

-- PostgreSQL: Función y trigger
CREATE OR REPLACE FUNCTION actualizar_info_cliente()
RETURNS TRIGGER AS $$
BEGIN
    SELECT nombre, email INTO NEW.cliente_nombre, NEW.cliente_email
    FROM clientes 
    WHERE id = NEW.cliente_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_pedidos_cliente_info
    BEFORE INSERT OR UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_info_cliente();
```

### 3. Caché de Consultas

```sql
-- MySQL: Configurar query cache (versiones anteriores)
-- SET GLOBAL query_cache_size = 268435456;  -- 256MB
-- SET GLOBAL query_cache_type = ON;

-- Alternativa moderna: Usar Redis o Memcached en aplicación

-- PostgreSQL: Configurar shared_buffers
-- shared_buffers = 256MB (en postgresql.conf)
```

## Monitoreo y Mantenimiento

### Análisis de Uso de Índices

```sql
-- MySQL: Ver uso de índices
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    NULLABLE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'tu_base_datos'
ORDER BY TABLE_NAME, INDEX_NAME;

-- PostgreSQL: Estadísticas de índices
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

### Identificar Consultas Lentas

```sql
-- MySQL: Habilitar slow query log
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 2;  -- Consultas > 2 segundos

-- PostgreSQL: Configurar logging
-- log_min_duration_statement = 2000  -- en postgresql.conf
```

### Mantenimiento de Índices

```sql
-- MySQL: Optimizar tablas
OPTIMIZE TABLE productos;
ANALYZE TABLE productos;

-- PostgreSQL: Reindexar y analizar
REINDEX INDEX idx_productos_categoria;
ANALYZE productos;

-- Estadísticas automáticas
-- MySQL: Automático
-- PostgreSQL: 
-- autovacuum = on (en postgresql.conf)
```

## Mejores Prácticas de Optimización

### 1. Orden de Columnas en Índices Compuestos

```sql
-- ✅ CORRECTO: Más selectivo primero
CREATE INDEX idx_productos_categoria_activo_precio ON productos(categoria_id, activo, precio);
-- categoria_id: 10 categorías (alta selectividad)
-- activo: 2 valores (baja selectividad)
-- precio: rango continuo (para BETWEEN)

-- ❌ INCORRECTO: Menos selectivo primero
CREATE INDEX idx_productos_malo ON productos(activo, categoria_id, precio);
-- activo tiene solo 2 valores, no filtra mucho
```

### 2. Evitar Funciones en WHERE

```sql
-- ❌ LENTO: Función en WHERE
SELECT * FROM pedidos WHERE YEAR(fecha_pedido) = 2023;

-- ✅ RÁPIDO: Rango de fechas
SELECT * FROM pedidos 
WHERE fecha_pedido >= '2023-01-01' 
  AND fecha_pedido < '2024-01-01';
```

### 3. Usar LIMIT en Consultas Exploratorias

```sql
-- ❌ LENTO: Sin límite
SELECT * FROM productos ORDER BY precio DESC;

-- ✅ RÁPIDO: Con límite
SELECT * FROM productos ORDER BY precio DESC LIMIT 20;
```

### 4. Optimizar Subconsultas

```sql
-- ❌ LENTO: Subconsulta correlacionada
SELECT p.nombre
FROM productos p
WHERE EXISTS (
    SELECT 1 FROM ventas_detalle vd 
    WHERE vd.producto_id = p.id
);

-- ✅ RÁPIDO: JOIN con DISTINCT
SELECT DISTINCT p.nombre
FROM productos p
JOIN ventas_detalle vd ON p.id = vd.producto_id;
```

## Herramientas de Monitoreo

### 1. Consultas de Diagnóstico

```sql
-- MySQL: Procesos activos
SHOW PROCESSLIST;

-- PostgreSQL: Actividad actual
SELECT pid, usename, application_name, state, query 
FROM pg_stat_activity 
WHERE state = 'active';
```

### 2. Espacio de Almacenamiento

```sql
-- MySQL: Tamaño de tablas
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Tamaño MB'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'tu_base_datos'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;

-- PostgreSQL: Tamaño de tablas
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS tamaño
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

## Próximo Paso

En el último módulo vamos a cubrir transacciones, control de acceso y buenas prácticas que te convertirán en un DBA profesional. ¡Prepárate para el gran final!

---

**Recuerda:** La optimización es un arte y una ciencia. Siempre mide antes de optimizar, y recuerda que un índice mal diseñado puede ser peor que no tener índice. ¡La práctica y el monitoreo constante son clave!
