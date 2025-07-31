# DML: Manipulación de Datos - Donde la Magia Realmente Sucede

¡Bienvenidos al corazón de SQL! Si en los módulos anteriores éramos arquitectos y constructores, ahora nos convertimos en los habitantes de nuestra base de datos. Aquí es donde realmente trabajamos con los datos día a día.

## INSERT: Poblando Nuestra Base de Datos

Insertar datos es como mudar muebles a una casa nueva. Necesitas saber exactamente dónde va cada cosa y asegurarte de que todo encaje perfectamente.

### INSERT Básico: Un Registro a la Vez

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
INSERT INTO categorias (nombre, descripcion, activa)
VALUES ('Tecnología', 'Productos tecnológicos y electrónicos', TRUE);
-- Explicación línea por línea:
-- INSERT INTO: comando para insertar datos
-- categorias: tabla donde vamos a insertar
-- (nombre, descripcion, activa): columnas que vamos a llenar
-- VALUES: palabra clave que indica los valores
-- ('Tecnología', 'Productos tecnológicos...', TRUE): valores específicos
```

### INSERT Múltiple: Eficiencia al Máximo

```sql
-- Insertar varias categorías de una vez
INSERT INTO categorias (nombre, descripcion, activa)
VALUES 
    ('Libros', 'Literatura y material educativo', TRUE),        -- Primera categoría
    ('Ropa', 'Vestimenta y accesorios', TRUE),                 -- Segunda categoría
    ('Hogar', 'Artículos para el hogar y decoración', TRUE),   -- Tercera categoría
    ('Deportes', 'Equipamiento deportivo y fitness', FALSE);   -- Cuarta categoría (inactiva)
-- ¿Por qué múltiple? Es mucho más rápido que hacer 4 INSERT separados
```

### INSERT con Subconsulta: Copiando Datos Inteligentemente

```sql
-- Crear una tabla temporal con productos en oferta
INSERT INTO productos_oferta (producto_id, nombre, precio_original, precio_oferta)
SELECT 
    id,                                    -- ID del producto original
    nombre,                               -- Nombre del producto
    precio,                               -- Precio original
    precio * 0.8                         -- Precio con 20% de descuento
FROM productos 
WHERE stock > 10                          -- Solo productos con stock suficiente
  AND categoria_id IN (1, 2, 3);         -- Solo ciertas categorías
-- Esto copia automáticamente productos que cumplen condiciones específicas
```

### INSERT con Manejo de Conflictos

```sql
-- MySQL: INSERT ... ON DUPLICATE KEY UPDATE
INSERT INTO productos (sku, nombre, precio, stock)
VALUES ('TECH001', 'Laptop Gaming', 1500.00, 5)
ON DUPLICATE KEY UPDATE 
    precio = VALUES(precio),              -- Si el SKU ya existe, actualiza el precio
    stock = stock + VALUES(stock);        -- Y suma el stock nuevo al existente

-- PostgreSQL: INSERT ... ON CONFLICT
INSERT INTO productos (sku, nombre, precio, stock)
VALUES ('TECH001', 'Laptop Gaming', 1500.00, 5)
ON CONFLICT (sku) DO UPDATE SET           -- Si hay conflicto en SKU
    precio = EXCLUDED.precio,             -- Actualiza con el nuevo precio
    stock = productos.stock + EXCLUDED.stock; -- Suma al stock existente
```

## SELECT: El Arte de Buscar y Encontrar

SELECT es como ser un detective: necesitas saber exactamente qué buscas y dónde encontrarlo.

### SELECT Básico: Los Fundamentos

```sql
-- Consulta más simple: "Muéstrame todo"
SELECT * FROM productos;                  -- El asterisco (*) significa "todas las columnas"

-- Consulta específica: "Solo quiero ver ciertos campos"
SELECT nombre, precio, stock              -- Solo estas tres columnas
FROM productos;                           -- De la tabla productos
```

### WHERE: Filtrando como un Profesional

```sql
-- Filtros simples
SELECT nombre, precio 
FROM productos 
WHERE precio > 100;                       -- Solo productos caros

-- Filtros múltiples con AND
SELECT nombre, precio, stock
FROM productos 
WHERE precio BETWEEN 50 AND 200          -- Precio entre 50 y 200
  AND stock > 0                          -- Y que tengan stock
  AND activo = TRUE;                     -- Y que estén activos

-- Filtros con OR
SELECT nombre, categoria_id
FROM productos 
WHERE categoria_id = 1                    -- Categoría 1 (Tecnología)
   OR categoria_id = 3                    -- O categoría 3 (Hogar)
   OR precio < 25;                        -- O productos baratos
