# 09 - Instalación de MongoDB en Ubuntu y Configuración de Atlas

## Guía Paso a Paso: MongoDB Community Edition en Ubuntu

### Prerrequisitos
- Ubuntu 18.04 LTS o superior
- Acceso sudo/root
- Conexión a internet estable
- Al menos 2GB de RAM disponible

### Paso 1: Actualizar el Sistema

```bash
# Actualizar la lista de paquetes
sudo apt update

# Actualizar el sistema (opcional pero recomendado)
sudo apt upgrade -y
```

### Paso 2: Instalar Dependencias Necesarias

```bash
# Instalar curl y gnupg para descargar e importar claves
sudo apt install curl gnupg -y

# Verificar instalación
curl --version
```

### Paso 3: Importar la Clave Pública de MongoDB

```bash
# Importar la clave GPG oficial de MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Verificar que la clave se importó correctamente
sudo gpg --list-keys --keyring /usr/share/keyrings/mongodb-server-7.0.gpg
```

### Paso 4: Agregar el Repositorio de MongoDB

```bash
# Para Ubuntu 22.04 (Jammy)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Para Ubuntu 20.04 (Focal)
# echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Para Ubuntu 18.04 (Bionic)
# echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

### Paso 5: Actualizar la Lista de Paquetes

```bash
# Actualizar con el nuevo repositorio
sudo apt update
```

### Paso 6: Instalar MongoDB

```bash
# Instalar la versión más reciente de MongoDB
sudo apt install mongodb-org -y

# Verificar la instalación
mongod --version
mongo --version  # Cliente MongoDB (mongosh en versiones más recientes)
```

### Paso 7: Configurar MongoDB como Servicio

```bash
# Habilitar MongoDB para que inicie automáticamente
sudo systemctl enable mongod

# Iniciar el servicio de MongoDB
sudo systemctl start mongod

# Verificar el estado del servicio
sudo systemctl status mongod
```

**Salida esperada:**
```
● mongod.service - MongoDB Database Server
     Loaded: loaded (/lib/systemd/system/mongod.service; enabled; vendor preset: enabled)
     Active: active (running) since [fecha] [hora]
```

### Paso 8: Verificar la Instalación

```bash
# Conectarse a MongoDB usando mongosh (MongoDB Shell)
mongosh

# Una vez dentro del shell de MongoDB, ejecutar:
# show dbs
# use test
# db.testCollection.insertOne({mensaje: "¡MongoDB funciona!"})
# db.testCollection.find()
# exit
```

### Paso 9: Configuración Básica de Seguridad

#### Crear Usuario Administrador

```bash
# Conectarse a MongoDB
mongosh

# Cambiar a la base de datos admin
use admin

# Crear usuario administrador
db.createUser({
  user: "admin",
  pwd: "tu_contraseña_segura",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})

# Salir del shell
exit
```

#### Habilitar Autenticación

```bash
# Editar el archivo de configuración
sudo nano /etc/mongod.conf

# Buscar la sección security y descomentarla/agregarla:
# security:
#   authorization: enabled

# Reiniciar MongoDB para aplicar cambios
sudo systemctl restart mongod

# Verificar que funciona con autenticación
mongosh -u admin -p tu_contraseña_segura --authenticationDatabase admin
```

### Paso 10: Comandos Útiles de Administración

```bash
# Iniciar MongoDB
sudo systemctl start mongod

# Detener MongoDB
sudo systemctl stop mongod

# Reiniciar MongoDB
sudo systemctl restart mongod

# Ver logs de MongoDB
sudo journalctl -u mongod -f

# Ver archivos de configuración
cat /etc/mongod.conf

# Ubicación de datos por defecto
ls -la /var/lib/mongodb/

# Ubicación de logs por defecto
ls -la /var/log/mongodb/
```

### Solución de Problemas Comunes

#### Error: "Failed to start mongod.service"

```bash
# Verificar permisos de directorios
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb

# Verificar configuración
sudo mongod --config /etc/mongod.conf --fork

# Ver logs detallados
sudo tail -f /var/log/mongodb/mongod.log
```

#### Error: "Connection refused"

```bash
# Verificar que el servicio esté corriendo
sudo systemctl status mongod

# Verificar puertos en uso
sudo netstat -tulpn | grep :27017

