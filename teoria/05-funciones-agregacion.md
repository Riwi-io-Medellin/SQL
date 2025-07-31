# Funciones de Agregación: Convirtiendo Datos en Información Valiosa

¡Bienvenidos al mundo de los resúmenes inteligentes! Las funciones de agregación son como tener un asistente personal que puede analizar miles de datos y darte exactamente la información que necesitas en segundos.

## ¿Qué Son las Funciones de Agregación?

Imagínate que tienes una montaña de facturas de todo un año y necesitas saber cuánto vendiste en total, cuál fue tu mejor mes, o cuántos clientes nuevos tuviste. Las funciones de agregación hacen exactamente eso: toman muchos datos y los resumen en información útil.

## Las Funciones Básicas: Tu Kit de Herramientas Esencial

### COUNT: El Contador Universal

COUNT es como tener un contador automático que nunca se equivoca.

```sql
-- Contar todos los registros
SELECT COUNT(*) AS total_productos        -- COUNT(*) cuenta TODAS las filas
FROM productos;

-- Contar solo registros activos
SELECT COUNT(*) AS productos_activos      -- Solo cuenta filas que cumplen la condición
FROM productos 
WHERE activo = TRUE;

-- Contar valores no nulos
SELECT COUNT(descripcion) AS productos_con_descripcion  -- No cuenta campos NULL
FROM productos;

-- Contar valores únicos
SELECT COUNT(DISTINCT categoria_id) AS categorias_diferentes  -- Solo valores únicos
FROM productos;
```

#### COUNT con Condiciones (MySQL y PostgreSQL)

```sql
-- MySQL: usando SUM con CASE
SELECT 
    COUNT(*) AS total_productos,
    SUM(CASE WHEN precio > 100 THEN 1 ELSE 0 END) AS productos_caros,  -- Contar con condición
    SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS productos_sin_stock
FROM productos;

-- PostgreSQL: usando COUNT con FILTER
SELECT 
    COUNT(*) AS total_productos,
    COUNT(*) FILTER (WHERE precio > 100) AS productos_caros,  -- Sintaxis más elegante
    COUNT(*) FILTER (WHERE stock = 0) AS productos_sin_stock
FROM productos;
```

### SUM: El Sumador Inteligente

SUM es como tener una calculadora que nunca se cansa de sumar.

```sql
-- Suma básica
SELECT SUM(precio * stock) AS valor_total_inventario  -- Multiplicar antes de sumar
FROM productos 
WHERE activo = TRUE;

-- Suma con condiciones
SELECT 
    SUM(CASE WHEN categoria_id = 1 THEN precio * stock ELSE 0 END) AS valor_tecnologia,
    SUM(CASE WHEN categoria_id = 2 THEN precio * stock ELSE 0 END) AS valor_libros,
    SUM(precio * stock) AS valor_total
FROM productos;
```

#### Ejemplo Práctico: Análisis de Ventas

```sql
-- Análisis completo de ventas por mes
-- MySQL
SELECT 
    YEAR(fecha_pedido) AS año,
    MONTH(fecha_pedido) AS mes,
    MONTHNAME(fecha_pedido) AS nombre_mes,    -- MySQL: nombre del mes
    SUM(total) AS ingresos_totales,
    SUM(CASE WHEN total > 1000 THEN total ELSE 0 END) AS ingresos_pedidos_grandes,
    SUM(total) - SUM(descuento) AS ingresos_netos
FROM pedidos 
WHERE fecha_pedido >= '2023-01-01'
GROUP BY YEAR(fecha_pedido), MONTH(fecha_pedido), MONTHNAME(fecha_pedido)
ORDER BY año, mes;

-- PostgreSQL
SELECT 
    EXTRACT(YEAR FROM fecha_pedido) AS año,
    EXTRACT(MONTH FROM fecha_pedido) AS mes,
    TO_CHAR(fecha_pedido, 'Month') AS nombre_mes,  -- PostgreSQL: nombre del mes
    SUM(total) AS ingresos_totales,
    SUM(total) FILTER (WHERE total > 1000) AS ingresos_pedidos_grandes,
    SUM(total) - SUM(descuento) AS ingresos_netos
FROM pedidos 
WHERE fecha_pedido >= '2023-01-01'
GROUP BY EXTRACT(YEAR FROM fecha_pedido), EXTRACT(MONTH FROM fecha_pedido), TO_CHAR(fecha_pedido, 'Month')
ORDER BY año, mes;
```

