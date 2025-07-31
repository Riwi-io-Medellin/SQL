Nombre del Archivo: `registro_actividades.xlsx`

---

**Hoja 1: ActividadesDiarias (desordenada para normalizar)**

| Fecha     | Nombre Usuario | Actividad        | Tiempo (min) | Categoría     | Descripción                             |
|-----------|----------------|------------------|--------------|----------------|-----------------------------------------|
| 2024-06-01| Juan Pérez     | Correr           | 30           | Ejercicio      | Corrió por el parque                   |
| 2024-06-01| Juan Pérez     | Correr           | 30           | Ejercicio      | Corrió por el parque                   |
| 2024-06-01| Ana Ramírez   | Leer             | 45           | Mental         | Leyó "El poder del ahora"              |
| 2024-06-02| Juan Pérez     | Yoga             | 20           | Ejercicio      | Sesion de estiramientos en casa         |
| 2024-06-02| Ana Ramírez   | Meditar          |              | Bienestar      | Meditó en la mañana                    |
| 2024-06-03| ana ramirez    | leer             | 30           | mental         | releyó capítulo 1                      |
| 2024-06-03| Juan Perez     | Caminata         | 60           | Ejercicio      | Caminó al aire libre con su perro      |

---

**Errores intencionados para detectar y normalizar:**
- Duplicados (Juan corrió dos veces el mismo día con el mismo tiempo)
- Inconsistencias en nombres de usuario (mayúsculas/minúsculas)
- Faltantes (tiempo en la meditación)
- Variaciones en nombres de actividad/categoría ("leer" vs "Leer", "mental" vs "Mental")

---

**Recomendación para normalización:**

Entidades sugeridas:
- **Usuario** (id, nombre, correo)
- **Actividad** (id, nombre, categoría_id)
- **CategoríaActividad** (id, nombre)
- **RegistroDiario** (id, usuario_id, actividad_id, fecha, duracion_min, descripcion)

---