# Reiniciar el servicio
sudo systemctl restart mongod
```

---

## MongoDB Atlas: Base de Datos en la Nube

### ¿Qué es MongoDB Atlas?

MongoDB Atlas es la plataforma de base de datos como servicio (DBaaS) oficial de MongoDB. Ofrece:

- **Gestión automática**: Backup, actualizaciones, monitoreo
- **Escalabilidad**: Desde clusters gratuitos hasta enterprise
- **Seguridad**: Encriptación, VPC, auditoría
- **Global**: Múltiples regiones y proveedores cloud
- **Herramientas integradas**: Compass, Charts, Realm

### Paso 1: Crear Cuenta en MongoDB Atlas

1. **Visitar el sitio web**
   - Ir a [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Hacer clic en "Try Free"

2. **Registro**
   - Completar formulario con email, nombre, apellido
   - Crear contraseña segura
   - Aceptar términos y condiciones
   - Verificar email

3. **Configuración inicial**
   - Seleccionar "I'm learning MongoDB"
   - Elegir lenguaje de programación preferido
   - Seleccionar caso de uso

### Paso 2: Crear tu Primer Cluster

#### Configuración del Cluster Gratuito (M0)

1. **Seleccionar plan**
   - Elegir "M0 Sandbox" (Gratis)
   - Incluye: 512 MB de almacenamiento, conexiones compartidas

2. **Configurar proveedor y región**
   ```
   Cloud Provider: AWS, Google Cloud, o Azure
   Region: Seleccionar la más cercana (ej: us-east-1, sa-east-1)
   ```

3. **Nombrar el cluster**
   ```
   Cluster Name: MiPrimerCluster (o el nombre que prefieras)
   ```

4. **Crear cluster**
   - Hacer clic en "Create Cluster"
   - Esperar 1-3 minutos para el aprovisionamiento

### Paso 3: Configurar Seguridad

#### Crear Usuario de Base de Datos

1. **Ir a Database Access**
   - En el menú lateral: "Security" → "Database Access"
   - Hacer clic en "Add New Database User"

2. **Configurar usuario**
   ```
   Authentication Method: Password
   Username: miusuario
   Password: [Generar contraseña segura o crear una propia]
   Database User Privileges: Read and write to any database
   ```

3. **Guardar usuario**
   - Hacer clic en "Add User"
   - **¡IMPORTANTE!** Guardar las credenciales de forma segura

#### Configurar Acceso de Red

1. **Ir a Network Access**
   - En el menú lateral: "Security" → "Network Access"
   - Hacer clic en "Add IP Address"

2. **Opciones de configuración**
   ```
   Para desarrollo local:
   - "Add Current IP Address" (recomendado para pruebas)
   
   Para acceso desde cualquier lugar:
   - "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ Solo para desarrollo, NO para producción
   ```

3. **Confirmar configuración**
   - Agregar comentario descriptivo
   - Hacer clic en "Confirm"

### Paso 4: Conectarse al Cluster

#### Obtener String de Conexión

1. **Ir a Clusters**
   - En el menú lateral: "Deployment" → "Database"
   - Hacer clic en "Connect" en tu cluster

2. **Seleccionar método de conexión**
   - "Connect your application"
   - Driver: Node.js (o el que uses)
   - Version: 4.1 or later

3. **Copiar string de conexión**
   ```
   mongodb+srv://miusuario:<password>@miprimercluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### Conectarse desde Terminal Local

```bash
# Instalar MongoDB Shell (mongosh) si no lo tienes
# Ubuntu/Debian:
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install mongodb-mongosh

# Conectarse a Atlas
mongosh "mongodb+srv://miprimercluster.xxxxx.mongodb.net/" --username miusuario
```

#### Conectarse desde MongoDB Compass

1. **Descargar MongoDB Compass**
   - Ir a [https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass)
   - Descargar para Ubuntu (.deb)

2. **Instalar Compass**
   ```bash
   # Instalar el archivo .deb descargado
   sudo dpkg -i mongodb-compass_*.deb
   
   # Si hay dependencias faltantes
   sudo apt install -f
   ```

3. **Conectarse**
   - Abrir MongoDB Compass
   - Pegar el string de conexión
   - Reemplazar `<password>` con tu contraseña real
   - Hacer clic en "Connect"

### Paso 5: Primeras Operaciones en Atlas

#### Crear Base de Datos y Colección

```javascript
// En mongosh conectado a Atlas
use tienda_online

// Crear colección de productos
db.productos.insertOne({
  nombre: "Laptop Gaming",
  precio: 1500000,
  categoria: "electrónicos",
  stock: 10,
  especificaciones: {
    procesador: "Intel i7",
    ram: "16GB",
    almacenamiento: "512GB SSD"
  },
  tags: ["gaming", "laptop", "alta-gama"],
  fecha_agregado: new Date()
})

// Verificar inserción
db.productos.find().pretty()
```

#### Operaciones Básicas

```javascript
// Insertar múltiples productos
db.productos.insertMany([
  {
    nombre: "Mouse Gaming",
    precio: 150000,
    categoria: "accesorios",
    stock: 25
  },
  {
    nombre: "Teclado Mecánico",
    precio: 300000,
    categoria: "accesorios",
    stock: 15
  }
])

// Consultas
db.productos.find({categoria: "accesorios"})
db.productos.find({precio: {$gte: 200000}})

// Actualizar
db.productos.updateOne(
  {nombre: "Mouse Gaming"},
  {$set: {precio: 140000, descuento: 0.1}}
)

// Agregar índice
db.productos.createIndex({categoria: 1, precio: -1})
```

### Paso 6: Monitoreo y Administración en Atlas

#### Panel de Control

1. **Métricas en tiempo real**
   - Connections, Operations, Network
   - Query performance, Index usage
   - Storage y Memory utilization

2. **Alertas personalizadas**
   - Configurar alertas por email/SMS
   - Umbrales de conexiones, latencia, errores

