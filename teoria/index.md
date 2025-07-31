# Teoría SQL - Guía Completa Organizada por Temas

¡Bienvenido a la teoría SQL reorganizada! Hemos fragmentado el contenido en módulos temáticos para facilitar el aprendizaje progresivo y la consulta específica.

## Estructura del Curso

### [01 - Fundamentos](./01-fundamentos.md)
**Tu primera inmersión en el mundo de las bases de datos**
- ¿Qué es SQL y por qué aprenderlo?
- Historia y evolución de SQL
- Tipos de comandos SQL (DDL, DML, DCL, TCL)
- Estructura básica de consultas SELECT
- Conceptos clave: claves primarias, foráneas, índices

### [02 - DDL y Estructura](./02-ddl-estructura.md)
**Construyendo los cimientos de tu base de datos**
- Comandos CREATE, ALTER, DROP, TRUNCATE
- Tipos de datos en MySQL y PostgreSQL
- Restricciones (PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE)
- Mejores prácticas de diseño
- Nomenclatura y estándares

### [03 - DML y Manipulación](./03-dml-manipulacion.md)
**Donde la magia realmente sucede**
- INSERT: poblando datos (simple, múltiple, con subconsultas)
- SELECT: el arte de buscar (WHERE, LIKE, IN, ORDER BY, LIMIT)
- UPDATE: modificando con precisión
- DELETE: eliminando con cuidado
- Funciones de agregación básicas (COUNT, SUM, AVG, MIN, MAX)

### [04 - Consultas Avanzadas](./04-consultas-avanzadas.md)
**El arte de conectar datos**
- **JOINs completos**: INNER, LEFT, RIGHT, FULL OUTER, CROSS
- **Subconsultas por tipo**:
  - Subconsultas escalares (devuelven un valor)
  - Subconsultas de fila (devuelven una fila)
  - Subconsultas de tabla (devuelven múltiples filas)
  - Subconsultas correlacionadas vs no correlacionadas
- EXISTS, NOT EXISTS, IN, NOT IN
- Common Table Expressions (CTEs)
- Funciones de ventana (Window Functions)

### [05 - Funciones de Agregación](./05-funciones-agregacion.md)
**Convirtiendo datos en información valiosa**
- Funciones de agregación avanzadas
- GROUP BY con múltiples columnas y fechas
- HAVING: filtros para grupos
- Funciones de ventana avanzadas
- Análisis ABC, Pareto y cohortes
- Casos de uso empresariales reales

### [06 - Optimización e Índices](./06-optimizacion-indices.md)
**Haciendo que SQL vuele como un cohete**
- Tipos de índices (primario, único, simple, compuesto)
- Cuándo crear y cuándo NO crear índices
- EXPLAIN: análisis de rendimiento
- Vistas simples y materializadas
- Estrategias de optimización avanzadas
- Particionamiento y desnormalización controlada

### [07 - Transacciones y Control](./07-transacciones-control.md)
**El arte de la seguridad y consistencia**
- Transacciones ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad)
- BEGIN, COMMIT, ROLLBACK, SAVEPOINT
- Niveles de aislamiento y concurrencia
- Control de acceso (DCL): usuarios, roles, permisos
- Procedimientos almacenados y triggers
- Backup, recuperación y mantenimiento

## Características Especiales

### Ejemplos Duales: MySQL y PostgreSQL
Cada ejemplo de código incluye sintaxis para ambos motores de base de datos, claramente comentada:

```sql
-- MySQL
SELECT YEAR(fecha) AS año FROM tabla;

-- PostgreSQL  
SELECT EXTRACT(YEAR FROM fecha) AS año FROM tabla;
```

### Código Completamente Comentado
Todas las consultas incluyen comentarios línea por línea explicando qué hace cada parte:

```sql
SELECT p.nombre,                        -- Nombre del producto
       COUNT(*) AS total_ventas         -- Cantidad total de ventas
FROM productos p                        -- Tabla principal de productos
JOIN ventas v ON p.id = v.producto_id   -- Unir con tabla de ventas
WHERE p.activo = TRUE                   -- Solo productos activos
GROUP BY p.id, p.nombre                 -- Agrupar por producto
ORDER BY total_ventas DESC;             -- Ordenar por más vendidos
```

### Especificación de Tipos de Subconsultas
Cada subconsulta está claramente identificada por su tipo y propósito:
- **Subconsulta escalar**: `(SELECT AVG(precio) FROM productos)`
- **Subconsulta correlacionada**: Referencias a la consulta externa
- **Subconsulta de existencia**: Con EXISTS/NOT EXISTS

## Cómo Usar Esta Guía

### Para Principiantes
1. Comienza con **01-Fundamentos**
2. Continúa secuencialmente hasta **03-DML**
3. Practica cada concepto antes de avanzar

### Para Intermedios
1. Revisa **04-Consultas Avanzadas** para JOINs y subconsultas
2. Domina **05-Funciones de Agregación** para análisis de datos
3. Aplica **06-Optimización** para mejorar rendimiento

### Para Avanzados
1. Enfócate en **06-Optimización** y **07-Transacciones**
2. Usa como referencia rápida para casos específicos
3. Implementa las mejores prácticas en proyectos reales

## Casos de Uso por Módulo

- **Módulo 1-2**: Diseño de base de datos desde cero
- **Módulo 3**: Operaciones CRUD básicas
- **Módulo 4**: Reportes complejos y análisis de datos
- **Módulo 5**: Business Intelligence y métricas empresariales
- **Módulo 6**: Optimización de aplicaciones en producción
- **Módulo 7**: Sistemas críticos y alta disponibilidad

## Migración desde el Archivo Original

Si vienes del archivo `teoria_sql.md` original, esta nueva estructura te ofrece:
- **Mejor organización** por temas específicos
- **Búsqueda más rápida** de conceptos particulares
- **Ejemplos más detallados** con ambos motores de BD
- **Casos de uso prácticos** empresariales
- **Mejores prácticas** actualizadas

---

**¡Que disfrutes tu viaje de aprendizaje SQL!** 🎓

> **Tip**: Marca esta página y úsala como índice para navegar rápidamente a los temas que necesites consultar.
