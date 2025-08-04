# 08 - Bases de Datos No Relacionales (NoSQL)

## Introducción a las Bases de Datos No Relacionales

Las bases de datos no relacionales, comúnmente conocidas como **NoSQL** (Not Only SQL), surgieron como respuesta a las limitaciones de las bases de datos relacionales tradicionales en el manejo de grandes volúmenes de datos, escalabilidad horizontal y flexibilidad de esquemas.

### ¿Por qué NoSQL?

**Limitaciones de SQL tradicional:**
- Escalabilidad vertical limitada
- Esquemas rígidos difíciles de modificar
- Complejidad en sistemas distribuidos
- Rendimiento en consultas complejas con grandes volúmenes

**Ventajas de NoSQL:**
- Escalabilidad horizontal nativa
- Esquemas flexibles o sin esquema
- Alto rendimiento en operaciones específicas
- Mejor manejo de datos no estructurados
- Diseño distribuido desde el origen

## Tipos de Bases de Datos No Relacionales

### 1. **Bases de Datos de Documentos**
Almacenan datos en documentos similares a JSON, BSON o XML.

**Características:**
- Estructura flexible y anidada
- Consultas ricas sobre el contenido del documento
- Ideal para aplicaciones web y móviles

**Ejemplos:** MongoDB, CouchDB, Amazon DocumentDB

### 2. **Bases de Datos Clave-Valor**
Almacenan datos como pares clave-valor simples.

**Características:**
- Modelo más simple de NoSQL
- Extremadamente rápidas para operaciones básicas
- Ideal para cachés y sesiones

**Ejemplos:** Redis, Amazon DynamoDB, Riak

### 3. **Bases de Datos de Columnas**
Almacenan datos en familias de columnas en lugar de filas.

**Características:**
- Optimizadas para consultas analíticas
- Compresión eficiente
- Ideal para Big Data y análisis

**Ejemplos:** Cassandra, HBase, Amazon Redshift

### 4. **Bases de Datos de Grafos**
Almacenan datos como nodos y relaciones (aristas).

**Características:**
- Optimizadas para relaciones complejas
- Consultas de traversal eficientes
- Ideal para redes sociales y recomendaciones

**Ejemplos:** Neo4j, Amazon Neptune, ArangoDB

## MongoDB: Enfoque Principal

### ¿Qué es MongoDB?

MongoDB es una base de datos de documentos de código abierto que utiliza un modelo de datos flexible basado en documentos BSON (Binary JSON). Es una de las bases de datos NoSQL más populares del mundo.

### Características Principales

#### 1. **Modelo de Documentos**
```javascript
// Ejemplo de documento en MongoDB
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "nombre": "Juan Pérez",
  "edad": 30,
  "email": "juan@email.com",
  "direcciones": [
    {
      "tipo": "casa",
      "ciudad": "Medellín",
      "codigo_postal": "050001"
    },
    {
      "tipo": "trabajo",
      "ciudad": "Bogotá",
      "codigo_postal": "110111"
    }
  ],
  "hobbies": ["programación", "lectura", "ciclismo"],
  "activo": true,
  "fecha_registro": ISODate("2023-01-15T10:30:00Z")
}
```

#### 2. **Esquema Flexible**
- No requiere definición previa de estructura
- Documentos en la misma colección pueden tener diferentes campos
- Evolución natural del esquema sin migraciones complejas

#### 3. **Escalabilidad Horizontal**
- **Sharding**: Distribución automática de datos
- **Replica Sets**: Alta disponibilidad y redundancia
- **Load Balancing**: Distribución de carga automática

### Conceptos Fundamentales

#### Comparación con SQL

| SQL | MongoDB |
|-----|---------|
| Base de Datos | Base de Datos |
| Tabla | Colección |
| Fila/Registro | Documento |
| Columna | Campo |
| Índice | Índice |
| JOIN | Embedding/Linking |
| Clave Primaria | _id (automático) |

#### Estructura Jerárquica
```
Base de Datos
├── Colección 1
│   ├── Documento 1
│   ├── Documento 2
│   └── Documento N
├── Colección 2
│   └── Documentos...
└── Colección N
```

### Operaciones CRUD en MongoDB

#### 1. **Create (Insertar)**
```javascript
// Insertar un documento
db.usuarios.insertOne({
  nombre: "Ana García",
  edad: 28,
  email: "ana@email.com"
});

// Insertar múltiples documentos
db.usuarios.insertMany([
  {nombre: "Carlos", edad: 35},
  {nombre: "María", edad: 42}
]);
```

#### 2. **Read (Consultar)**
```javascript
// Buscar todos los documentos
db.usuarios.find();

// Buscar con filtros
db.usuarios.find({edad: {$gte: 30}});

// Buscar uno específico
db.usuarios.findOne({email: "ana@email.com"});

// Proyección (seleccionar campos específicos)
db.usuarios.find({}, {nombre: 1, email: 1, _id: 0});
```