```

### LIKE: Búsquedas Flexibles

```sql
-- Buscar productos que contengan "laptop" en el nombre
SELECT nombre, precio
FROM productos 
WHERE nombre LIKE '%laptop%';             -- % significa "cualquier cosa antes y después"

-- Buscar productos que empiecen con "Smart"
SELECT nombre, precio
FROM productos 
WHERE nombre LIKE 'Smart%';               -- Solo % al final

-- Buscar SKUs con formato específico (ej: TECH001, TECH002)
SELECT sku, nombre
FROM productos 
WHERE sku LIKE 'TECH___';                 -- _ significa "exactamente un carácter"
```

### IN y NOT IN: Listas de Valores

```sql
-- Productos de categorías específicas
SELECT nombre, categoria_id
FROM productos 
WHERE categoria_id IN (1, 2, 4);          -- Equivale a categoria_id = 1 OR categoria_id = 2 OR categoria_id = 4

-- Productos que NO son de ciertas categorías
SELECT nombre, categoria_id
FROM productos 
WHERE categoria_id NOT IN (3, 5);         -- Excluye categorías 3 y 5
```

### ORDER BY: Organizando los Resultados

```sql
-- Ordenar por precio de menor a mayor
SELECT nombre, precio
FROM productos 
ORDER BY precio ASC;                      -- ASC = ascendente (opcional, es el default)

-- Ordenar por precio de mayor a menor
SELECT nombre, precio
FROM productos 
ORDER BY precio DESC;                     -- DESC = descendente

-- Ordenamiento múltiple
SELECT nombre, categoria_id, precio
FROM productos 
ORDER BY categoria_id ASC,                -- Primero por categoría (ascendente)
         precio DESC;                     -- Luego por precio (descendente)
```

### LIMIT y OFFSET: Paginación Inteligente

```sql
-- MySQL
SELECT nombre, precio
FROM productos 
ORDER BY precio DESC
LIMIT 10;                                 -- Solo los primeros 10 resultados

-- Paginación: segunda página de 10 productos
SELECT nombre, precio
FROM productos 
ORDER BY precio DESC
LIMIT 10 OFFSET 10;                       -- Salta los primeros 10, muestra los siguientes 10

-- PostgreSQL (sintaxis idéntica)
SELECT nombre, precio
FROM productos 
ORDER BY precio DESC
LIMIT 10 OFFSET 20;                       -- Tercera página (salta 20, muestra 10)
```

## UPDATE: Modificando con Precisión

UPDATE es como ser un editor: cambias solo lo que necesitas cambiar, sin tocar el resto.

### UPDATE Básico

```sql
-- Actualizar el precio de un producto específico
UPDATE productos 
SET precio = 899.99                       -- Nuevo precio
WHERE sku = 'TECH001';                    -- Solo para este producto específico
-- ¡CUIDADO! Sin WHERE actualizarías TODOS los productos
```

### UPDATE Múltiple

```sql
-- Actualizar varios campos a la vez
UPDATE productos 
SET precio = precio * 1.1,                -- Aumentar precio 10%
    stock = stock - 1,                    -- Reducir stock en 1
    updated_at = CURRENT_TIMESTAMP        -- Actualizar fecha de modificación
WHERE categoria_id = 1                    -- Solo productos de tecnología
  AND stock > 0;                         -- Y que tengan stock
```

### UPDATE con Subconsulta

```sql
-- Actualizar precios basándose en otra tabla
UPDATE productos 
SET precio = (
    SELECT precio_sugerido                -- Precio de la tabla de precios sugeridos
    FROM precios_sugeridos ps
    WHERE ps.producto_id = productos.id   -- Relacionar por ID
)
WHERE EXISTS (                            -- Solo si existe precio sugerido
    SELECT 1 
    FROM precios_sugeridos ps
    WHERE ps.producto_id = productos.id
);
```

### UPDATE con JOIN (MySQL)

```sql
-- MySQL permite UPDATE con JOIN
UPDATE productos p
JOIN categorias c ON p.categoria_id = c.id
SET p.precio = p.precio * 0.9             -- 10% de descuento
WHERE c.nombre = 'Ropa'                   -- Solo productos de ropa
  AND p.stock > 5;                        -- Con stock suficiente
```

### UPDATE con FROM (PostgreSQL)

```sql
-- PostgreSQL usa FROM para joins en UPDATE
UPDATE productos 
SET precio = precio * 0.9                 -- 10% de descuento
FROM categorias 
WHERE productos.categoria_id = categorias.id
  AND categorias.nombre = 'Ropa'          -- Solo productos de ropa
  AND productos.stock > 5;                -- Con stock suficiente
