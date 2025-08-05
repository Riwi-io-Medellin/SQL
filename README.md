# Repositorio de Bases de Datos – SQL y NoSQL

Este repositorio es una guía completa sobre bases de datos, diseñada para estudiantes de RIWI. Abarca desde los fundamentos de las bases de datos relacionales (SQL) hasta conceptos avanzados y una introducción a las bases de datos no relacionales (NoSQL), con un enfoque especial en MongoDB.

## 📚 Teoría

La sección de teoría está organizada en módulos progresivos para facilitar el aprendizaje. Cada archivo `.md` en la carpeta `teoria/` cubre un tema específico en profundidad.

- **SQL (Bases de Datos Relacionales):**
  - `01-fundamentos.md`: Conceptos básicos, historia y modelos de datos.
  - `02-ddl-estructura.md`: Comandos de Definición de Datos (CREATE, ALTER, DROP).
  - `03-dml-manipulacion.md`: Comandos de Manipulación de Datos (INSERT, UPDATE, DELETE, SELECT).
  - `04-consultas-avanzadas.md`: JOINs, subconsultas y cláusulas complejas.
  - `05-funciones-agregacion.md`: Funciones como COUNT, SUM, AVG, y agrupamiento.
  - `06-optimizacion-indices.md`: Índices, vistas y buenas prácticas.
  - `07-transacciones-control.md`: ACID, concurrencia y control de transacciones.

- **NoSQL (Bases de Datos No Relacionales):**
  - `08-nosql-no-relacionales.md`: Introducción a NoSQL, tipos de bases de datos y ventajas.
  - `09-instalacion-mongodb-atlas.md`: Guía paso a paso para configurar un clúster de MongoDB en la nube con Atlas.

## 💻 Ejemplos Prácticos

Esta sección contiene proyectos de backend completos que implementan operaciones CRUD (Crear, Leer, Actualizar, Borrar) utilizando diferentes tecnologías. Cada ejemplo está diseñado para ser consumido por un frontend estático.

- **`examples/javascript-express`**: Un backend clásico construido con **Node.js** y **Express**, utilizando **PostgreSQL** como base de datos relacional.
- **`examples/python`**: Una alternativa de backend ligera construida con **Python puro** (sin frameworks), que utiliza un archivo **JSON** como sistema de almacenamiento de datos.
- **`examples/mongodb`**: Una implementación de backend con **Node.js** y **Express**, conectada a una base de datos no relacional **MongoDB**.

## 🚀 Cómo Empezar

1.  **Explora la Teoría**: Navega a la carpeta `/teoria` y comienza a leer los archivos en orden numérico.
2.  **Analiza los Ejemplos**: Visita la carpeta `/examples` y explora el código fuente de cada implementación de backend. Cada carpeta contiene su propio `README.md` con instrucciones de instalación y uso.

Este repositorio está en constante crecimiento. ¡Siéntete libre de contribuir!

Bienvenido al repositorio del **SQL** impartido en RIWI Medellín. Aquí encontrarás material teórico y práctico para aprender los fundamentos del lenguaje SQL y desarrollar las competencias necesarias para manipular bases de datos relacionales de forma profesional.

---

## Contenido del repositorio

| Carpeta / Archivo | Descripción |
|-------------------|-------------|
| `teoria/`         | **Nueva estructura organizada**: Teoría fragmentada en 7 módulos temáticos para mejor organización y consulta específica. Incluye ejemplos en MySQL y PostgreSQL con código completamente comentado. |
| `teoria_sql.md`   | Archivo original con toda la teoría (mantenido como referencia). |
| `ejercicios/`     | Colección de ejercicios guiados y retos para practicar cada módulo. Cada archivo `.md` contiene enunciados y, en algunos casos, las soluciones comentadas. |
| `README.md`       | Este archivo: guía rápida del proyecto, cómo usarlo y cómo contribuir. |

---

## Requisitos previos

1. **Git** para clonar el repositorio.
2. **Motor de base de datos** a tu elección (PostgreSQL, MySQL, MariaDB, SQLite, etc.).
3. Editor de código o IDE con soporte SQL (VS Code, DBeaver, DataGrip, etc.).

> Nota: Los scripts y ejemplos están escritos usando sintaxis estándar ANSI SQL; sin embargo, pueden existir ligeras diferencias según el motor. Ajusta los comandos si es necesario.

---

## Cómo usar este repositorio

1. **Clonación**
   ```bash
   git clone git@github.com:Riwi-io-Medellin/SQL.git
   cd SQL
   ```
2. **Consulta de teoría**
   - **Estructura nueva (recomendada)**: Ve a la carpeta `teoria/` y consulta el [índice organizado](./teoria/README.md) por módulos temáticos
   - **Archivo original**: Abre `teoria_sql.md` para consultar toda la teoría en un solo archivo
3. **Resolución de ejercicios**
   Ve a la carpeta `ejercicios/`, lee el archivo correspondiente al tema y ejecuta las sentencias en tu gestor de bases de datos. Al finalizar, compara tus resultados con las soluciones propuestas.
4. **Progreso personal**
   Marca los ejercicios completados o crea ramas (`git branch`) para guardar tus propias respuestas.

---

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` (próximamente) para más detalles.

---

¡Éxitos en tu proceso de aprendizaje y a disfrutar del poder de SQL!