### AVG: El Calculador de Promedios

AVG es como tener un estadístico personal que calcula promedios perfectos.

```sql
-- Promedio básico
SELECT AVG(precio) AS precio_promedio      -- Promedio de todos los precios
FROM productos 
WHERE activo = TRUE;

-- Promedio por grupos
SELECT 
    c.nombre AS categoria,
    AVG(p.precio) AS precio_promedio,
    COUNT(p.id) AS cantidad_productos,
    MIN(p.precio) AS precio_minimo,
    MAX(p.precio) AS precio_maximo
FROM categorias c
JOIN productos p ON c.id = p.categoria_id
WHERE p.activo = TRUE
GROUP BY c.id, c.nombre
ORDER BY precio_promedio DESC;
```

#### Promedio Ponderado

```sql
-- Promedio ponderado por stock (productos con más stock influyen más)
SELECT 
    categoria_id,
    SUM(precio * stock) / SUM(stock) AS precio_promedio_ponderado,  -- Promedio ponderado
    AVG(precio) AS precio_promedio_simple                          -- Promedio simple para comparar
FROM productos 
WHERE activo = TRUE AND stock > 0
GROUP BY categoria_id;
```

### MIN y MAX: Los Buscadores de Extremos

MIN y MAX son como tener detectores que siempre encuentran los valores más altos y más bajos.

```sql
-- Extremos básicos
SELECT 
    MIN(precio) AS producto_mas_barato,
    MAX(precio) AS producto_mas_caro,
    MAX(precio) - MIN(precio) AS rango_precios,
    AVG(precio) AS precio_promedio
FROM productos 
WHERE activo = TRUE;

-- Encontrar los productos con precios extremos
SELECT 
    nombre,
    precio,
    CASE 
        WHEN precio = (SELECT MIN(precio) FROM productos WHERE activo = TRUE) 
        THEN 'MÁS BARATO'
        WHEN precio = (SELECT MAX(precio) FROM productos WHERE activo = TRUE) 
        THEN 'MÁS CARO'
        ELSE 'NORMAL'
    END AS tipo_precio
FROM productos 
WHERE activo = TRUE
  AND (precio = (SELECT MIN(precio) FROM productos WHERE activo = TRUE)
       OR precio = (SELECT MAX(precio) FROM productos WHERE activo = TRUE));
```

## GROUP BY: Organizando el Caos

GROUP BY es como tener un organizador profesional que agrupa cosas similares.

### GROUP BY Básico

```sql
-- Resumen por categoría
SELECT 
    categoria_id,
    COUNT(*) AS cantidad_productos,         -- Cuántos productos por categoría
    AVG(precio) AS precio_promedio,         -- Precio promedio por categoría
    SUM(stock) AS stock_total,              -- Stock total por categoría
    MIN(precio) AS precio_minimo,           -- Producto más barato por categoría
    MAX(precio) AS precio_maximo            -- Producto más caro por categoría
FROM productos 
WHERE activo = TRUE
GROUP BY categoria_id                       -- Agrupar por categoría
ORDER BY cantidad_productos DESC;           -- Categorías con más productos primero
```

### GROUP BY con Múltiples Columnas

```sql
-- Análisis por categoría y rango de precios
SELECT 
    categoria_id,
    CASE 
        WHEN precio < 50 THEN 'Económico'
        WHEN precio < 200 THEN 'Medio'
        ELSE 'Premium'
    END AS rango_precio,
    COUNT(*) AS cantidad_productos,
    AVG(precio) AS precio_promedio,
    SUM(stock) AS stock_total
FROM productos 
WHERE activo = TRUE
GROUP BY categoria_id, 
         CASE 
             WHEN precio < 50 THEN 'Económico'
             WHEN precio < 200 THEN 'Medio'
             ELSE 'Premium'
         END                                -- Agrupar por categoría Y rango de precio
ORDER BY categoria_id, precio_promedio;
```

### GROUP BY con Fechas

