# Fundamentos de SQL: Teoría Completa

## Introducción a SQL

SQL (Structured Query Language) es un lenguaje estándar para gestionar y manipular bases de datos relacionales. Fue desarrollado en la década de 1970 por IBM y posteriormente estandarizado por ANSI e ISO. SQL permite a los usuarios definir, manipular y controlar datos en sistemas de gestión de bases de datos relacionales (RDBMS).

## Tipos de Comandos SQL

SQL se organiza en distintos tipos de comandos, cada uno diseñado para cumplir un conjunto específico de tareas al interactuar con bases de datos. Estos tipos abarcan desde la definición de la estructura de la base de datos hasta el control de accesos y transacciones.

### 1. Comandos DDL (Data Definition Language)

Los comandos DDL se utilizan para definir y modificar la estructura de objetos en la base de datos.

- **CREATE**: Crea nuevos objetos en la base de datos (tablas, vistas, índices, etc.)
  ```sql
  CREATE TABLE empleados (
      id INT PRIMARY KEY,
      nombre VARCHAR(50),
      apellido VARCHAR(50),
      fecha_contratacion DATE
  );
  ```

- **ALTER**: Modifica la estructura de objetos existentes
  ```sql
  ALTER TABLE empleados ADD COLUMN salario DECIMAL(10,2);
  ```

- **DROP**: Elimina objetos de la base de datos
  ```sql
  DROP TABLE empleados;
  ```

- **TRUNCATE**: Elimina todos los registros de una tabla, pero mantiene su estructura
  ```sql
  TRUNCATE TABLE empleados;
  ```

### 2. Comandos DML (Data Manipulation Language)

Los comandos DML permiten manipular los datos almacenados en la base de datos.

- **INSERT**: Agrega nuevos registros a una tabla
  ```sql
  INSERT INTO empleados (id, nombre, apellido, fecha_contratacion)
  VALUES (1, 'Juan', 'Pérez', '2023-01-15');
  ```

- **UPDATE**: Modifica registros existentes
  ```sql
  UPDATE empleados SET salario = 3500 WHERE id = 1;
  ```

- **DELETE**: Elimina registros de una tabla
  ```sql
  DELETE FROM empleados WHERE id = 1;
  ```

- **SELECT**: Recupera datos de una o más tablas (aunque técnicamente es parte de DQL)
  ```sql
  SELECT nombre, apellido FROM empleados;
  ```

### 3. Comandos DQL (Data Query Language)

Los comandos DQL se utilizan específicamente para consultar datos.

- **SELECT**: El comando principal para recuperar datos
  ```sql
  SELECT * FROM empleados WHERE salario > 3000;
  ```

### 4. Comandos DCL (Data Control Language)

Los comandos DCL controlan los permisos y accesos a la base de datos.

- **GRANT**: Otorga permisos a usuarios
  ```sql
  GRANT SELECT, INSERT ON empleados TO usuario1;
  ```

- **REVOKE**: Retira permisos previamente otorgados
  ```sql
  REVOKE INSERT ON empleados FROM usuario1;
  ```

### 5. Comandos TCL (Transaction Control Language)

Los comandos TCL gestionan las transacciones en la base de datos.

- **COMMIT**: Guarda permanentemente los cambios realizados en una transacción
  ```sql
  COMMIT;
  ```

- **ROLLBACK**: Deshace los cambios realizados en una transacción
  ```sql
  ROLLBACK;
  ```

- **SAVEPOINT**: Establece un punto de guardado dentro de una transacción
  ```sql
  SAVEPOINT punto1;
  ```

## Consultas SQL Básicas

### Estructura básica de una consulta SELECT

```sql
SELECT columna1, columna2, ... 
FROM tabla
WHERE condición;
```

### Operadores de comparación

- **=** (igual a)
- **<>** o **!=** (diferente de)
- **>** (mayor que)
- **<** (menor que)
- **>=** (mayor o igual que)
- **<=** (menor o igual que)

### Operadores lógicos

- **AND**: Ambas condiciones deben ser verdaderas
- **OR**: Al menos una condición debe ser verdadera
- **NOT**: Niega una condición

### Cláusulas principales

- **WHERE**: Filtra registros según una condición
  ```sql
  SELECT * FROM productos WHERE precio > 100;
  ```

- **ORDER BY**: Ordena los resultados
  ```sql
  SELECT * FROM productos ORDER BY precio DESC;
  ```

- **LIMIT/OFFSET**: Limita el número de resultados (la sintaxis puede variar según el RDBMS)
  ```sql
  SELECT * FROM productos LIMIT 10 OFFSET 20;
  ```

## Consultas SQL Avanzadas

### Funciones de agregación

Las funciones de agregación realizan cálculos sobre conjuntos de valores y devuelven un único valor.

- **COUNT()**: Cuenta el número de filas
  ```sql
  SELECT COUNT(*) FROM empleados;
  ```

- **SUM()**: Calcula la suma de los valores en una columna
  ```sql
  SELECT SUM(salario) FROM empleados;
  ```

- **AVG()**: Calcula el promedio de los valores en una columna
  ```sql
  SELECT AVG(salario) FROM empleados;
  ```

