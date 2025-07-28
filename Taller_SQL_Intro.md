# 🧪 Taller Práctico: Introducción a SQL  
**Consultas, Agregaciones y Agrupación de Datos**

---

## 1. Crear la base de datos

```sql
CREATE DATABASE IF NOT EXISTS empleadosdb;
USE empleadosdb;
```

---

## 2. Crear la tabla `empleados`

```sql
CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    edad INT,
    salario DECIMAL(12,2),
    departamento VARCHAR(50)
);
```

---

## 3. Insertar datos de ejemplo

```sql
INSERT INTO empleados (nombre, edad, salario, departamento) VALUES
('Ana Torres', 30, 4500000, 'TI'),
('Luis Gómez', 25, 3000000, 'Ventas'),
('Carlos Ruiz', 40, 5200000, 'TI'),
('Marta López', 35, 3500000, 'Ventas'),
('Julián Sánchez', 29, 2800000, 'Marketing'),
('Paula Pérez', 45, 6000000, 'Gerencia'),
('Camila Díaz', 26, 3000000, NULL),
('Juan Rodríguez', 38, 4100000, 'TI'),
('Laura Jiménez', 32, 3900000, 'Marketing'),
('Pedro Castillo', 28, 3100000, 'Ventas'),
('Lucía Ríos', 31, 4800000, 'TI'),
('Esteban Vargas', 42, 2950000, 'Recursos Humanos'),
('Natalia Giraldo', 27, 3150000, 'TI'),
('Sofía Herrera', 36, 4100000, 'Gerencia'),
('Samuel Patiño', 33, 2700000, 'Marketing'),
('Daniela Cardona', 30, 3300000, 'Ventas');
```

---

## 4. Consultas básicas

### 4.1 Mostrar nombre y salario

```sql
SELECT nombre, salario FROM empleados;
```

### 4.2 Empleados con salario > $3,000,000

```sql
SELECT * FROM empleados WHERE salario > 3000000;
```

---

## 5. Filtros y orden

### 5.1 Orden por edad (menor a mayor)

```sql
SELECT * FROM empleados ORDER BY edad ASC;
```

### 5.2 Empleados en TI o Ventas

```sql
SELECT * FROM empleados WHERE departamento IN ('TI', 'Ventas');
```

### 5.3 Nombre que empieza con "A"

```sql
SELECT * FROM empleados WHERE nombre LIKE 'A%';
```

### 5.4 Empleados sin departamento

```sql
SELECT * FROM empleados WHERE departamento IS NULL;
```

---

## 6. Funciones de agregación

### 6.1 Salario promedio

```sql
SELECT AVG(salario) AS salario_promedio FROM empleados;
```

### 6.2 Salario máximo y mínimo

```sql
SELECT MAX(salario) AS salario_maximo, MIN(salario) AS salario_minimo FROM empleados;
```

### 6.3 Total de empleados

```sql
SELECT COUNT(*) AS total_empleados FROM empleados;
```

---

## 7. Agrupación y filtrado por grupos

### 7.1 Edad promedio por departamento

```sql
SELECT departamento, AVG(edad) AS edad_promedio
FROM empleados
GROUP BY departamento;
```

### 7.2 Departamentos con más de 3 empleados

```sql
SELECT departamento, COUNT(*) AS cantidad
FROM empleados
GROUP BY departamento
HAVING COUNT(*) > 3;
```

---

## 8. Función adicional: Redondear promedio

```sql
SELECT ROUND(AVG(salario), 2) AS salario_promedio_redondeado FROM empleados;
```

---

## ✅ Recomendación final

Importa un archivo `empleados_100.csv` con más datos y prueba estos ejercicios usando **MySQL Workbench** o consola SQL.