```sql
-- Ventas por día de la semana
-- MySQL
SELECT 
    DAYNAME(fecha_pedido) AS dia_semana,    -- MySQL: nombre del día
    DAYOFWEEK(fecha_pedido) AS numero_dia,  -- MySQL: número del día (1=Domingo)
    COUNT(*) AS cantidad_pedidos,
    SUM(total) AS ingresos_totales,
    AVG(total) AS ticket_promedio
FROM pedidos 
WHERE fecha_pedido >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)  -- Últimos 30 días
GROUP BY DAYNAME(fecha_pedido), DAYOFWEEK(fecha_pedido)
ORDER BY numero_dia;

-- PostgreSQL
SELECT 
    TO_CHAR(fecha_pedido, 'Day') AS dia_semana,     -- PostgreSQL: nombre del día
    EXTRACT(DOW FROM fecha_pedido) AS numero_dia,   -- PostgreSQL: día de semana (0=Domingo)
    COUNT(*) AS cantidad_pedidos,
    SUM(total) AS ingresos_totales,
    AVG(total) AS ticket_promedio
FROM pedidos 
WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '30 days'  -- Últimos 30 días
GROUP BY TO_CHAR(fecha_pedido, 'Day'), EXTRACT(DOW FROM fecha_pedido)
ORDER BY numero_dia;
```

## HAVING: El Filtro de Grupos

HAVING es como tener un filtro especial que solo funciona después de agrupar los datos.

### HAVING vs WHERE: La Diferencia Crucial

```sql
-- WHERE filtra ANTES de agrupar, HAVING filtra DESPUÉS de agrupar
SELECT 
    categoria_id,
    COUNT(*) AS cantidad_productos,
    AVG(precio) AS precio_promedio
FROM productos 
WHERE activo = TRUE                       -- WHERE: filtra productos individuales
GROUP BY categoria_id
HAVING COUNT(*) > 5                       -- HAVING: filtra grupos (categorías)
   AND AVG(precio) > 100                  -- Solo categorías con más de 5 productos Y precio promedio alto
ORDER BY precio_promedio DESC;
```

### Ejemplos Prácticos con HAVING

```sql
-- Clientes VIP (más de 5 pedidos y gasto total > $1000)
SELECT 
    c.nombre,
    c.email,
    COUNT(p.id) AS total_pedidos,
    SUM(p.total) AS total_gastado,
    AVG(p.total) AS ticket_promedio
FROM clientes c
JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id, c.nombre, c.email
HAVING COUNT(p.id) > 5                    -- Más de 5 pedidos
   AND SUM(p.total) > 1000                -- Gasto total mayor a $1000
ORDER BY total_gastado DESC;

-- Productos con ventas inconsistentes (alta desviación estándar)
-- MySQL
SELECT 
    p.nombre,
    COUNT(vd.id) AS veces_vendido,
    AVG(vd.cantidad) AS cantidad_promedio,
    STDDEV(vd.cantidad) AS desviacion_estandar,  -- MySQL: desviación estándar
    STDDEV(vd.cantidad) / AVG(vd.cantidad) AS coeficiente_variacion
FROM productos p
JOIN ventas_detalle vd ON p.id = vd.producto_id
GROUP BY p.id, p.nombre
HAVING COUNT(vd.id) > 10                  -- Al menos 10 ventas
   AND STDDEV(vd.cantidad) / AVG(vd.cantidad) > 0.5  -- Alta variabilidad
ORDER BY coeficiente_variacion DESC;

-- PostgreSQL
SELECT 
    p.nombre,
    COUNT(vd.id) AS veces_vendido,
    AVG(vd.cantidad) AS cantidad_promedio,
    STDDEV(vd.cantidad) AS desviacion_estandar,  -- PostgreSQL: desviación estándar
    STDDEV(vd.cantidad) / AVG(vd.cantidad) AS coeficiente_variacion
FROM productos p
JOIN ventas_detalle vd ON p.id = vd.producto_id
GROUP BY p.id, p.nombre
HAVING COUNT(vd.id) > 10
   AND STDDEV(vd.cantidad) / AVG(vd.cantidad) > 0.5
ORDER BY coeficiente_variacion DESC;
```

## Funciones de Agregación Avanzadas

### Funciones de Ventana (Window Functions)

Las funciones de ventana son como tener una vista panorámica de tus datos.