```

## DELETE: Eliminando con Cuidado

DELETE es como usar un borrador: una vez que borras algo, no hay vuelta atrás (a menos que tengas backups).

### DELETE Básico

```sql
-- Eliminar un producto específico
DELETE FROM productos 
WHERE sku = 'PROD999';                    -- Solo este producto

-- Eliminar productos sin stock
DELETE FROM productos 
WHERE stock = 0 
  AND activo = FALSE;                     -- Solo inactivos sin stock
```

### DELETE con Subconsulta

```sql
-- Eliminar productos de categorías inactivas
DELETE FROM productos 
WHERE categoria_id IN (                   -- Subconsulta para encontrar categorías inactivas
    SELECT id 
    FROM categorias 
    WHERE activa = FALSE
);
```

### DELETE con JOIN (MySQL)

```sql
-- MySQL permite DELETE con JOIN
DELETE p                                  -- Eliminar de productos (alias p)
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE c.activa = FALSE                    -- Categorías inactivas
  AND p.stock = 0;                        -- Sin stock
```

### DELETE con USING (PostgreSQL)

```sql
-- PostgreSQL usa USING para joins en DELETE
DELETE FROM productos 
USING categorias 
WHERE productos.categoria_id = categorias.id
  AND categorias.activa = FALSE           -- Categorías inactivas
  AND productos.stock = 0;                -- Sin stock
```

## Funciones de Agregación: Resumiendo Datos

Las funciones de agregación son como hacer un resumen ejecutivo de tus datos.

### COUNT: Contando Elementos

```sql
-- Contar todos los productos
SELECT COUNT(*) AS total_productos        -- COUNT(*) cuenta todas las filas
FROM productos;

-- Contar productos activos
SELECT COUNT(*) AS productos_activos
FROM productos 
WHERE activo = TRUE;

-- Contar valores no nulos
SELECT COUNT(descripcion) AS productos_con_descripcion  -- No cuenta NULLs
FROM productos;

-- Contar valores únicos
SELECT COUNT(DISTINCT categoria_id) AS categorias_con_productos
FROM productos;
```

### SUM: Sumando Valores

```sql
-- Valor total del inventario
SELECT SUM(precio * stock) AS valor_inventario
FROM productos 
WHERE activo = TRUE;

-- Suma por categoría
SELECT 
    categoria_id,
    SUM(stock) AS stock_total,            -- Stock total por categoría
    SUM(precio * stock) AS valor_categoria -- Valor total por categoría
FROM productos 
GROUP BY categoria_id;                    -- Agrupar por categoría
```

### AVG: Promediando

```sql
-- Precio promedio de todos los productos
SELECT AVG(precio) AS precio_promedio
FROM productos 
WHERE activo = TRUE;

-- Precio promedio por categoría
SELECT 
    c.nombre AS categoria,
    AVG(p.precio) AS precio_promedio,     -- Precio promedio
    COUNT(*) AS cantidad_productos        -- Cantidad de productos
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = TRUE
GROUP BY c.id, c.nombre                   -- Agrupar por categoría
ORDER BY precio_promedio DESC;            -- Ordenar por precio promedio
```

### MIN y MAX: Extremos

```sql
-- Producto más caro y más barato por categoría
SELECT 
    categoria_id,
    MIN(precio) AS precio_minimo,         -- Producto más barato
    MAX(precio) AS precio_maximo,         -- Producto más caro
    MAX(precio) - MIN(precio) AS rango_precios  -- Diferencia entre extremos
FROM productos 
WHERE activo = TRUE
GROUP BY categoria_id
HAVING COUNT(*) > 5;                      -- Solo categorías con más de 5 productos
```

## GROUP BY y HAVING: Agrupando y Filtrando Grupos

### GROUP BY: Creando Resúmenes

```sql
-- Ventas por mes
SELECT 
    YEAR(fecha_venta) AS año,             -- MySQL: extraer año
    MONTH(fecha_venta) AS mes,            -- MySQL: extraer mes
    COUNT(*) AS total_ventas,             -- Cantidad de ventas
    SUM(total) AS ingresos_totales        -- Suma de ingresos
FROM ventas 
GROUP BY YEAR(fecha_venta), MONTH(fecha_venta)  -- Agrupar por año y mes
ORDER BY año DESC, mes DESC;              -- Más recientes primero

-- PostgreSQL equivalente
SELECT 
    EXTRACT(YEAR FROM fecha_venta) AS año,    -- PostgreSQL: extraer año
    EXTRACT(MONTH FROM fecha_venta) AS mes,   -- PostgreSQL: extraer mes
    COUNT(*) AS total_ventas,
    SUM(total) AS ingresos_totales
