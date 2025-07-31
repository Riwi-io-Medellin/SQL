# Transacciones y Control de Acceso: El Arte de la Seguridad y Consistencia

¡Bienvenidos al módulo final! Aquí es donde aprendes a manejar SQL como un verdadero profesional. Las transacciones y el control de acceso son como tener un sistema de seguridad bancaria para tus datos.

## Transacciones: Todo o Nada

Las transacciones son como hacer una transferencia bancaria: o se completa toda la operación, o no se hace nada. No puedes tener situaciones donde se debite de una cuenta pero no se acredite en la otra.

### Propiedades ACID

Las transacciones deben cumplir con las propiedades ACID:

- **A**tomicidad: Todo o nada
- **C**onsistencia: Los datos siempre quedan en estado válido
- **I**solation: Las transacciones no se interfieren entre sí
- **D**urabilidad: Una vez confirmada, la transacción es permanente

### Transacciones Básicas

```sql
-- MySQL y PostgreSQL (sintaxis idéntica)
BEGIN;                                  -- Iniciar transacción
-- START TRANSACTION;                   -- Alternativa en MySQL

-- Operaciones que deben ejecutarse juntas
UPDATE productos 
SET stock = stock - 1 
WHERE id = 123;                         -- Reducir stock del producto

INSERT INTO ventas_detalle (producto_id, cantidad, precio_unitario)
VALUES (123, 1, 99.99);                 -- Registrar la venta

INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, fecha)
VALUES (123, 'VENTA', -1, NOW());       -- Registrar movimiento de inventario

COMMIT;                                 -- Confirmar todos los cambios
-- Si algo sale mal: ROLLBACK;          -- Deshacer todo
```

### Ejemplo Práctico: Transferencia de Inventario

```sql
-- Transferir productos entre almacenes
BEGIN;

-- Verificar que hay suficiente stock en almacén origen
SELECT stock INTO @stock_actual 
FROM inventario_almacen 
WHERE producto_id = 456 AND almacen_id = 1;

-- Si no hay suficiente stock, hacer ROLLBACK
-- En aplicación real, esto se validaría en el código

-- Reducir stock en almacén origen
UPDATE inventario_almacen 
SET stock = stock - 10,
    updated_at = CURRENT_TIMESTAMP
WHERE producto_id = 456 AND almacen_id = 1;

-- Aumentar stock en almacén destino
INSERT INTO inventario_almacen (producto_id, almacen_id, stock, updated_at)
VALUES (456, 2, 10, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE                 -- MySQL: si ya existe, actualizar
    stock = stock + 10,
    updated_at = CURRENT_TIMESTAMP;

-- PostgreSQL equivalente:
-- ON CONFLICT (producto_id, almacen_id) DO UPDATE SET
--     stock = inventario_almacen.stock + 10,
--     updated_at = CURRENT_TIMESTAMP;

-- Registrar el movimiento
INSERT INTO movimientos_inventario (producto_id, almacen_origen, almacen_destino, cantidad, tipo, fecha)
VALUES (456, 1, 2, 10, 'TRANSFERENCIA', CURRENT_TIMESTAMP);

COMMIT;                                 -- Todo salió bien, confirmar
```

### SAVEPOINT: Puntos de Control

```sql
-- Transacción compleja con puntos de control
BEGIN;

-- Operación 1: Crear pedido
INSERT INTO pedidos (cliente_id, fecha_pedido, estado)
VALUES (789, CURRENT_DATE, 'PROCESANDO');

SET @pedido_id = LAST_INSERT_ID();      -- MySQL: obtener ID del pedido
-- En PostgreSQL: usar RETURNING id INTO variable

SAVEPOINT sp_pedido_creado;             -- Punto de control 1

-- Operación 2: Agregar productos al pedido
INSERT INTO pedidos_detalle (pedido_id, producto_id, cantidad, precio_unitario)
VALUES 
    (@pedido_id, 100, 2, 50.00),
    (@pedido_id, 101, 1, 75.00);

SAVEPOINT sp_productos_agregados;       -- Punto de control 2

-- Operación 3: Actualizar inventario
UPDATE productos SET stock = stock - 2 WHERE id = 100;
UPDATE productos SET stock = stock - 1 WHERE id = 101;

-- Si algo sale mal en el inventario, volver al punto anterior
-- ROLLBACK TO SAVEPOINT sp_productos_agregados;

-- Operación 4: Calcular total del pedido
UPDATE pedidos 
SET total = (
    SELECT SUM(cantidad * precio_unitario)
    FROM pedidos_detalle 
    WHERE pedido_id = @pedido_id
)
WHERE id = @pedido_id;

COMMIT;                                 -- Confirmar toda la transacción
```

