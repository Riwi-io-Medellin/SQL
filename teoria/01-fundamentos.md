# Fundamentos de SQL: Tu Primera Inmersión en el Mundo de las Bases de Datos

¡Hola y bienvenidos a este fascinante viaje por el mundo de SQL! En este primer módulo vamos a sentar las bases sólidas que necesitas para entender qué es SQL, por qué es tan importante y cómo funciona en el día a día de cualquier desarrollador o analista de datos.

## ¿Qué es SQL y Por Qué Deberías Aprenderlo?

Imagínate que tienes una biblioteca gigantesca con millones de libros, pero sin ningún sistema de organización. Sería imposible encontrar lo que buscas, ¿verdad? Bueno, eso es exactamente lo que pasaría con los datos de una empresa sin SQL.

**SQL (Structured Query Language)** es como el bibliotecario más eficiente del mundo. Es un lenguaje estándar que nos permite:
- **Organizar** datos de manera estructurada
- **Buscar** información específica en segundos
- **Modificar** datos de forma segura
- **Controlar** quién puede acceder a qué información

### Un Poco de Historia (Para Que No Te Aburras)

SQL nació en los años 70 en IBM, cuando un grupo de ingenieros se dieron cuenta de que necesitaban una forma más inteligente de manejar datos. Desde entonces, se ha convertido en el estándar mundial para bases de datos relacionales.

## Los Tipos de Comandos SQL: Tu Caja de Herramientas

SQL no es solo un lenguaje, es como tener una caja de herramientas completa. Cada tipo de comando tiene su propósito específico:

### 1. DDL (Data Definition Language) - Los Arquitectos

Los comandos DDL son como los arquitectos de tu base de datos. Se encargan de diseñar y construir la estructura:

#### CREATE - Construyendo los Cimientos

```sql
-- MySQL
CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- Campo único que se incrementa automáticamente
    nombre VARCHAR(50) NOT NULL,        -- Texto hasta 50 caracteres, obligatorio
    apellido VARCHAR(50) NOT NULL,      -- Texto hasta 50 caracteres, obligatorio
    fecha_contratacion DATE,            -- Solo fecha (YYYY-MM-DD)
    salario DECIMAL(10,2)               -- Número con hasta 10 dígitos, 2 decimales
);
```

```sql
-- PostgreSQL
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,              -- SERIAL es el equivalente a AUTO_INCREMENT
    nombre VARCHAR(50) NOT NULL,        -- Texto hasta 50 caracteres, obligatorio
    apellido VARCHAR(50) NOT NULL,      -- Texto hasta 50 caracteres, obligatorio
    fecha_contratacion DATE,            -- Solo fecha (YYYY-MM-DD)
    salario NUMERIC(10,2)               -- NUMERIC es más preciso que DECIMAL
);
```

**¿Qué está pasando aquí?** Estamos creando una tabla llamada `empleados` con cinco columnas. Es como diseñar un formulario donde cada empleado tendrá estos campos específicos.

#### ALTER - Remodelando la Casa

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
ALTER TABLE empleados 
ADD COLUMN telefono VARCHAR(15);        -- Agregamos una nueva columna para teléfono
```

```sql
-- Modificar una columna existente
-- MySQL
ALTER TABLE empleados 
MODIFY COLUMN salario DECIMAL(12,2);    -- Aumentamos el tamaño del salario

-- PostgreSQL
ALTER TABLE empleados 
ALTER COLUMN salario TYPE NUMERIC(12,2); -- En PostgreSQL usamos TYPE
```

#### DROP - Demoliendo (¡Cuidado!)

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
DROP TABLE empleados;                   -- ¡PELIGRO! Esto elimina toda la tabla
```

**¡Momento!** Antes de usar DROP, asegúrate de que realmente quieres eliminar algo. Es como demoler una casa: una vez que lo haces, no hay vuelta atrás.

#### TRUNCATE - Vaciando sin Destruir

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
TRUNCATE TABLE empleados;               -- Elimina todos los datos pero mantiene la estructura
```

### 2. DML (Data Manipulation Language) - Los Operarios

Los comandos DML son los operarios que trabajan día a día con los datos:

#### INSERT - Agregando Nuevos Inquilinos

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
INSERT INTO empleados (nombre, apellido, fecha_contratacion, salario)
VALUES ('Juan', 'Pérez', '2023-01-15', 45000.00);  -- Agregamos un empleado
```

```sql
-- Insertar múltiples registros de una vez
-- MySQL y PostgreSQL (sintaxis idéntica)
INSERT INTO empleados (nombre, apellido, fecha_contratacion, salario)
VALUES 
    ('María', 'González', '2023-02-01', 48000.00),  -- Primer empleado
    ('Carlos', 'Rodríguez', '2023-02-15', 52000.00), -- Segundo empleado
    ('Ana', 'López', '2023-03-01', 46000.00);       -- Tercer empleado
```