FROM ventas 
GROUP BY EXTRACT(YEAR FROM fecha_venta), EXTRACT(MONTH FROM fecha_venta)
ORDER BY año DESC, mes DESC;
```

### HAVING: WHERE para Grupos

```sql
-- Categorías con más de 10 productos y precio promedio alto
SELECT 
    c.nombre AS categoria,
    COUNT(p.id) AS cantidad_productos,    -- Cantidad de productos
    AVG(p.precio) AS precio_promedio      -- Precio promedio
FROM categorias c
JOIN productos p ON c.id = p.categoria_id
WHERE p.activo = TRUE                     -- WHERE filtra filas individuales
GROUP BY c.id, c.nombre                   -- Agrupar por categoría
HAVING COUNT(p.id) > 10                   -- HAVING filtra grupos
   AND AVG(p.precio) > 100                -- Solo grupos con precio promedio alto
ORDER BY precio_promedio DESC;
```

## Ejemplo Práctico Completo: Sistema de Inventario

Vamos a simular un día completo de trabajo en un sistema de inventario:

```sql
-- 1. Insertar nuevos productos
INSERT INTO productos (sku, nombre, descripcion, precio, stock, categoria_id)
VALUES 
    ('TECH015', 'Smartphone Pro Max', 'Último modelo con cámara avanzada', 1299.99, 25, 1),
    ('BOOK045', 'Guía de SQL Avanzado', 'Manual completo de bases de datos', 45.99, 100, 2),
    ('CLOTH089', 'Camiseta Deportiva', 'Material transpirable y cómodo', 29.99, 50, 3);

-- 2. Actualizar precios con descuento del 15% para productos con mucho stock
UPDATE productos 
SET precio = precio * 0.85,               -- 15% de descuento
    updated_at = CURRENT_TIMESTAMP
WHERE stock > 20                          -- Mucho stock
  AND activo = TRUE;

-- 3. Consultar productos más vendidos (simulando tabla de ventas)
SELECT 
    p.nombre,
    p.precio,
    p.stock,
    COUNT(vd.producto_id) AS veces_vendido,  -- Cuántas veces se vendió
    SUM(vd.cantidad) AS unidades_vendidas    -- Total de unidades vendidas
FROM productos p
LEFT JOIN ventas_detalle vd ON p.id = vd.producto_id  -- LEFT JOIN para incluir productos sin ventas
GROUP BY p.id, p.nombre, p.precio, p.stock
ORDER BY unidades_vendidas DESC NULLS LAST  -- PostgreSQL: NULLs al final
-- ORDER BY unidades_vendidas DESC           -- MySQL: maneja NULLs automáticamente
LIMIT 10;

-- 4. Eliminar productos descontinuados sin stock
DELETE FROM productos 
WHERE stock = 0 
  AND activo = FALSE
  AND updated_at < DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH);  -- MySQL: más de 6 meses sin actualizar
-- AND updated_at < CURRENT_DATE - INTERVAL '6 months';      -- PostgreSQL equivalente
```

## Mejores Prácticas para DML

### 1. Siempre Usa WHERE en UPDATE y DELETE
```sql
-- ❌ PELIGROSO: Sin WHERE
UPDATE productos SET precio = 0;          -- ¡Esto cambiaría TODOS los productos!

-- ✅ CORRECTO: Con WHERE
UPDATE productos SET precio = 0 WHERE sku = 'PROD001';
```

### 2. Usa Transacciones para Operaciones Críticas
```sql
-- MySQL y PostgreSQL
BEGIN;                                    -- Iniciar transacción
UPDATE productos SET stock = stock - 1 WHERE id = 123;
INSERT INTO ventas_detalle (producto_id, cantidad) VALUES (123, 1);
COMMIT;                                   -- Confirmar cambios
-- Si algo sale mal: ROLLBACK;
```

### 3. Valida Antes de Eliminar
```sql
-- Primero consulta qué vas a eliminar
SELECT * FROM productos WHERE stock = 0 AND activo = FALSE;
-- Si estás seguro, entonces elimina
-- DELETE FROM productos WHERE stock = 0 AND activo = FALSE;
```

## Próximo Paso

En el siguiente módulo vamos a explorar las consultas avanzadas: JOINs, subconsultas y técnicas complejas que te convertirán en un ninja de SQL. ¡Prepárate para llevar tus habilidades al siguiente nivel!

---

**Recuerda:** La manipulación de datos es como manejar un auto deportivo: con gran poder viene gran responsabilidad. ¡Siempre ten cuidado y haz backups!