#### 3. **Update (Actualizar)**
```javascript
// Actualizar un documento
db.usuarios.updateOne(
  {email: "ana@email.com"},
  {$set: {edad: 29}}
);

// Actualizar múltiples documentos
db.usuarios.updateMany(
  {edad: {$lt: 30}},
  {$set: {categoria: "joven"}}
);
```

#### 4. **Delete (Eliminar)**
```javascript
// Eliminar un documento
db.usuarios.deleteOne({email: "ana@email.com"});

// Eliminar múltiples documentos
db.usuarios.deleteMany({activo: false});
```

### Operadores de Consulta

#### Operadores de Comparación
```javascript
// Igualdad
db.productos.find({precio: 100});

// Mayor que
db.productos.find({precio: {$gt: 50}});

// Menor o igual que
db.productos.find({precio: {$lte: 200}});

// En un conjunto de valores
db.productos.find({categoria: {$in: ["electrónicos", "ropa"]}});

// No en un conjunto
db.productos.find({categoria: {$nin: ["descontinuado"]}});
```

#### Operadores Lógicos
```javascript
// AND implícito
db.productos.find({precio: {$gt: 50}, categoria: "electrónicos"});

// OR explícito
db.productos.find({
  $or: [
    {precio: {$lt: 50}},
    {categoria: "ofertas"}
  ]
});

// NOT
db.productos.find({precio: {$not: {$gt: 100}}});
```

#### Operadores de Array
```javascript
// Elemento en array
db.usuarios.find({hobbies: "programación"});

// Todos los elementos
db.usuarios.find({hobbies: {$all: ["programación", "lectura"]}});

// Tamaño del array
db.usuarios.find({hobbies: {$size: 3}});
```

### Índices en MongoDB

#### Tipos de Índices
```javascript
// Índice simple
db.usuarios.createIndex({email: 1});

// Índice compuesto
db.usuarios.createIndex({nombre: 1, edad: -1});

// Índice de texto
db.productos.createIndex({nombre: "text", descripcion: "text"});

// Índice único
db.usuarios.createIndex({email: 1}, {unique: true});
```

#### Consulta de Índices
```javascript
// Ver índices existentes
db.usuarios.getIndexes();

// Explicar plan de consulta
db.usuarios.find({email: "ana@email.com"}).explain("executionStats");
```

### Agregación en MongoDB

#### Pipeline de Agregación
```javascript
db.ventas.aggregate([
  // Etapa 1: Filtrar
  {$match: {fecha: {$gte: ISODate("2023-01-01")}}},
  
  // Etapa 2: Agrupar
  {$group: {
    _id: "$producto",
    total_ventas: {$sum: "$cantidad"},
    promedio_precio: {$avg: "$precio"}
  }},
  
  // Etapa 3: Ordenar
  {$sort: {total_ventas: -1}},
  
  // Etapa 4: Limitar
  {$limit: 10}
]);
```

#### Operadores de Agregación Comunes
```javascript
// $group - Agrupar documentos
{$group: {
  _id: "$categoria",
  count: {$sum: 1},
  total: {$sum: "$precio"}
}}

// $project - Transformar documentos
{$project: {
  nombre: 1,
  precio_con_iva: {$multiply: ["$precio", 1.19]}
}}

// $lookup - JOIN con otra colección
{$lookup: {
  from: "categorias",
  localField: "categoria_id",
  foreignField: "_id",
  as: "categoria_info"
}}
```

## Cuándo Usar MongoDB vs SQL

### Usar MongoDB cuando:
- **Desarrollo ágil**: Esquemas que cambian frecuentemente
- **Datos semi-estructurados**: JSON, logs, contenido web
- **Escalabilidad horizontal**: Necesidad de distribuir datos
- **Consultas simples**: Principalmente por clave o filtros básicos
- **Prototipado rápido**: Flexibilidad en el modelo de datos

### Usar SQL cuando:
- **Transacciones ACID**: Consistencia crítica
- **Relaciones complejas**: Múltiples JOINs frecuentes
- **Consultas analíticas**: Agregaciones complejas
- **Esquemas estables**: Estructura de datos bien definida
- **Cumplimiento normativo**: Auditorías y trazabilidad

## Mejores Prácticas en MongoDB

### 1. **Diseño de Esquemas**
```javascript
// ✅ Buena práctica: Embedding para datos relacionados
{
  "_id": ObjectId("..."),
  "usuario": "juan123",
  "perfil": {
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "configuracion": {
      "tema": "oscuro",
      "idioma": "es"
    }
  }
}

// ❌ Evitar: Normalización excesiva
// Separar en múltiples colecciones datos que se consultan juntos
```