```sql
-- Ranking de productos por ventas
SELECT 
    p.nombre,
    c.nombre AS categoria,
    COALESCE(SUM(vd.cantidad), 0) AS unidades_vendidas,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(vd.cantidad), 0) DESC) AS ranking_general,
    ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY COALESCE(SUM(vd.cantidad), 0) DESC) AS ranking_categoria,
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(vd.cantidad), 0) DESC) AS ranking_denso,
    PERCENT_RANK() OVER (ORDER BY COALESCE(SUM(vd.cantidad), 0) DESC) AS percentil
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN ventas_detalle vd ON p.id = vd.producto_id
GROUP BY p.id, p.nombre, c.id, c.nombre
ORDER BY unidades_vendidas DESC;
```

### Funciones de Agregación con Ventana

```sql
-- Análisis de tendencias de ventas
SELECT 
    fecha_pedido,
    total,
    SUM(total) OVER (ORDER BY fecha_pedido) AS total_acumulado,           -- Suma acumulativa
    AVG(total) OVER (ORDER BY fecha_pedido ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS promedio_movil_7dias,  -- Promedio móvil
    LAG(total, 1) OVER (ORDER BY fecha_pedido) AS venta_dia_anterior,     -- Valor del día anterior
    total - LAG(total, 1) OVER (ORDER BY fecha_pedido) AS diferencia_dia_anterior
FROM (
    SELECT 
        DATE(fecha_pedido) AS fecha_pedido,   -- Agrupar por día
        SUM(total) AS total
    FROM pedidos 
    GROUP BY DATE(fecha_pedido)
) ventas_diarias
ORDER BY fecha_pedido;
```

## Casos de Uso Avanzados

### Análisis ABC de Productos

```sql
-- Clasificación ABC de productos (80-15-5 rule)
WITH ventas_productos AS (
    SELECT 
        p.id,
        p.nombre,
        COALESCE(SUM(vd.cantidad * vd.precio_unitario), 0) AS ingresos_producto
    FROM productos p
    LEFT JOIN ventas_detalle vd ON p.id = vd.producto_id
    GROUP BY p.id, p.nombre
),
productos_con_porcentaje AS (
    SELECT 
        *,
        ingresos_producto / SUM(ingresos_producto) OVER () * 100 AS porcentaje_ingresos,
        SUM(ingresos_producto) OVER (ORDER BY ingresos_producto DESC) / 
        SUM(ingresos_producto) OVER () * 100 AS porcentaje_acumulado
    FROM ventas_productos
)
SELECT 
    nombre,
    ingresos_producto,
    ROUND(porcentaje_ingresos, 2) AS porcentaje_ingresos,
    ROUND(porcentaje_acumulado, 2) AS porcentaje_acumulado,
    CASE 
        WHEN porcentaje_acumulado <= 80 THEN 'A'    -- 80% de los ingresos
        WHEN porcentaje_acumulado <= 95 THEN 'B'    -- Siguiente 15%
        ELSE 'C'                                    -- Último 5%
    END AS clasificacion_abc
FROM productos_con_porcentaje
ORDER BY ingresos_producto DESC;
```

### Análisis de Cohortes de Retención

```sql
-- Análisis de retención de clientes por mes
WITH primera_compra AS (
    SELECT 
        cliente_id,
        DATE_FORMAT(MIN(fecha_pedido), '%Y-%m') AS mes_primera_compra  -- MySQL
        -- TO_CHAR(MIN(fecha_pedido), 'YYYY-MM') AS mes_primera_compra -- PostgreSQL
    FROM pedidos
    GROUP BY cliente_id
),
actividad_mensual AS (
    SELECT 
        pc.mes_primera_compra,
        DATE_FORMAT(p.fecha_pedido, '%Y-%m') AS mes_actividad,  -- MySQL
        -- TO_CHAR(p.fecha_pedido, 'YYYY-MM') AS mes_actividad, -- PostgreSQL
        COUNT(DISTINCT p.cliente_id) AS clientes_activos
    FROM primera_compra pc
    JOIN pedidos p ON pc.cliente_id = p.cliente_id
    GROUP BY pc.mes_primera_compra, DATE_FORMAT(p.fecha_pedido, '%Y-%m')
    -- GROUP BY pc.mes_primera_compra, TO_CHAR(p.fecha_pedido, 'YYYY-MM')  -- PostgreSQL
),
tamaño_cohorte AS (
    SELECT 
        mes_primera_compra,
        COUNT(DISTINCT cliente_id) AS tamaño_cohorte
    FROM primera_compra
    GROUP BY mes_primera_compra
)
SELECT 
    am.mes_primera_compra,
    am.mes_actividad,
    am.clientes_activos,
    tc.tamaño_cohorte,
    ROUND(am.clientes_activos * 100.0 / tc.tamaño_cohorte, 2) AS porcentaje_retencion
FROM actividad_mensual am
JOIN tamaño_cohorte tc ON am.mes_primera_compra = tc.mes_primera_compra
ORDER BY am.mes_primera_compra, am.mes_actividad;
```