- **MAX()**: Devuelve el valor máximo de una columna
  ```sql
  SELECT MAX(salario) FROM empleados;
  ```

- **MIN()**: Devuelve el valor mínimo de una columna
  ```sql
  SELECT MIN(salario) FROM empleados;
  ```

### Agrupación de datos

- **GROUP BY**: Agrupa filas que tienen los mismos valores
  ```sql
  SELECT departamento, COUNT(*) 
  FROM empleados 
  GROUP BY departamento;
  ```

- **HAVING**: Filtra grupos según una condición (similar a WHERE pero para grupos)
  ```sql
  SELECT departamento, AVG(salario) 
  FROM empleados 
  GROUP BY departamento 
  HAVING AVG(salario) > 3000;
  ```

### Subconsultas (Subqueries)

Las subconsultas son consultas anidadas dentro de otra consulta.

- **Subconsulta en WHERE**:
  ```sql
  SELECT nombre 
  FROM empleados 
  WHERE departamento_id IN (SELECT id FROM departamentos WHERE ubicacion = 'Madrid');
  ```

- **Subconsulta en FROM**:
  ```sql
  SELECT t.nombre, t.promedio_salario
  FROM (SELECT departamento_id, AVG(salario) AS promedio_salario 
        FROM empleados 
        GROUP BY departamento_id) AS t
  JOIN departamentos d ON t.departamento_id = d.id;
  ```

- **Subconsulta en SELECT**:
  ```sql
  SELECT e.nombre,
         (SELECT COUNT(*) FROM proyectos p WHERE p.empleado_id = e.id) AS num_proyectos
  FROM empleados e;
  ```

### Joins (Uniones)

Los joins permiten combinar filas de dos o más tablas basándose en una columna relacionada.

- **INNER JOIN**: Devuelve registros cuando hay coincidencias en ambas tablas
  ```sql
  SELECT e.nombre, d.nombre AS departamento
  FROM empleados e
  INNER JOIN departamentos d ON e.departamento_id = d.id;
  ```

- **LEFT JOIN**: Devuelve todos los registros de la tabla izquierda y los registros coincidentes de la tabla derecha
  ```sql
  SELECT e.nombre, d.nombre AS departamento
  FROM empleados e
  LEFT JOIN departamentos d ON e.departamento_id = d.id;
  ```

- **RIGHT JOIN**: Devuelve todos los registros de la tabla derecha y los registros coincidentes de la tabla izquierda
  ```sql
  SELECT e.nombre, d.nombre AS departamento
  FROM empleados e
  RIGHT JOIN departamentos d ON e.departamento_id = d.id;
  ```

- **FULL JOIN**: Devuelve registros cuando hay una coincidencia en cualquiera de las tablas
  ```sql
  SELECT e.nombre, d.nombre AS departamento
  FROM empleados e
  FULL JOIN departamentos d ON e.departamento_id = d.id;
  ```

### Tipos de JOINS en detalle

1. **INNER JOIN**
   - Devuelve solo las filas donde hay coincidencias en ambas tablas
   - Es el tipo de JOIN más común
   - Sintaxis: `FROM tabla1 INNER JOIN tabla2 ON tabla1.columna = tabla2.columna`

2. **LEFT JOIN (o LEFT OUTER JOIN)**
   - Devuelve todas las filas de la tabla izquierda y las coincidencias de la tabla derecha
   - Si no hay coincidencia, los valores de la tabla derecha serán NULL
   - Útil para encontrar registros que no tienen correspondencia

3. **RIGHT JOIN (o RIGHT OUTER JOIN)**
   - Devuelve todas las filas de la tabla derecha y las coincidencias de la tabla izquierda
   - Si no hay coincidencia, los valores de la tabla izquierda serán NULL
   - Menos común que LEFT JOIN, pero con la misma funcionalidad en sentido inverso

4. **FULL JOIN (o FULL OUTER JOIN)**
   - Combina los resultados de LEFT JOIN y RIGHT JOIN
   - Devuelve todas las filas de ambas tablas
   - Si no hay coincidencia, los valores de la tabla sin coincidencia serán NULL
   - No todos los sistemas de bases de datos lo soportan (MySQL no lo implementa directamente)

5. **SELF JOIN**
   - Un JOIN de una tabla consigo misma
   - Útil para relaciones jerárquicas o para comparar filas dentro de la misma tabla
   - Requiere el uso de alias para distinguir entre instancias de la misma tabla

### Funciones de cadena

- **CONCAT()**: Concatena dos o más cadenas
  ```sql
  SELECT CONCAT(nombre, ' ', apellido) AS nombre_completo FROM empleados;
  ```

- **SUBSTRING()**: Extrae una parte de una cadena
  ```sql
  SELECT SUBSTRING(nombre, 1, 3) FROM empleados;
  ```

- **UPPER()**: Convierte una cadena a mayúsculas
  ```sql
  SELECT UPPER(nombre) FROM empleados;
  ```

- **LOWER()**: Convierte una cadena a minúsculas
  ```sql
  SELECT LOWER(nombre) FROM empleados;
  ```

