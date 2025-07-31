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