### Niveles de Aislamiento

Los niveles de aislamiento controlan qué tan "aisladas" están las transacciones entre sí.

```sql
-- Configurar nivel de aislamiento
-- MySQL
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- BEGIN ISOLATION LEVEL SERIALIZABLE;
```

#### Problemas de Concurrencia

1. **Dirty Read**: Leer datos no confirmados
2. **Non-Repeatable Read**: Leer diferentes valores en la misma transacción
3. **Phantom Read**: Aparecen nuevas filas entre lecturas

```sql
-- Ejemplo de problema de concurrencia
-- Transacción A:
BEGIN;
SELECT COUNT(*) FROM productos WHERE categoria_id = 1;  -- Resultado: 100
-- ... otras operaciones ...
SELECT COUNT(*) FROM productos WHERE categoria_id = 1;  -- Resultado: 101 (¡cambió!)
COMMIT;

-- Transacción B (ejecutándose al mismo tiempo):
BEGIN;
INSERT INTO productos (nombre, categoria_id, precio) VALUES ('Nuevo producto', 1, 99.99);
COMMIT;
```

## Control de Acceso (DCL)

El control de acceso es como tener un sistema de llaves maestras para tu base de datos.

### Gestión de Usuarios

```sql
-- MySQL: Crear usuarios
CREATE USER 'desarrollador'@'localhost' IDENTIFIED BY 'password_seguro';
CREATE USER 'analista'@'%' IDENTIFIED BY 'otro_password';  -- % = cualquier host
CREATE USER 'app_user'@'192.168.1.%' IDENTIFIED BY 'app_password';  -- Rango de IPs

-- PostgreSQL: Crear usuarios
CREATE USER desarrollador WITH PASSWORD 'password_seguro';
CREATE USER analista WITH PASSWORD 'otro_password';
CREATE USER app_user WITH PASSWORD 'app_password';
```

### Otorgar Permisos (GRANT)

```sql
-- Permisos básicos de lectura
-- MySQL
GRANT SELECT ON tienda.productos TO 'analista'@'%';
GRANT SELECT ON tienda.categorias TO 'analista'@'%';

-- PostgreSQL
GRANT SELECT ON productos TO analista;
GRANT SELECT ON categorias TO analista;

-- Permisos completos en una tabla
-- MySQL
GRANT SELECT, INSERT, UPDATE, DELETE ON tienda.pedidos TO 'desarrollador'@'localhost';

-- PostgreSQL
GRANT SELECT, INSERT, UPDATE, DELETE ON pedidos TO desarrollador;

-- Permisos en toda la base de datos
-- MySQL
GRANT ALL PRIVILEGES ON tienda.* TO 'admin'@'localhost';

-- PostgreSQL
GRANT ALL PRIVILEGES ON DATABASE tienda TO admin;
```

### Roles y Permisos Avanzados

```sql
-- PostgreSQL: Crear roles (grupos de permisos)
CREATE ROLE rol_lectura;
CREATE ROLE rol_ventas;
CREATE ROLE rol_administrador;

-- Asignar permisos a roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_lectura;
GRANT SELECT, INSERT, UPDATE ON pedidos, pedidos_detalle TO rol_ventas;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_administrador;

-- Asignar roles a usuarios
GRANT rol_lectura TO analista;
GRANT rol_ventas TO vendedor1, vendedor2;
GRANT rol_administrador TO admin;

-- MySQL 8.0+: Roles similares
CREATE ROLE 'rol_lectura';
GRANT SELECT ON tienda.* TO 'rol_lectura';
GRANT 'rol_lectura' TO 'analista'@'%';
```

### Revocar Permisos (REVOKE)

```sql
-- Quitar permisos específicos
-- MySQL
REVOKE INSERT ON tienda.productos FROM 'desarrollador'@'localhost';

-- PostgreSQL
REVOKE INSERT ON productos FROM desarrollador;

-- Quitar todos los permisos
-- MySQL
REVOKE ALL PRIVILEGES ON tienda.* FROM 'usuario_temporal'@'%';

-- PostgreSQL
REVOKE ALL PRIVILEGES ON DATABASE tienda FROM usuario_temporal;
```