### Análisis de Pareto (80/20)

```sql
-- Identificar el 20% de productos que generan el 80% de ingresos
WITH ingresos_productos AS (
    SELECT 
        p.nombre,
        SUM(vd.cantidad * vd.precio_unitario) AS ingresos,
        COUNT(vd.id) AS transacciones
    FROM productos p
    JOIN ventas_detalle vd ON p.id = vd.producto_id
    GROUP BY p.id, p.nombre
),
productos_ordenados AS (
    SELECT 
        *,
        SUM(ingresos) OVER (ORDER BY ingresos DESC) AS ingresos_acumulados,
        SUM(ingresos) OVER () AS ingresos_totales,
        ROW_NUMBER() OVER (ORDER BY ingresos DESC) AS posicion,
        COUNT(*) OVER () AS total_productos
    FROM ingresos_productos
)
SELECT 
    nombre,
    ingresos,
    transacciones,
    ROUND(ingresos_acumulados / ingresos_totales * 100, 2) AS porcentaje_acumulado_ingresos,
    ROUND(posicion / total_productos * 100, 2) AS porcentaje_productos,
    CASE 
        WHEN ingresos_acumulados / ingresos_totales <= 0.8 THEN 'TOP 80%'
        ELSE 'RESTO'
    END AS categoria_pareto
FROM productos_ordenados
ORDER BY ingresos DESC;
```

## Optimización de Consultas con Agregaciones

### 1. Índices para GROUP BY

```sql
-- Crear índices compuestos para optimizar GROUP BY
CREATE INDEX idx_pedidos_fecha_cliente ON pedidos(fecha_pedido, cliente_id);
CREATE INDEX idx_productos_categoria_activo ON productos(categoria_id, activo);
CREATE INDEX idx_ventas_detalle_producto_fecha ON ventas_detalle(producto_id, fecha_venta);
```

### 2. Usar LIMIT con ORDER BY en Agregaciones

```sql
-- Top 10 clientes por ingresos (más eficiente que calcular todos)
SELECT 
    c.nombre,
    SUM(p.total) AS total_gastado
FROM clientes c
JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id, c.nombre
ORDER BY total_gastado DESC
LIMIT 10;                               -- Solo calcular los top 10
```

### 3. Evitar Funciones en GROUP BY

```sql
-- ❌ LENTO: Función en GROUP BY
SELECT 
    YEAR(fecha_pedido),
    SUM(total)
FROM pedidos 
GROUP BY YEAR(fecha_pedido);

-- ✅ RÁPIDO: Columna calculada o índice funcional
-- Opción 1: Agregar columna calculada
ALTER TABLE pedidos ADD COLUMN año_pedido INT;
UPDATE pedidos SET año_pedido = YEAR(fecha_pedido);
CREATE INDEX idx_pedidos_año ON pedidos(año_pedido);

-- Opción 2: Índice funcional (MySQL 8.0+, PostgreSQL)
CREATE INDEX idx_pedidos_año_func ON pedidos((YEAR(fecha_pedido)));  -- MySQL
-- CREATE INDEX idx_pedidos_año_func ON pedidos(EXTRACT(YEAR FROM fecha_pedido));  -- PostgreSQL
```

## Próximo Paso

En el siguiente módulo vamos a explorar la optimización e índices, donde aprenderás a hacer que tus consultas vuelen como un cohete. ¡Prepárate para convertirte en un experto en rendimiento!

---

**Recuerda:** Las funciones de agregación son como tener un equipo de analistas trabajando 24/7. Úsalas sabiamente y siempre piensa en el rendimiento cuando manejes grandes volúmenes de datos.
