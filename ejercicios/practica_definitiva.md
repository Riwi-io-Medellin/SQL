---

**Prueba de Desempeño Alternativa – Módulo 4**

*Tema: Bases de Datos SQL y NoSQL*

---

### Caso de uso:

Eres parte del equipo de desarrollo de una startup que busca revolucionar el manejo de datos en el mundo del bienestar y la productividad. Como primer producto, se quiere construir una plataforma que permita a los usuarios llevar un registro completo y estructurado de sus actividades, ya sea de gimnasio, meditación, lectura, caminatas u otros hábitos saludables o cualquier idea que desees trabajar.

Actualmente, muchos usuarios han venido usando plantillas de Excel desordenadas para registrar su progreso, pero desean una solución centralizada, con reportes, autenticación y buena experiencia de usuario. Tu reto es desarrollar el db de esta solución.

---

### Funcionalidades principales

#### 1. **Normalización del Archivo Excel**

- Analiza una plantilla Excel con registros desordenados de actividades diarias.
- Identifica datos redundantes, registros incompletos o mal estructurados.
- Crea un Modelo Entidad-Relación (MER) usando las tres primeras formas normales.
- Justifica las entidades creadas (por ejemplo: Usuario, Actividad, TipoActividad, RegistroDiario).
- Adjunta el MER como imagen o PDF (puedes usar draw\.io u otra herramienta).

#### 2. **Sistema de Autenticación**

- Implementa inicio de sesión para un usuario administrador: `admin@bienestar.io` / `admin123*`
- Utiliza hashing seguro con bcrypt u otra herramienta para las contraseñas.

#### 3. **Sistema CRUD para al menos dos entidades**

- Implementa operaciones CRUD para entidades como Actividades y Usuarios.
- Asegúrate de validar los datos antes de insertarlos o actualizarlos.
- Las relaciones deben estar bien definidas (por ejemplo, un Usuario tiene muchos RegistrosDiarios).
- Interfaz simple pero funcional con HTML, CSS y JavaScript vanilla.

#### 4. **Módulo de Importación de Excel**

- Carga la plantilla original del usuario y analiza su contenido.
- Valida y muestra errores si existen datos incompletos o inconsistentes.
- Inserta los datos normalizados en la base de datos.
- Puede ser una base de datos relacional (PostgreSQL, MySQL) o NoSQL (MongoDB), según prefieras.

---

### Puntos Extra (+5 max sin pasar de 100)

- Crear una colección POSTMAN que permita probar las rutas de la API sin usar la interfaz gráfica.

---

### Criterios de Aceptación

| Criterio                | Evaluación Esperada                                                            |
| ----------------------- | ------------------------------------------------------------------------------ |
| Modelo MER              | Cumple normalización 1FN-3FN, está justificado, es claro y está bien diseñado. |
| CRUD                    | Implementado al menos para 2 entidades con relaciones y validaciones.          |
| Importación de Excel    | Muestra errores si hay datos malos y persiste los datos correctamente.         |
| Autenticación           | Contraseñas hasheadas y acceso limitado a funciones de administración.         |
| Organización del código | Separación por responsabilidad, código comentado y legible.                    |
| Documentación           | README claro con instrucciones y estructura del repo organizada.               |

---

### Entregables

- Repositorio público en GitHub con:
  - `README.md` incluyendo:
    - Descripción del sistema.
    - Instrucciones de ejecución.
    - Tecnologías utilizadas.
    - Información del coder: nombre completo, clan, correo, documento.
  - Diagrama MER (PDF o imagen).
  - Código fuente organizado.
  - Archivo Excel original utilizado.

---

### Recursos sugeridos

- PostgreSQL y MongoDB Docs
- bcrypt hashing
- xlsx para leer Excel
- draw\.io para el MER
- Guía de Normalización
- Express.js y Node.js
- POSTMAN (colecciones y pruebas de API)

---

**Consejo final**: Elige una temática que te inspire: gimnasio, diario de libros leídos, comidas saludables, retos diarios, etc. Lo importante es demostrar tu comprensión del modelado de datos, normalización y estructura backend.

"Planifica como ingeniero, ejecuta como artista."

