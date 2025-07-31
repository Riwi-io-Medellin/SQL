# Consultas Avanzadas: JOINs y Subconsultas - El Arte de Conectar Datos

¡Bienvenidos al nivel avanzado! Aquí es donde realmente empezamos a ver la magia de SQL. Si hasta ahora trabajábamos con una tabla a la vez, ahora vamos a aprender a conectar múltiples tablas y crear consultas que parecen imposibles.

## JOINs: Conectando el Mundo de los Datos

Los JOINs son como construir puentes entre islas de datos. Cada tabla es una isla, y los JOINs nos permiten viajar entre ellas para obtener una vista completa del panorama.

### INNER JOIN: La Intersección Perfecta

El INNER JOIN es como hacer una lista de empleados que tienen tanto un departamento asignado como un proyecto activo. Solo aparecen en el resultado aquellos registros que tienen correspondencia en ambas tablas - es la intersección perfecta donde ambos lados deben coincidir.

![INNER JOIN](../images/img_inner_join.png)

*Crédito de imagen: [W3Schools SQL JOIN](http://w3schools.com/sql/sql_join.asp)*

```sql
-- Ejemplo básico: Productos con sus categorías
-- MySQL y PostgreSQL (sintaxis idéntica)
SELECT 
    p.nombre AS producto,                 -- Nombre del producto
    p.precio,                            -- Precio del producto
    c.nombre AS categoria                -- Nombre de la categoría
FROM productos p                         -- Tabla principal (izquierda)
INNER JOIN categorias c                  -- Tabla a unir (derecha)
    ON p.categoria_id = c.id;           -- Condición de unión
-- Solo muestra productos que tienen una categoría asignada
```

#### INNER JOIN Implícito vs Explícito

```sql
-- Forma EXPLÍCITA (recomendada)
SELECT p.nombre, c.nombre
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id;

-- Forma IMPLÍCITA (antigua, pero funcional)
SELECT p.nombre, c.nombre
FROM productos p, categorias c           -- Múltiples tablas separadas por coma
WHERE p.categoria_id = c.id;            -- Condición en WHERE
-- Ambas hacen lo mismo, pero la explícita es más clara
```

#### INNER JOIN Múltiple

```sql
-- Unir tres tablas: productos, categorías y proveedores
SELECT 
    p.nombre AS producto,
    c.nombre AS categoria,
    pr.nombre AS proveedor,
    p.precio
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id      -- Primera unión
INNER JOIN proveedores pr ON p.proveedor_id = pr.id;  -- Segunda unión
-- Solo muestra productos que tienen categoría Y proveedor
```

### LEFT JOIN: "Dame Todo de la Izquierda"

El LEFT JOIN es como un jefe protector: siempre incluye todos los empleados de su departamento (tabla izquierda), aunque algunos no tengan asignaciones (tabla derecha).

![LEFT JOIN](../images/img_left_join.png)

*Crédito de imagen: [W3Schools SQL JOIN](http://w3schools.com/sql/sql_join.asp)*

```sql
-- Mostrar TODAS las categorías, incluso las que no tienen productos
SELECT 
    c.nombre AS categoria,
    COUNT(p.id) AS cantidad_productos,    -- Contar productos (0 si no hay)
    COALESCE(AVG(p.precio), 0) AS precio_promedio  -- Promedio o 0 si no hay productos
FROM categorias c                        -- Tabla principal (TODAS las filas)
LEFT JOIN productos p ON c.id = p.categoria_id  -- Unir productos si existen
GROUP BY c.id, c.nombre                  -- Agrupar por categoría
ORDER BY cantidad_productos DESC;        -- Categorías con más productos primero
```

#### Ejemplo Práctico: Clientes y sus Pedidos

```sql
-- Mostrar TODOS los clientes, incluso los que nunca han comprado
SELECT 
    cl.nombre,
    cl.email,
    COUNT(pe.id) AS total_pedidos,       -- Cantidad de pedidos (0 si nunca compró)
    COALESCE(SUM(pe.total), 0) AS total_gastado,  -- Total gastado (0 si nunca compró)
    CASE 
        WHEN COUNT(pe.id) = 0 THEN 'Sin compras'
        WHEN COUNT(pe.id) < 5 THEN 'Cliente ocasional'
        ELSE 'Cliente frecuente'
    END AS tipo_cliente                  -- Clasificación del cliente
FROM clientes cl
LEFT JOIN pedidos pe ON cl.id = pe.cliente_id
GROUP BY cl.id, cl.nombre, cl.email
ORDER BY total_gastado DESC;
```

### RIGHT JOIN: "Dame Todo de la Derecha"

El RIGHT JOIN es exactamente lo opuesto al LEFT JOIN. En la práctica, es raramente usado porque cualquier RIGHT JOIN se puede reescribir como LEFT JOIN.

![RIGHT JOIN](../images/img_right_join.png)

*Crédito de imagen: [W3Schools SQL JOIN](http://w3schools.com/sql/sql_join.asp)*

```sql
-- RIGHT JOIN (poco común)
SELECT 
    p.nombre AS producto,
    c.nombre AS categoria
FROM productos p
RIGHT JOIN categorias c ON p.categoria_id = c.id;

-- Equivalente con LEFT JOIN (preferido)
SELECT 
    p.nombre AS producto,
    c.nombre AS categoria
FROM categorias c                        -- Cambiamos el orden de las tablas
LEFT JOIN productos p ON c.id = p.categoria_id;
-- Ambas consultas dan el mismo resultado
```

### FULL OUTER JOIN: "Dame Todo de Ambos Lados"

El FULL OUTER JOIN es como hacer un inventario completo: quieres ver todo lo que tienes, sin importar si está emparejado o no.

![FULL OUTER JOIN](../images/img_full_outer_join.png)

*Crédito de imagen: [W3Schools SQL JOIN](http://w3schools.com/sql/sql_join.asp)*

```sql
-- PostgreSQL (soporta FULL OUTER JOIN nativo)
SELECT 
    COALESCE(p.nombre, 'Sin producto') AS producto,
    COALESCE(c.nombre, 'Sin categoría') AS categoria
FROM productos p
FULL OUTER JOIN categorias c ON p.categoria_id = c.id;

-- MySQL (simular FULL OUTER JOIN con UNION)
SELECT p.nombre AS producto, c.nombre AS categoria
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
UNION
SELECT p.nombre AS producto, c.nombre AS categoria
FROM productos p
RIGHT JOIN categorias c ON p.categoria_id = c.id;
```

### CROSS JOIN: El Producto Cartesiano

El CROSS JOIN es como combinar cada elemento de una lista con cada elemento de otra lista. ¡Cuidado! Puede generar muchísimos resultados.

*Nota: CROSS JOIN no tiene imagen específica ya que combina todos los elementos de ambas tablas sin condiciones de relación.*

```sql
-- Ejemplo: Combinar todos los colores con todos los tamaños
SELECT 
    col.nombre AS color,
    tam.nombre AS tamaño,
    CONCAT(col.nombre, ' - ', tam.nombre) AS combinacion  -- MySQL
    -- col.nombre || ' - ' || tam.nombre AS combinacion   -- PostgreSQL
FROM colores col
CROSS JOIN tamaños tam;
-- Si tienes 5 colores y 4 tamaños, obtienes 20 combinaciones
```

## Subconsultas: Consultas Dentro de Consultas

Las subconsultas son como muñecas rusas: consultas dentro de otras consultas. Hay diferentes tipos según dónde las uses y qué devuelvan.

### Subconsultas Escalares (Devuelven un Solo Valor)

```sql
-- Encontrar productos más caros que el precio promedio
SELECT 
    nombre,
    precio,
    (SELECT AVG(precio) FROM productos) AS precio_promedio  -- Subconsulta escalar
FROM productos 
WHERE precio > (                         -- Otra subconsulta escalar
    SELECT AVG(precio) 
    FROM productos 
    WHERE activo = TRUE
)
ORDER BY precio DESC;
-- La subconsulta escalar devuelve exactamente un valor
```

### Subconsultas de Fila (Devuelven una Fila)

```sql
-- Encontrar el producto más caro de cada categoría
SELECT 
    nombre,
    precio,
    categoria_id
FROM productos p1
WHERE (precio, categoria_id) = (         -- Subconsulta de fila
    SELECT MAX(precio), categoria_id
    FROM productos p2
    WHERE p2.categoria_id = p1.categoria_id
    GROUP BY categoria_id
);
-- La subconsulta devuelve una fila con múltiples columnas
```

### Subconsultas de Tabla (Devuelven Múltiples Filas)

#### Subconsultas con IN/NOT IN

```sql
-- Productos de categorías que tienen más de 10 productos
SELECT nombre, precio
FROM productos 
WHERE categoria_id IN (                  -- Subconsulta de tabla con IN
    SELECT categoria_id
    FROM productos 
    GROUP BY categoria_id
    HAVING COUNT(*) > 10                 -- Categorías con más de 10 productos
);

-- Clientes que nunca han hecho pedidos
SELECT nombre, email
FROM clientes 
WHERE id NOT IN (                        -- Subconsulta de tabla con NOT IN
    SELECT DISTINCT cliente_id
    FROM pedidos 
    WHERE cliente_id IS NOT NULL         -- ¡Importante! NOT IN con NULLs puede dar problemas
);
```

#### Subconsultas con EXISTS/NOT EXISTS

```sql
-- Categorías que tienen al menos un producto activo (usando EXISTS)
SELECT c.nombre
FROM categorias c
WHERE EXISTS (                           -- Subconsulta correlacionada con EXISTS
    SELECT 1                             -- No importa qué seleccionamos, solo si existe
    FROM productos p
    WHERE p.categoria_id = c.id          -- Correlación: referencia a la consulta externa
      AND p.activo = TRUE
);

-- Clientes que nunca han comprado (usando NOT EXISTS)
SELECT cl.nombre, cl.email
FROM clientes cl
WHERE NOT EXISTS (                       -- Subconsulta correlacionada con NOT EXISTS
    SELECT 1
    FROM pedidos pe
    WHERE pe.cliente_id = cl.id          -- Correlación con la tabla externa
);
```

### Subconsultas Correlacionadas vs No Correlacionadas

#### Subconsulta No Correlacionada
```sql
-- Se ejecuta UNA sola vez, independiente de la consulta externa
SELECT nombre, precio
FROM productos 
WHERE precio > (
    SELECT AVG(precio) FROM productos    -- Esta subconsulta se ejecuta una vez
);
```

#### Subconsulta Correlacionada
```sql
-- Se ejecuta UNA vez por cada fila de la consulta externa
SELECT 
    p1.nombre,
    p1.precio,
    (SELECT COUNT(*) 
     FROM productos p2 
     WHERE p2.categoria_id = p1.categoria_id  -- Referencia a la consulta externa
       AND p2.precio < p1.precio) AS productos_mas_baratos
FROM productos p1;
-- Esta subconsulta se ejecuta por cada producto
```

### Subconsultas en FROM (Tablas Derivadas)

```sql
-- Usar una subconsulta como si fuera una tabla
SELECT 
    categoria,
    productos_activos,
    precio_promedio
FROM (                                   -- Subconsulta en FROM (tabla derivada)
    SELECT 
        c.nombre AS categoria,
        COUNT(p.id) AS productos_activos,
        AVG(p.precio) AS precio_promedio
    FROM categorias c
    JOIN productos p ON c.id = p.categoria_id
    WHERE p.activo = TRUE
    GROUP BY c.id, c.nombre
) AS resumen_categorias                  -- Alias obligatorio para la subconsulta
WHERE productos_activos > 5              -- Filtrar el resultado de la subconsulta
ORDER BY precio_promedio DESC;
```

### Common Table Expressions (CTE) - La Forma Elegante

Los CTEs son como variables temporales para consultas complejas. Hacen el código más legible.

```sql
-- PostgreSQL y MySQL 8.0+
WITH resumen_ventas AS (                 -- Definir CTE
    SELECT 
        cliente_id,
        COUNT(*) AS total_pedidos,
        SUM(total) AS total_gastado,
        AVG(total) AS promedio_pedido
    FROM pedidos 
    WHERE fecha_pedido >= '2023-01-01'
    GROUP BY cliente_id
),
clientes_vip AS (                        -- Segundo CTE
    SELECT cliente_id
    FROM resumen_ventas
    WHERE total_gastado > 1000
)
-- Consulta principal usando los CTEs
SELECT 
    c.nombre,
    c.email,
    rv.total_pedidos,
    rv.total_gastado
FROM clientes c
JOIN resumen_ventas rv ON c.id = rv.cliente_id
JOIN clientes_vip cv ON c.id = cv.cliente_id
ORDER BY rv.total_gastado DESC;
```

## Consultas Complejas: Casos Reales

### Análisis de Ventas por Trimestre

```sql
-- MySQL
WITH ventas_trimestrales AS (
    SELECT 
        YEAR(fecha_pedido) AS año,
        QUARTER(fecha_pedido) AS trimestre,  -- MySQL: función QUARTER
        SUM(total) AS ingresos,
        COUNT(*) AS cantidad_pedidos,
        COUNT(DISTINCT cliente_id) AS clientes_unicos
    FROM pedidos 
    GROUP BY YEAR(fecha_pedido), QUARTER(fecha_pedido)
)
SELECT 
    año,
    trimestre,
    ingresos,
    cantidad_pedidos,
    clientes_unicos,
    LAG(ingresos) OVER (ORDER BY año, trimestre) AS ingresos_anterior,  -- Trimestre anterior
    ROUND(
        ((ingresos - LAG(ingresos) OVER (ORDER BY año, trimestre)) / 
         LAG(ingresos) OVER (ORDER BY año, trimestre)) * 100, 2
    ) AS crecimiento_porcentual
FROM ventas_trimestrales
ORDER BY año, trimestre;

-- PostgreSQL
WITH ventas_trimestrales AS (
    SELECT 
        EXTRACT(YEAR FROM fecha_pedido) AS año,
        EXTRACT(QUARTER FROM fecha_pedido) AS trimestre,  -- PostgreSQL: EXTRACT
        SUM(total) AS ingresos,
        COUNT(*) AS cantidad_pedidos,
        COUNT(DISTINCT cliente_id) AS clientes_unicos
    FROM pedidos 
    GROUP BY EXTRACT(YEAR FROM fecha_pedido), EXTRACT(QUARTER FROM fecha_pedido)
)
SELECT 
    año,
    trimestre,
    ingresos,
    cantidad_pedidos,
    clientes_unicos,
    LAG(ingresos) OVER (ORDER BY año, trimestre) AS ingresos_anterior,
    ROUND(
        ((ingresos - LAG(ingresos) OVER (ORDER BY año, trimestre))::NUMERIC / 
         LAG(ingresos) OVER (ORDER BY año, trimestre)) * 100, 2
    ) AS crecimiento_porcentual
FROM ventas_trimestrales
ORDER BY año, trimestre;
```

### Top 5 Productos por Categoría

```sql
-- Usando funciones de ventana (Window Functions)
WITH productos_rankeados AS (
    SELECT 
        p.nombre AS producto,
        c.nombre AS categoria,
        p.precio,
        p.stock,
        COALESCE(SUM(vd.cantidad), 0) AS unidades_vendidas,
        ROW_NUMBER() OVER (                  -- Asignar número de fila
            PARTITION BY c.id                -- Por cada categoría
            ORDER BY COALESCE(SUM(vd.cantidad), 0) DESC  -- Ordenar por ventas
        ) AS ranking
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN ventas_detalle vd ON p.id = vd.producto_id
    WHERE p.activo = TRUE
    GROUP BY p.id, p.nombre, c.id, c.nombre, p.precio, p.stock
)
SELECT 
    categoria,
    producto,
    precio,
    unidades_vendidas,
    ranking
FROM productos_rankeados
WHERE ranking <= 5                       -- Solo top 5 por categoría
ORDER BY categoria, ranking;
```

### Análisis de Cohortes de Clientes

```sql
-- Análisis de retención de clientes por mes de registro
WITH primer_compra AS (
    SELECT 
        cliente_id,
        MIN(fecha_pedido) AS fecha_primera_compra
    FROM pedidos
    GROUP BY cliente_id
),
cohortes AS (
    SELECT 
        pc.cliente_id,
        DATE_FORMAT(pc.fecha_primera_compra, '%Y-%m') AS cohorte,  -- MySQL
        -- TO_CHAR(pc.fecha_primera_compra, 'YYYY-MM') AS cohorte, -- PostgreSQL
        p.fecha_pedido,
        PERIOD_DIFF(                         -- MySQL: diferencia en meses
            DATE_FORMAT(p.fecha_pedido, '%Y%m'),
            DATE_FORMAT(pc.fecha_primera_compra, '%Y%m')
        ) AS meses_desde_registro
        /*
        -- PostgreSQL equivalente:
        EXTRACT(YEAR FROM AGE(p.fecha_pedido, pc.fecha_primera_compra)) * 12 +
        EXTRACT(MONTH FROM AGE(p.fecha_pedido, pc.fecha_primera_compra)) AS meses_desde_registro
        */
    FROM primer_compra pc
    JOIN pedidos p ON pc.cliente_id = p.cliente_id
)
SELECT 
    cohorte,
    meses_desde_registro,
    COUNT(DISTINCT cliente_id) AS clientes_activos,
    ROUND(
        COUNT(DISTINCT cliente_id) * 100.0 / 
        FIRST_VALUE(COUNT(DISTINCT cliente_id)) OVER (
            PARTITION BY cohorte 
            ORDER BY meses_desde_registro
        ), 2
    ) AS porcentaje_retencion
FROM cohortes
GROUP BY cohorte, meses_desde_registro
ORDER BY cohorte, meses_desde_registro;
```

## Optimización de Consultas Complejas

### 1. Uso Inteligente de Índices

```sql
-- Crear índices para optimizar JOINs
CREATE INDEX idx_productos_categoria_activo ON productos(categoria_id, activo);
CREATE INDEX idx_pedidos_cliente_fecha ON pedidos(cliente_id, fecha_pedido);
CREATE INDEX idx_ventas_detalle_producto ON ventas_detalle(producto_id);
```

### 2. Evitar Subconsultas Correlacionadas Cuando Sea Posible

```sql
-- ❌ LENTO: Subconsulta correlacionada
SELECT p.nombre
FROM productos p
WHERE EXISTS (
    SELECT 1 FROM ventas_detalle vd 
    WHERE vd.producto_id = p.id
);

-- ✅ RÁPIDO: JOIN
SELECT DISTINCT p.nombre
FROM productos p
JOIN ventas_detalle vd ON p.id = vd.producto_id;
```

### 3. Usar LIMIT en Subconsultas Grandes

```sql
-- Limitar resultados en subconsultas
SELECT nombre
FROM productos 
WHERE categoria_id IN (
    SELECT id 
    FROM categorias 
    WHERE activa = TRUE
    LIMIT 100                            -- Evitar subconsultas masivas
);
```

## Casos de Uso Avanzados

### Encontrar Duplicados

```sql
-- Productos con nombres duplicados
SELECT nombre, COUNT(*) AS cantidad
FROM productos 
GROUP BY nombre
HAVING COUNT(*) > 1;

-- Detalles de los productos duplicados
SELECT p.*
FROM productos p
JOIN (
    SELECT nombre
    FROM productos 
    GROUP BY nombre
    HAVING COUNT(*) > 1
) duplicados ON p.nombre = duplicados.nombre
ORDER BY p.nombre, p.id;
```

### Ranking y Percentiles

```sql
-- Productos en diferentes percentiles de precio
SELECT 
    nombre,
    precio,
    NTILE(4) OVER (ORDER BY precio) AS cuartil,  -- Dividir en 4 grupos
    PERCENT_RANK() OVER (ORDER BY precio) AS percentil,  -- Posición percentil
    CASE 
        WHEN NTILE(4) OVER (ORDER BY precio) = 1 THEN 'Económico'
        WHEN NTILE(4) OVER (ORDER BY precio) = 2 THEN 'Medio-Bajo'
        WHEN NTILE(4) OVER (ORDER BY precio) = 3 THEN 'Medio-Alto'
        ELSE 'Premium'
    END AS segmento_precio
FROM productos 
WHERE activo = TRUE
ORDER BY precio;
```

## Próximo Paso

En el siguiente módulo vamos a profundizar en las funciones de agregación avanzadas y técnicas de agrupamiento que te permitirán crear reportes profesionales. ¡Prepárate para convertirte en un analista de datos experto!

---

**Recuerda:** Las consultas complejas son como resolver un rompecabezas: cada pieza (JOIN, subconsulta, función) debe encajar perfectamente para obtener el resultado deseado. ¡La práctica hace al maestro!