### Auditoría y Seguridad

```sql
-- Ver permisos actuales
-- MySQL
SHOW GRANTS FOR 'analista'@'%';
SELECT * FROM mysql.user WHERE User = 'analista';

-- PostgreSQL
SELECT * FROM information_schema.role_table_grants WHERE grantee = 'analista';
\du  -- En psql: listar usuarios y roles
```

## Buenas Prácticas de Seguridad

### 1. Principio de Menor Privilegio

```sql
-- ❌ MAL: Dar permisos excesivos
GRANT ALL PRIVILEGES ON *.* TO 'app_user'@'%';

-- ✅ BIEN: Solo los permisos necesarios
GRANT SELECT, INSERT, UPDATE ON tienda.pedidos TO 'app_user'@'192.168.1.%';
GRANT SELECT ON tienda.productos TO 'app_user'@'192.168.1.%';
GRANT SELECT ON tienda.clientes TO 'app_user'@'192.168.1.%';
```

### 2. Usuarios Específicos por Aplicación

```sql
-- Crear usuarios específicos para cada propósito
CREATE USER 'app_web'@'web_server_ip' IDENTIFIED BY 'password_web';
CREATE USER 'app_mobile'@'mobile_server_ip' IDENTIFIED BY 'password_mobile';
CREATE USER 'backup_user'@'backup_server_ip' IDENTIFIED BY 'password_backup';
CREATE USER 'reporting_user'@'%' IDENTIFIED BY 'password_reports';

-- Permisos específicos para cada uno
GRANT SELECT, INSERT, UPDATE ON tienda.* TO 'app_web'@'web_server_ip';
GRANT SELECT ON tienda.* TO 'reporting_user'@'%';
GRANT SELECT, LOCK TABLES ON tienda.* TO 'backup_user'@'backup_server_ip';
```

### 3. Encriptación y Conexiones Seguras

```sql
-- MySQL: Requerir SSL
CREATE USER 'usuario_seguro'@'%' IDENTIFIED BY 'password' REQUIRE SSL;

-- Modificar usuario existente para requerir SSL
ALTER USER 'usuario_existente'@'%' REQUIRE SSL;

-- PostgreSQL: Configurar en pg_hba.conf
-- hostssl all usuario_seguro 0.0.0.0/0 md5
```

## Procedimientos Almacenados y Funciones

Los procedimientos almacenados son como tener programas mini dentro de tu base de datos.

### Procedimientos Almacenados Básicos

```sql
-- MySQL: Procedimiento para procesar venta
DELIMITER //
CREATE PROCEDURE ProcesarVenta(
    IN p_cliente_id INT,
    IN p_producto_id INT,
    IN p_cantidad INT,
    OUT p_pedido_id INT,
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_stock_actual INT;
    DECLARE v_precio DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensaje = 'Error en la transacción';
        SET p_pedido_id = 0;
    END;
    
    START TRANSACTION;
    
    -- Verificar stock
    SELECT stock, precio INTO v_stock_actual, v_precio
    FROM productos 
    WHERE id = p_producto_id AND activo = TRUE;
    
    IF v_stock_actual < p_cantidad THEN
        SET p_mensaje = 'Stock insuficiente';
        SET p_pedido_id = 0;
        ROLLBACK;
    ELSE
        -- Crear pedido
        INSERT INTO pedidos (cliente_id, fecha_pedido, estado, total)
        VALUES (p_cliente_id, NOW(), 'PROCESANDO', v_precio * p_cantidad);
        
        SET p_pedido_id = LAST_INSERT_ID();
        
        -- Agregar detalle
        INSERT INTO pedidos_detalle (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (p_pedido_id, p_producto_id, p_cantidad, v_precio);
        
        -- Actualizar stock
        UPDATE productos 
        SET stock = stock - p_cantidad 
        WHERE id = p_producto_id;
        
        SET p_mensaje = 'Venta procesada exitosamente';
        COMMIT;
    END IF;
END//
DELIMITER ;

-- Usar el procedimiento
CALL ProcesarVenta(123, 456, 2, @pedido_id, @mensaje);
SELECT @pedido_id, @mensaje;
```

