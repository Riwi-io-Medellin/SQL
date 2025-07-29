# Ejercicio: Poblado Masivo y Dump de una Base de Datos MySQL

## Objetivo
1. Comprender los métodos de inserción masiva de datos en MySQL.
2. Practicar la generación de grandes volúmenes de datos ficticios.
3. Realizar un volcado (dump) completo de la base y verificar su integridad.

## Requisitos previos
- MySQL ≥ 8.0 instalado y en ejecución.
- Usuario con privilegios para crear bases y tablas (`CREATE`, `INSERT`, `LOCK TABLES`, `SELECT`).
- Acceso a consola (`mysql`, `mysqldump`).
- Python ≥ 3.8 y paquete `faker` (solo para generar un CSV de ejemplo). Instalar: `pip install faker`.

---

## Paso 1  Crear base de datos y tabla
```bash
mysql -u root -p
```
```sql
-- 1.1 Crear la base
drop database if exists empresa_demo;
create database empresa_demo;
use empresa_demo;

-- 1.2 Crear tabla principal
CREATE TABLE empleados (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre       VARCHAR(60)  NOT NULL,
    apellido     VARCHAR(60)  NOT NULL,
    departamento VARCHAR(40)  NOT NULL,
    edad         TINYINT      NOT NULL,
    salario      DECIMAL(10,2) NOT NULL,
    fecha_ingreso DATE         NOT NULL
) ENGINE=InnoDB;
```
**¿Por qué InnoDB?**
- Soporta transacciones y `LOAD DATA INFILE` eficientemente.
- Usa _multiversion concurrency control_ (MVCC) para minimizar bloqueos.

---

## Paso 2  Generar datos ficticios (opción rápida con Python)
Generaremos un archivo `empleados.csv` con 1 000 000 registros.
```python
# generar_csv.py
from faker import Faker, random
fake = Faker('es_ES')
DEPARTAMENTOS = ["Ventas","TI","RRHH","Finanzas","Marketing"]
REGISTROS = 1_000_000

with open('empleados.csv', 'w', encoding='utf-8') as f:
    for _ in range(REGISTROS):
        nombre = fake.first_name()
        apellido = fake.last_name()
        depto = random.choice(DEPARTAMENTOS)
        edad = random.randint(20, 65)
        salario = random.randint(1200, 6000)
        fecha = fake.date_between(start_date='-15y', end_date='today')
        f.write(f"{nombre},{apellido},{depto},{edad},{salario},{fecha}\n")
```
Ejecuta:
```bash
python generar_csv.py
```
El archivo resultante pesa ≈ 100 MB.

### Alternativa con Node.js
Si prefieres JavaScript:
1. Inicializa el proyecto y agrega Faker:
   ```bash
   npm init -y
   npm install @faker-js/faker
   ```
2. Ejecuta el script `generar_csv.js` incluido en este repositorio:
   ```bash
   node generar_csv.js
   ```
   Esto creará el mismo `empleados.csv` con 1 000 000 de filas usando `@faker-js/faker`.

> El resto del flujo (`LOAD DATA INFILE`, dump, etc.) es idéntico.

---

## Paso 3  Inserción masiva con `LOAD DATA INFILE`
`LOAD DATA` es 10–20 × más rápido que múltiples `INSERT`.
```sql
-- Conectado a MySQL y dentro de empresa_demo
SET GLOBAL local_infile = 1;           -- habilitar si está desactivado

LOAD DATA LOCAL INFILE '/ruta/al/empleados.csv'
INTO TABLE empleados
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
(nombre, apellido, departamento, edad, salario, fecha_ingreso);
```
Tiempo estimado: < 1 minuto (según hardware).

### Alternativa: `INSERT` en lotes
Para comparar rendimiento:
```sql
START TRANSACTION;
INSERT INTO empleados (nombre,apellido,departamento,edad,salario,fecha_ingreso)
VALUES
  ('Ana','Rojas','TI',32,3500,'2020-02-10'),
  ... -- hasta ~1 000 filas por sentencia
;
COMMIT;
```
---