### 2. **Nomenclatura**
- Usar snake_case para nombres de campos
- Nombres descriptivos y consistentes
- Evitar caracteres especiales en nombres de colecciones

### 3. **Índices Estratégicos**
```javascript
// Crear índices para consultas frecuentes
db.usuarios.createIndex({email: 1});
db.productos.createIndex({categoria: 1, precio: -1});

// Monitorear rendimiento
db.usuarios.find({email: "test@email.com"}).explain("executionStats");
```

### 4. **Validación de Esquemas**
```javascript
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "email"],
      properties: {
        nombre: {
          bsonType: "string",
          description: "Nombre es requerido y debe ser string"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
          description: "Email debe tener formato válido"
        },
        edad: {
          bsonType: "int",
          minimum: 0,
          maximum: 120
        }
      }
    }
  }
});
```

## Herramientas y Ecosistema

### 1. **MongoDB Compass**
- Interfaz gráfica oficial
- Exploración visual de datos
- Constructor de consultas
- Análisis de rendimiento

### 2. **MongoDB Atlas**
- Base de datos como servicio (DBaaS)
- Escalado automático
- Backup y recuperación
- Monitoreo integrado

### 3. **Drivers y ODMs**
- **Node.js**: Mongoose, MongoDB Driver
- **Python**: PyMongo, MongoEngine
- **Java**: MongoDB Java Driver
- **C#**: MongoDB.Driver

## Casos de Uso Reales

### 1. **E-commerce**
```javascript
// Producto con variantes y reviews
{
  "_id": ObjectId("..."),
  "nombre": "Smartphone XYZ",
  "categoria": "electrónicos",
  "precio_base": 500000,
  "variantes": [
    {
      "color": "negro",
      "almacenamiento": "128GB",
      "precio": 500000,
      "stock": 15
    },
    {
      "color": "blanco",
      "almacenamiento": "256GB",
      "precio": 600000,
      "stock": 8
    }
  ],
  "reviews": [
    {
      "usuario": "ana123",
      "calificacion": 5,
      "comentario": "Excelente producto",
      "fecha": ISODate("2023-10-15")
    }
  ],
  "tags": ["smartphone", "android", "cámara"],
  "activo": true
}
```

### 2. **Sistema de Logs**
```javascript
// Log de aplicación
{
  "_id": ObjectId("..."),
  "timestamp": ISODate("2023-10-20T14:30:00Z"),
  "nivel": "ERROR",
  "aplicacion": "api-usuarios",
  "mensaje": "Error de conexión a base de datos",
  "contexto": {
    "usuario_id": "user123",
    "endpoint": "/api/usuarios/perfil",
    "ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
  },
  "stack_trace": "Error: Connection timeout...",
  "resuelto": false
}
```

### 3. **Red Social**
```javascript
// Post con interacciones
{
  "_id": ObjectId("..."),
  "autor": {
    "usuario_id": ObjectId("..."),
    "nombre": "María García",
    "avatar": "https://..."
  },
  "contenido": "¡Aprendiendo MongoDB! 🚀",
  "tipo": "texto",
  "fecha_publicacion": ISODate("2023-10-20T10:00:00Z"),
  "likes": [
    {
      "usuario_id": ObjectId("..."),
      "fecha": ISODate("2023-10-20T10:05:00Z")
    }
  ],
  "comentarios": [
    {
      "usuario_id": ObjectId("..."),
      "texto": "¡Excelente!",
      "fecha": ISODate("2023-10-20T10:10:00Z")
    }
  ],
  "hashtags": ["mongodb", "nosql", "aprendizaje"],
  "privacidad": "publico"
}
```

## Conclusión

MongoDB y las bases de datos NoSQL en general representan una evolución natural en el manejo de datos modernos. Mientras que SQL sigue siendo fundamental para muchos casos de uso, MongoDB ofrece flexibilidad y escalabilidad que son esenciales en aplicaciones web modernas, análisis de big data y desarrollo ágil.

La clave está en entender cuándo usar cada tecnología:
- **SQL**: Para datos estructurados, transacciones complejas y análisis relacionales
- **MongoDB**: Para datos flexibles, escalabilidad horizontal y desarrollo iterativo

### Próximos Pasos
1. Instalar MongoDB Community Edition
2. Practicar con MongoDB Compass
3. Explorar MongoDB Atlas (versión en la nube)
4. Integrar con tu lenguaje de programación favorito
5. Diseñar esquemas para casos de uso reales

---

## Referencias y Recursos Adicionales

- [Documentación Oficial de MongoDB](https://docs.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) - Cursos gratuitos
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Herramienta GUI
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Base de datos en la nube
- [Mongoose](https://mongoosejs.com/) - ODM para Node.js