```sql
-- PostgreSQL: Función equivalente
CREATE OR REPLACE FUNCTION procesar_venta(
    p_cliente_id INT,
    p_producto_id INT,
    p_cantidad INT,
    OUT p_pedido_id INT,
    OUT p_mensaje TEXT
) AS $$
DECLARE
    v_stock_actual INT;
    v_precio NUMERIC(10,2);
BEGIN
    -- Verificar stock
    SELECT stock, precio INTO v_stock_actual, v_precio
    FROM productos 
    WHERE id = p_producto_id AND activo = TRUE;
    
    IF v_stock_actual < p_cantidad THEN
        p_mensaje := 'Stock insuficiente';
        p_pedido_id := 0;
        RETURN;
    END IF;
    
    -- Crear pedido
    INSERT INTO pedidos (cliente_id, fecha_pedido, estado, total)
    VALUES (p_cliente_id, CURRENT_TIMESTAMP, 'PROCESANDO', v_precio * p_cantidad)
    RETURNING id INTO p_pedido_id;
    
    -- Agregar detalle
    INSERT INTO pedidos_detalle (pedido_id, producto_id, cantidad, precio_unitario)
    VALUES (p_pedido_id, p_producto_id, p_cantidad, v_precio);
    
    -- Actualizar stock
    UPDATE productos 
    SET stock = stock - p_cantidad 
    WHERE id = p_producto_id;
    
    p_mensaje := 'Venta procesada exitosamente';
    
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje := 'Error en la transacción: ' || SQLERRM;
        p_pedido_id := 0;
END;
$$ LANGUAGE plpgsql;

-- Usar la función
SELECT * FROM procesar_venta(123, 456, 2);
```

### Triggers: Automatización Inteligente

Los triggers son como tener asistentes automáticos que ejecutan acciones cuando suceden eventos específicos.

```sql
-- MySQL: Trigger para auditoría
DELIMITER //
CREATE TRIGGER tr_productos_auditoria
    AFTER UPDATE ON productos
    FOR EACH ROW
BEGIN
    IF OLD.precio != NEW.precio THEN
        INSERT INTO auditoria_precios (
            producto_id, 
            precio_anterior, 
            precio_nuevo, 
            usuario, 
            fecha_cambio
        ) VALUES (
            NEW.id, 
            OLD.precio, 
            NEW.precio, 
            USER(), 
            NOW()
        );
    END IF;
END//
DELIMITER ;

-- PostgreSQL: Trigger equivalente
CREATE OR REPLACE FUNCTION auditoria_precios_func()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.precio != NEW.precio THEN
        INSERT INTO auditoria_precios (
            producto_id, 
            precio_anterior, 
            precio_nuevo, 
            usuario, 
            fecha_cambio
        ) VALUES (
            NEW.id, 
            OLD.precio, 
            NEW.precio, 
            current_user, 
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_productos_auditoria
    AFTER UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION auditoria_precios_func();
```

## Backup y Recuperación

### Estrategias de Backup

```sql
-- MySQL: Backup completo
-- mysqldump -u root -p --single-transaction --routines --triggers tienda > backup_tienda.sql

-- Backup de estructura solamente
-- mysqldump -u root -p --no-data tienda > estructura_tienda.sql

-- Backup de datos solamente
-- mysqldump -u root -p --no-create-info tienda > datos_tienda.sql

-- PostgreSQL: Backup completo
-- pg_dump -U postgres -h localhost -d tienda > backup_tienda.sql

-- Backup comprimido
-- pg_dump -U postgres -h localhost -d tienda | gzip > backup_tienda.sql.gz
```

### Restauración

```sql
-- MySQL: Restaurar backup
-- mysql -u root -p tienda < backup_tienda.sql

-- PostgreSQL: Restaurar backup
-- psql -U postgres -h localhost -d tienda < backup_tienda.sql
```

### Backup Incremental y Point-in-Time Recovery

```sql
-- MySQL: Habilitar binary log para recovery point-in-time
-- En my.cnf:
-- log-bin=mysql-bin
-- binlog-format=ROW

-- PostgreSQL: Configurar archiving
-- En postgresql.conf:
-- wal_level = replica
-- archive_mode = on
-- archive_command = 'cp %p /path/to/archive/%f'
```

## Monitoreo y Mantenimiento

### Consultas de Monitoreo