## Paso 4  Consultar y validar
```sql
SELECT COUNT(*) FROM empleados;           -- debe devolver 1000000
SELECT AVG(salario) FROM empleados;       -- prueba rápida
```

Índices adicionales (opcional):
```sql
ALTER TABLE empleados ADD INDEX idx_depto (departamento);
```

---

## Paso 5  Realizar el dump
La utilidad estándar es `mysqldump`.
```bash
mysqldump -u root -p \
          --single-transaction \
          --quick \
          --routines \
          empresa_demo > empresa_demo_dump.sql
```
Parámetros clave:
- `--single-transaction`: mantiene consistencia sin bloquear.
- `--quick`: stream línea a línea, menos RAM.
- `--routines`: incluye funciones/procedimientos si existieran.

Tamaño esperado del dump: ~250 MB (texto).

---

## Paso 6  Restaurar para verificar
```bash
mysql -u root -p -e "CREATE DATABASE empresa_demo_restored;"
mysql -u root -p empresa_demo_restored < empresa_demo_dump.sql
```
Comprueba:
```bash
mysql -u root -p -e "SELECT COUNT(*) FROM empresa_demo_restored.empleados;"
```

---

## Teoría resumida
| Técnica | Ventaja | Consideraciones |
|---------|---------|-----------------|
| `LOAD DATA INFILE` | Máximo rendimiento (≈50k filas/s) | Requiere acceso al sistema de archivos y ajuste de `local_infile`. |
| `INSERT` masivo | No necesita archivos intermedios | Mucho más lento; usar transacciones y lotes de ≤1k filas. |
| `mysqldump` | Herramienta oficial y portable | El volcado resultante es texto plano (puede ser grande). |
| Binlogs + réplica | Copias en caliente | Más complejo; fuera de alcance de este ejercicio. |

### Buenas prácticas
1. Desactiva índices y claves foráneas solo si vas a reconstruir después (`ALTER TABLE ... DISABLE KEYS`).
2. Usa `AUTOCOMMIT = 0` y confirma cada bloque para mejorar velocidad.
3. En dumps, usa `--single-transaction` y `--master-data` si necesitas consistencia con réplicas.

---

## Extra: Uso de DBeaver (GUI)

DBeaver es una herramienta gráfica muy popular para trabajar con bases de datos. A continuación se describen los pasos equivalentes:

### Crear la base y la tabla
1. Conéctate a tu servidor MySQL en DBeaver.
2. Haz clic derecho sobre el nodo del servidor → **Create → Database** y escribe `empresa_demo`.
3. En la nueva base, clic derecho → **SQL Editor** y ejecuta el script de creación de tabla mostrado en el Paso 1.

### Importar el CSV de manera masiva
1. Selecciona la tabla `empleados` → clic derecho **Import Data**.
2. Fuente: **CSV**. Selecciona `empleados.csv`.
3. Revisa el mapeo de columnas (DBeaver detecta separador `,` automáticamente).
4. Activa la opción **Use bulk insert** para mayor velocidad y finaliza el asistente.

> Consejo: Si el fichero está en tu máquina local pero el servidor MySQL está en otra, marca **Send file to server** para que DBeaver copie temporalmente el archivo y use `LOAD DATA`.

### Exportar/Dumpear la base
1. Clic derecho sobre la base `empresa_demo` → **Tools → Dump Database** (o **Backup** en versiones antiguas).
2. Marca **Structure and Data**, formato `SQL`, y habilita **Single transaction**.
3. Selecciona la ruta destino y ejecuta. El archivo generado es equivalente al de `mysqldump`.

### Restaurar
1. Crea (o selecciona) una base vacía.
2. Clic derecho → **Tools → Restore Database** y selecciona el dump generado.

---

## Conclusión
Has aprendido a:
- Generar datos ficticios masivamente.
- Poblar una tabla MySQL de forma eficiente con `LOAD DATA INFILE`.
- Crear un dump consistente con `mysqldump` y restaurarlo.

¡Experimenta variando el tamaño de los datos y midiendo el rendimiento entre técnicas!
