#!/usr/bin/env python3
"""
Servidor Python SÚPER SIMPLE con PostgreSQL
Un solo archivo, mínimo código, máxima simplicidad
-- AHORA CON COMENTARIOS EDUCATIVOS --
"""

# --- IMPORTACIONES DE MÓDULOS ---
# json: Para trabajar con datos en formato JSON (enviar y recibir desde el frontend).
# psycopg2: El "driver" o conector para hablar con la base de datos PostgreSQL.
# http.server: Módulo de Python para crear un servidor web básico.
# os: Para interactuar con el sistema operativo, principalmente para buscar archivos (como index.html).
import json
import psycopg2
from http.server import HTTPServer, BaseHTTPRequestHandler
import os

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
# Un diccionario que contiene los datos para conectarse a PostgreSQL.
# ¡IMPORTANTE! Cambia estos valores por los de tu propia base de datos.
DB_CONFIG = {
    'host': 'aws-0-ap-northeast-1.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.nplgifhzzbgkjuvnmmsl',
    'password': '}fGDGJFdsjff++f*s'
}

# --- CLASE PRINCIPAL DEL SERVIDOR ---
# Hereda de BaseHTTPRequestHandler, que sabe cómo manejar peticiones HTTP.
# Nosotros le diremos QUÉ HACER cuando llegue una petición (GET, POST, etc.).
class SimpleHandler(BaseHTTPRequestHandler):
    
    # --- MÉTODOS AUXILIARES (HELPERS) ---

    def _cors_headers(self):
        """Configura las cabeceras CORS para permitir que el frontend se comunique con este backend."""
        # 'Access-Control-Allow-Origin': '*' significa que cualquier dominio (nuestro frontend) puede hacer peticiones.
        self.send_header('Access-Control-Allow-Origin', '*')
        # 'Access-Control-Allow-Methods': Define los métodos HTTP permitidos (GET para leer, POST para crear, etc.).
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        # 'Access-Control-Allow-Headers': Define las cabeceras que el frontend puede enviar (como 'Content-Type').
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def _json_response(self, data, status=200):
        """Envía una respuesta en formato JSON con el código de estado correcto."""
        self.send_response(status)  # 1. Enviar código de estado (200 OK, 404 No Encontrado, etc.).
        self.send_header('Content-Type', 'application/json')  # 2. Especificar que la respuesta es JSON.
        self._cors_headers()  # 3. Añadir cabeceras CORS.
        self.end_headers()  # 4. Finalizar cabeceras.
        if data:
            # 5. Si hay datos, convertirlos a string JSON y enviarlos como bytes.
            self.wfile.write(json.dumps(data, default=str).encode())

    # --- MANEJO DE PETICIONES HTTP --- 

    def do_OPTIONS(self):
        """Maneja las peticiones 'pre-vuelo' de CORS."""
        # Los navegadores envían una petición OPTIONS antes de un PUT o DELETE para asegurarse de que el servidor los permite.
        # Simplemente respondemos con OK (200) y las cabeceras CORS.
        self.send_response(200)
        self._cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Maneja las peticiones GET: Sirve la API (/users) o los archivos del frontend."""
        
        # --- LÓGICA DE LA API: Si la ruta es /users, devolvemos los usuarios de la DB ---
        if self.path == '/users':
            try:
                conn = psycopg2.connect(**DB_CONFIG)  # 1. Conectar a la base de datos.
                cur = conn.cursor()  # 2. Crear un cursor para ejecutar comandos.
                cur.execute("SELECT * FROM users ORDER BY id")  # 3. Ejecutar la consulta SQL.
                rows = cur.fetchall()  # 4. Obtener todas las filas del resultado.
                # 5. Convertir las filas (tuplas) a una lista de diccionarios para que sea JSON válido.
                users = [{'id': r[0], 'username': r[1], 'role': r[2], 'created_at': r[3], 'updated_at': r[4]} for r in rows]
                conn.close()  # 6. Cerrar la conexión.
                self._json_response(users)  # 7. Enviar la lista de usuarios como JSON.
                print(f"GET /users - {len(users)} usuarios")
            except Exception as e:
                print(f"Error en API (GET): {e}")
                self._json_response({'error': str(e)}, 500)
        
        # --- LÓGICA DEL FRONTEND: Si no es /users, intentamos servir un archivo estático ---
        else:
            try:
                path = self.path if self.path != '/' else '/index.html'  # Si piden la raíz, servimos index.html.
                filepath = os.path.join('public', path.lstrip('/'))  # Construye la ruta al archivo (ej: public/style.css).

                # Seguridad: Validar que el archivo exista y esté dentro de la carpeta 'public'.
                if not os.path.exists(filepath) or not os.path.realpath(filepath).startswith(os.path.realpath('public')):
                    self.send_error(404, 'File Not Found')
                    return

                # Determinar el tipo de contenido (MIME type) para que el navegador lo entienda.
                content_type = 'text/html' if filepath.endswith('.html') else 'text/css' if filepath.endswith('.css') else 'application/javascript'
                
                # Servir el archivo.
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.end_headers()
                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read()) # Se lee en modo binario 'rb' para evitar problemas de codificación.
                print(f"GET {path} - Servido: {filepath}")

            except Exception as e:
                self.send_error(500, f'Error sirviendo archivo: {e}')
                print(f"Error en Frontend (GET): {e}")
    
    def do_POST(self):
        """Maneja las peticiones POST: Crea un nuevo usuario en la base de datos."""
        if self.path == '/users':
            try:
                length = int(self.headers.get('Content-Length', 0))  # 1. Obtener el tamaño del cuerpo de la petición.
                data = json.loads(self.rfile.read(length).decode())  # 2. Leer y decodificar el JSON enviado.
                
                conn = psycopg2.connect(**DB_CONFIG)
                cur = conn.cursor()
                # 3. Ejecutar INSERT y usar RETURNING * para obtener el usuario recién creado.
                cur.execute("INSERT INTO users (username, role) VALUES (%s, %s) RETURNING *", (data['username'], data.get('role', 'member')))
                row = cur.fetchone() # 4. Obtener la fila devuelta.
                user = {'id': row[0], 'username': row[1], 'role': row[2], 'created_at': row[3], 'updated_at': row[4]}
                conn.commit()  # 5. Guardar los cambios en la base de datos.
                conn.close()
                self._json_response(user, 201)  # 6. Enviar el nuevo usuario con código 201 (Creado).
                print(f"POST /users - Creado: {data['username']}")
            except Exception as e:
                print(f"Error en API (POST): {e}")
                self._json_response({'error': str(e)}, 500)
    
    def do_PUT(self):
        """Maneja las peticiones PUT: Actualiza un usuario existente."""
        if self.path.startswith('/users/'):
            try:
                user_id = int(self.path.split('/')[-1])  # 1. Extraer el ID del final de la URL.
                length = int(self.headers.get('Content-Length', 0))
                data = json.loads(self.rfile.read(length).decode())  # 2. Leer el JSON con los datos a actualizar.
                
                conn = psycopg2.connect(**DB_CONFIG)
                cur = conn.cursor()
                cur.execute("UPDATE users SET username = %s, role = %s, updated_at = NOW() WHERE id = %s RETURNING *", (data['username'], data['role'], user_id))
                row = cur.fetchone()
                if row:
                    user = {'id': row[0], 'username': row[1], 'role': row[2], 'created_at': row[3], 'updated_at': row[4]}
                    conn.commit()
                    self._json_response(user)
                    print(f"PUT /users/{user_id} - Actualizado")
                else:
                    self._json_response({'error': 'Usuario no encontrado'}, 404)
                conn.close()
            except Exception as e:
                print(f"Error en API (PUT): {e}")
                self._json_response({'error': str(e)}, 500)
    
    def do_DELETE(self):
        """Maneja las peticiones DELETE: Elimina un usuario."""
        if self.path.startswith('/users/'):
            try:
                user_id = int(self.path.split('/')[-1]) # 1. Extraer el ID de la URL.
                
                conn = psycopg2.connect(**DB_CONFIG)
                cur = conn.cursor()
                cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
                if cur.rowcount > 0: # 2. rowcount nos dice si se eliminó alguna fila.
                    conn.commit()
                    self._json_response({'message': f'Usuario {user_id} eliminado'})
                    print(f"DELETE /users/{user_id} - Eliminado")
                else:
                    self._json_response({'error': 'Usuario no encontrado'}, 404)
                conn.close()
            except Exception as e:
                print(f"Error en API (DELETE): {e}")
                self._json_response({'error': str(e)}, 500)
    
    def log_message(self, format, *args):
        """Sobrescribe el método de log para tener una consola más limpia."""
        return  # No hace nada, evitando los logs automáticos del servidor.

# --- PUNTO DE ENTRADA DEL PROGRAMA ---
# El código dentro de este 'if' solo se ejecuta cuando corremos el archivo directamente (ej: python3 server.py).
if __name__ == "__main__":
    print("PYTHON SIMPLE + POSTGRESQL + FRONTEND")
    print("Servidor corriendo en: http://localhost:3000")
    print("API en /users, Frontend en / (root)")
    print("=" * 40)
    
    # 1. Crear una instancia del servidor, especificando la dirección y nuestro manejador (SimpleHandler).
    server = HTTPServer(('localhost', 3000), SimpleHandler)
    try:
        # 2. Iniciar el servidor y mantenerlo escuchando por peticiones para siempre.
        server.serve_forever()
    except KeyboardInterrupt:
        # 3. Si el usuario presiona Ctrl+C, detener el servidor de forma limpia.
        print("\nServidor detenido")
        server.server_close()