- **LENGTH()**: Devuelve la longitud de una cadena
  ```sql
  SELECT nombre, LENGTH(nombre) AS longitud FROM empleados;
  ```

### Funciones de fecha

- **NOW()**: Devuelve la fecha y hora actuales
  ```sql
  SELECT NOW();
  ```

- **CURDATE()**: Devuelve la fecha actual
  ```sql
  SELECT CURDATE();
  ```

- **YEAR()**, **MONTH()**, **DAY()**: Extraen componentes de una fecha
  ```sql
  SELECT nombre, YEAR(fecha_contratacion) AS año_contratacion FROM empleados;
  ```

- **DATEDIFF()**: Calcula la diferencia entre dos fechas
  ```sql
  SELECT DATEDIFF(CURDATE(), fecha_contratacion) AS dias_trabajados FROM empleados;
  ```

### Expresiones condicionales

- **CASE**: Permite lógica condicional en consultas
  ```sql
  SELECT nombre,
         CASE
             WHEN salario < 3000 THEN 'Bajo'
             WHEN salario BETWEEN 3000 AND 5000 THEN 'Medio'
             ELSE 'Alto'
         END AS nivel_salario
  FROM empleados;
  ```

- **IF()**: Función condicional simple (disponible en MySQL)
  ```sql
  SELECT nombre, IF(salario > 3000, 'Alto', 'Bajo') AS nivel_salario FROM empleados;
  ```

### Vistas

Las vistas son consultas almacenadas que se pueden usar como tablas virtuales.

- **Crear una vista**:
  ```sql
  CREATE VIEW empleados_departamento AS
  SELECT e.nombre, e.apellido, d.nombre AS departamento
  FROM empleados e
  JOIN departamentos d ON e.departamento_id = d.id;
  ```

- **Usar una vista**:
  ```sql
  SELECT * FROM empleados_departamento WHERE departamento = 'Ventas';
  ```

### Índices

Los índices mejoran el rendimiento de las consultas al permitir un acceso más rápido a los datos.

- **Crear un índice**:
  ```sql
  CREATE INDEX idx_apellido ON empleados(apellido);
  ```

- **Índice único**:
  ```sql
  CREATE UNIQUE INDEX idx_email ON empleados(email);
  ```

## Optimización de consultas

### Principios básicos

1. **Seleccionar solo las columnas necesarias**: Evitar `SELECT *` cuando no se necesitan todas las columnas
2. **Usar índices adecuadamente**: Crear índices en columnas frecuentemente utilizadas en cláusulas WHERE, JOIN y ORDER BY
3. **Limitar resultados**: Usar LIMIT para reducir el conjunto de resultados
4. **Evitar funciones en columnas indexadas**: Las funciones en columnas indexadas pueden impedir el uso del índice

### Análisis de consultas

- **EXPLAIN**: Muestra el plan de ejecución de una consulta
  ```sql
  EXPLAIN SELECT * FROM empleados WHERE apellido = 'Pérez';
  ```

## Transacciones

Las transacciones permiten agrupar operaciones para garantizar la integridad de los datos.

- **Iniciar una transacción**:
  ```sql
  START TRANSACTION;
  ```

- **Confirmar una transacción**:
  ```sql
  COMMIT;
  ```

- **Deshacer una transacción**:
  ```sql
  ROLLBACK;
  ```

- **Ejemplo completo**:
  ```sql
  START TRANSACTION;
  UPDATE cuentas SET saldo = saldo - 1000 WHERE id = 1;
  UPDATE cuentas SET saldo = saldo + 1000 WHERE id = 2;
  COMMIT;
  ```

## Procedimientos almacenados y funciones

### Procedimientos almacenados

Los procedimientos almacenados son conjuntos de instrucciones SQL que se pueden almacenar y ejecutar repetidamente.

```sql
DELIMITER //
CREATE PROCEDURE aumentar_salario(IN empleado_id INT, IN porcentaje DECIMAL(5,2))
BEGIN
    UPDATE empleados
    SET salario = salario * (1 + porcentaje/100)
    WHERE id = empleado_id;
END //
DELIMITER ;

-- Llamar al procedimiento
CALL aumentar_salario(1, 10);
```

### Funciones

Las funciones son similares a los procedimientos pero devuelven un valor.

```sql
DELIMITER //
CREATE FUNCTION calcular_antiguedad(fecha_contratacion DATE) RETURNS INT
BEGIN
    RETURN DATEDIFF(CURDATE(), fecha_contratacion) / 365;
END //
DELIMITER ;

-- Usar la función
SELECT nombre, calcular_antiguedad(fecha_contratacion) AS años_trabajados FROM empleados;
```

## Conclusión

SQL es un lenguaje potente y versátil para trabajar con bases de datos relacionales. Dominar sus conceptos fundamentales y técnicas avanzadas permite a los desarrolladores y analistas de datos realizar consultas eficientes y obtener información valiosa de los datos almacenados.

La práctica constante y la comprensión de los principios de optimización son clave para convertirse en un experto en SQL y aprovechar al máximo las capacidades de los sistemas de gestión de bases de datos relacionales.