#### SELECT - El Detective de los Datos

```sql
-- Consulta básica: "Muéstrame todo"
-- MySQL y PostgreSQL (sintaxis idéntica)
SELECT * FROM empleados;                -- El asterisco (*) significa "todas las columnas"
```

```sql
-- Consulta específica: "Solo quiero ver nombres y salarios"
-- MySQL y PostgreSQL (sintaxis idéntica)
SELECT nombre, apellido, salario        -- Especificamos qué columnas queremos
FROM empleados                          -- De qué tabla
WHERE salario > 47000;                  -- Con qué condición
```

#### UPDATE - El Renovador

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
UPDATE empleados                        -- Tabla a modificar
SET salario = 50000                     -- Qué cambiar
WHERE nombre = 'Juan' AND apellido = 'Pérez'; -- A quién cambiarle
```

**¡Cuidado con el WHERE!** Sin esta cláusula, cambiarías el salario de TODOS los empleados. Es como pintar toda la casa cuando solo querías pintar una habitación.

#### DELETE - El Eliminador Selectivo

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
DELETE FROM empleados                   -- De qué tabla eliminar
WHERE fecha_contratacion < '2023-02-01'; -- Qué registros eliminar
```

### 3. DCL (Data Control Language) - Los Guardias de Seguridad

#### GRANT - Dando Permisos

```sql
-- MySQL
GRANT SELECT, INSERT ON empleados TO 'usuario_rrhh'@'localhost';

-- PostgreSQL
GRANT SELECT, INSERT ON empleados TO usuario_rrhh;
```

#### REVOKE - Quitando Permisos

```sql
-- MySQL
REVOKE INSERT ON empleados FROM 'usuario_rrhh'@'localhost';

-- PostgreSQL
REVOKE INSERT ON empleados FROM usuario_rrhh;
```

### 4. TCL (Transaction Control Language) - Los Controladores de Tráfico

#### COMMIT - Confirmando los Cambios

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
BEGIN;                                  -- Iniciamos una transacción
UPDATE empleados SET salario = salario * 1.1 WHERE departamento = 'Ventas';
COMMIT;                                 -- Confirmamos los cambios
```

#### ROLLBACK - Deshaciendo el Desastre

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
BEGIN;                                  -- Iniciamos una transacción
DELETE FROM empleados WHERE salario < 30000; -- ¡Ups! Esto fue un error
ROLLBACK;                               -- Deshacemos todo, como si nunca hubiera pasado
```

## Estructura Básica de una Consulta SELECT

Ahora que conoces los tipos de comandos, vamos a profundizar en SELECT, que es como el cuchillo suizo de SQL:

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
SELECT columna1, columna2               -- QUÉ quieres ver
FROM tabla                             -- DE DÓNDE lo quieres sacar
WHERE condicion                        -- QUÉ CONDICIONES debe cumplir
GROUP BY columna                       -- CÓMO agrupar los resultados
HAVING condicion_grupo                 -- QUÉ CONDICIONES para los grupos
ORDER BY columna                       -- CÓMO ordenar los resultados
LIMIT cantidad;                        -- CUÁNTOS resultados mostrar
```

### Ejemplo Práctico Paso a Paso

Imagínate que tienes una tienda y quieres saber cuáles son tus mejores vendedores:

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
-- Paso 1: Consulta básica
SELECT nombre, apellido, ventas_totales  -- Solo queremos ver estos campos
FROM vendedores;                         -- De la tabla vendedores

-- Paso 2: Agregamos condiciones
SELECT nombre, apellido, ventas_totales  
FROM vendedores
WHERE ventas_totales > 100000;          -- Solo los que vendieron más de 100k

-- Paso 3: Ordenamos los resultados
SELECT nombre, apellido, ventas_totales
FROM vendedores
WHERE ventas_totales > 100000
ORDER BY ventas_totales DESC;           -- De mayor a menor

-- Paso 4: Limitamos los resultados
SELECT nombre, apellido, ventas_totales
FROM vendedores
WHERE ventas_totales > 100000
ORDER BY ventas_totales DESC
LIMIT 5;                                -- Solo los top 5
```

## Conceptos Clave que Debes Dominar

### 1. Claves Primarias (Primary Keys)
Es como el DNI de cada registro: único e irrepetible.

### 2. Claves Foráneas (Foreign Keys)
Son las "referencias" que conectan una tabla con otra, como un hilo invisible que mantiene todo organizado.

### 3. Índices
Son como el índice de un libro: te ayudan a encontrar información más rápido.

## Próximos Pasos

En el siguiente módulo vamos a profundizar en los comandos DDL y aprenderemos sobre tipos de datos y restricciones. ¡Prepárate porque vamos a construir bases de datos como un profesional!

---

**Recuerda:** SQL es como aprender a conducir. Al principio puede parecer complicado, pero una vez que entiendes los fundamentos, se vuelve natural. ¡La práctica hace al maestro!
