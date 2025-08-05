# Python Simple + PostgreSQL

**Un solo archivo Python** que conecta a PostgreSQL. Súper simple.

## Instalación

```bash
pip install psycopg2-binary
```

## Configuración

Edita `server.py` línea 11-17 con tu configuración de PostgreSQL:

```python
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'riwi_sql',  # ← Cambia esto
    'user': 'postgres',      # ← Cambia esto  
    'password': 'password'   # ← Cambia esto
}
```

## Uso

1. **Activa el entorno virtual**:
   Esto prepara tu terminal para usar las dependencias del proyecto.
   ```bash
   source venv/bin/activate
   ```

2. **Ejecuta el servidor**:
   Una vez activado el entorno, inicia el servidor.
   ```bash
   python server.py
   ```

   El servidor estará disponible en `http://localhost:3000`.

3. **Para detener el servidor**, presiona `Ctrl + C` en la terminal.

4. **Para desactivar el entorno virtual** cuando termines, simplemente ejecuta:
   ```bash
   deactivate
   ```

## Endpoints

- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PUT /users/{id}` - Actualizar usuario  
- `DELETE /users/{id}` - Eliminar usuario

## Tabla PostgreSQL

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

¡Eso es todo! 🎉