```sql
-- MySQL: Monitorear conexiones activas
SELECT 
    ID,
    USER,
    HOST,
    DB,
    COMMAND,
    TIME,
    STATE,
    LEFT(INFO, 100) AS QUERY_PREVIEW
FROM INFORMATION_SCHEMA.PROCESSLIST
WHERE COMMAND != 'Sleep'
ORDER BY TIME DESC;

-- PostgreSQL: Monitorear actividad
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    LEFT(query, 100) AS query_preview
FROM pg_stat_activity
WHERE state = 'active'
  AND pid != pg_backend_pid()
ORDER BY query_start;
```

### Estadísticas de Rendimiento

```sql
-- MySQL: Estadísticas de tablas
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    AVG_ROW_LENGTH,
    DATA_LENGTH / 1024 / 1024 AS 'Data MB',
    INDEX_LENGTH / 1024 / 1024 AS 'Index MB'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'tienda'
ORDER BY DATA_LENGTH DESC;

-- PostgreSQL: Estadísticas de uso
SELECT 
    schemaname,
    tablename,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows
FROM pg_stat_user_tables
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
```

## Mejores Prácticas Finales

### 1. Nomenclatura Consistente

```sql
-- ✅ BUENAS PRÁCTICAS:
-- Tablas: plural, snake_case
CREATE TABLE usuarios_perfiles (id, usuario_id, perfil_id);

-- Columnas: singular, snake_case
ALTER TABLE productos ADD COLUMN fecha_creacion TIMESTAMP;

-- Índices: prefijo descriptivo
CREATE INDEX idx_productos_categoria_activo ON productos(categoria_id, activo);

-- Constraints: prefijo descriptivo
ALTER TABLE pedidos ADD CONSTRAINT fk_pedidos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id);
```

### 2. Documentación en el Código

```sql
-- Documentar procedimientos complejos
/*
Procedimiento: CalcularComisiones
Propósito: Calcular comisiones mensuales para vendedores
Parámetros: 
  - p_mes: Mes a calcular (1-12)
  - p_año: Año a calcular
Autor: Equipo Desarrollo
Fecha: 2024-01-15
Última modificación: 2024-01-20
*/
CREATE PROCEDURE CalcularComisiones(IN p_mes INT, IN p_año INT)
BEGIN
    -- Lógica del procedimiento...
END;
```

### 3. Control de Versiones para Schema

```sql
-- Crear tabla de versiones de schema
CREATE TABLE schema_versions (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100)
);

-- Registrar cambios
INSERT INTO schema_versions (version, description, applied_by)
VALUES ('1.2.3', 'Agregar tabla auditoria_precios', USER());
```

### 4. Configuración de Seguridad

```sql
-- Configuraciones recomendadas de seguridad
-- MySQL (en my.cnf):
-- bind-address = 127.0.0.1
-- skip-networking = false
-- ssl-ca = /path/to/ca.pem
-- ssl-cert = /path/to/server-cert.pem
-- ssl-key = /path/to/server-key.pem

-- PostgreSQL (en postgresql.conf):
-- listen_addresses = 'localhost'
-- ssl = on
-- ssl_cert_file = 'server.crt'
-- ssl_key_file = 'server.key'
-- ssl_ca_file = 'ca.crt'
```

## Conclusión: El Camino del Maestro SQL

¡Felicitaciones! Has completado un viaje increíble por el mundo de SQL. Desde los conceptos básicos hasta las técnicas más avanzadas, ahora tienes las herramientas para:

- **Diseñar** bases de datos robustas y eficientes
- **Manipular** datos con precisión y seguridad
- **Optimizar** consultas para máximo rendimiento
- **Asegurar** la integridad y seguridad de los datos
- **Mantener** sistemas de bases de datos profesionales

### Tu Próximo Nivel

Para seguir creciendo como profesional de bases de datos:

1. **Practica constantemente** con proyectos reales
2. **Mantente actualizado** con nuevas versiones y características
3. **Aprende sobre NoSQL** para complementar tus habilidades relacionales
4. **Estudia arquitecturas distribuidas** y sharding
5. **Profundiza en administración** de bases de datos (DBA)

---

**Recuerda:** SQL es como un instrumento musical: la teoría te da la base, pero solo la práctica constante te convierte en un virtuoso. ¡Sigue practicando y nunca dejes de aprender!

**¡Que la fuerza de SQL te acompañe en todos tus proyectos!** 🚀