3. **Profiler de consultas**
   - Identificar consultas lentas
   - Sugerencias de optimización
   - Análisis de índices

#### Backup Automático

```
Atlas M0 (Gratis): No incluye backup automático
Atlas M2+: Backup continuo con point-in-time recovery
```

Para clusters pagos:
- Backup cada 6 horas por defecto
- Retención configurable (días/semanas/meses)
- Restauración a cualquier punto en el tiempo

### Paso 7: Mejores Prácticas para Atlas

#### Seguridad

```javascript
// 1. Usar roles específicos por aplicación
db.createUser({
  user: "app_readonly",
  pwd: "contraseña_segura",
  roles: [
    { role: "read", db: "tienda_online" }
  ]
})

// 2. Crear usuarios por entorno
db.createUser({
  user: "dev_user",
  pwd: "dev_password",
  roles: [
    { role: "readWrite", db: "tienda_dev" }
  ]
})
```

#### Optimización

```javascript
// 1. Crear índices apropiados
db.productos.createIndex({categoria: 1, precio: -1})
db.usuarios.createIndex({email: 1}, {unique: true})

// 2. Usar proyecciones para reducir transferencia
db.productos.find(
  {categoria: "electrónicos"},
  {nombre: 1, precio: 1, _id: 0}
)

// 3. Limitar resultados grandes
db.productos.find().limit(20).sort({fecha_agregado: -1})
```

#### Monitoreo

1. **Configurar alertas críticas**
   - Conexiones > 80% del límite
   - Latencia de consultas > 100ms
   - Uso de CPU > 80%

2. **Revisar Performance Advisor**
   - Sugerencias de índices semanalmente
   - Análisis de consultas lentas
   - Optimizaciones recomendadas

### Comparación: Local vs Atlas

| Aspecto | MongoDB Local | MongoDB Atlas |
|---------|---------------|---------------|
| **Costo** | Gratis (hardware propio) | Gratis (M0) / Pago (M2+) |
| **Administración** | Manual completa | Automática |
| **Backup** | Manual | Automático |
| **Escalabilidad** | Limitada por hardware | Ilimitada |
| **Seguridad** | Configuración manual | Enterprise por defecto |
| **Monitoreo** | Herramientas externas | Integrado |
| **Actualizaciones** | Manuales | Automáticas |
| **Disponibilidad** | Depende de tu infraestructura | 99.995% SLA |

### Cuándo Usar Cada Opción

#### MongoDB Local (Desarrollo)
- ✅ Aprendizaje y experimentación
- ✅ Desarrollo sin conexión a internet
- ✅ Control total sobre configuración
- ✅ Sin límites de transferencia de datos

#### MongoDB Atlas (Producción/Desarrollo)
- ✅ Aplicaciones en producción
- ✅ Equipos distribuidos
- ✅ Necesidad de alta disponibilidad
- ✅ Escalabilidad automática
- ✅ Backup y recuperación empresarial

## Ejercicios Prácticos

### Ejercicio 1: Configuración Completa Local

1. Instalar MongoDB siguiendo los pasos anteriores
2. Crear una base de datos `biblioteca`
3. Insertar 10 libros con estructura compleja
4. Crear índices apropiados
5. Configurar usuario con permisos limitados

### Ejercicio 2: Migración Local a Atlas

1. Exportar datos de MongoDB local usando `mongodump`
2. Crear cluster en Atlas
3. Importar datos usando `mongorestore`
4. Verificar integridad de datos
5. Configurar aplicación para usar Atlas

### Ejercicio 3: Monitoreo y Optimización

1. Crear dataset de 1000+ documentos
2. Ejecutar consultas sin índices
3. Analizar performance en Atlas
4. Crear índices basados en recomendaciones
5. Comparar métricas antes/después

---

## Recursos Adicionales

### Documentación Oficial
- [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Shell (mongosh)](https://docs.mongodb.com/mongodb-shell/)

### Herramientas Útiles
- **MongoDB Compass**: GUI oficial para MongoDB
- **Studio 3T**: Cliente MongoDB avanzado (comercial)
- **Robo 3T**: Cliente MongoDB gratuito
- **MongoDB Charts**: Visualización de datos

### Comandos de Referencia Rápida

```bash
# Servicios MongoDB Local
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod
sudo systemctl status mongod

# Conexiones
mongosh                                    # Local
mongosh "mongodb+srv://cluster.xxx.net/"  # Atlas

# Backup y Restore
mongodump --db mibase --out /backup/
mongorestore --db mibase /backup/mibase/

# Importar/Exportar JSON
mongoimport --db mibase --collection micol --file datos.json
mongoexport --db mibase --collection micol --out datos.json
```

### Próximos Pasos Recomendados

1. **Practicar con ambos entornos** (local y Atlas)
2. **Explorar MongoDB Compass** para visualización
3. **Configurar aplicación real** conectada a Atlas
4. **Implementar estrategias de backup**
5. **Estudiar patrones de diseño** específicos de MongoDB
6. **Explorar agregaciones avanzadas** y pipelines
7. **Configurar monitoreo** y alertas en producción

¡Con esta guía tienes todo lo necesario para comenzar tu journey con MongoDB tanto local como en la nube!
