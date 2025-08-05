/**
 * Funcionalidad principal JS para el CRUD de usuarios
 * Archivo para el frontend estático que consume el backend Express
 */

// URL base del backend Express (asegúrate que coincida con tu backend)
const API_URL = 'http://localhost:3000/users'; // URL del backend Express

// Cuando la página carga, se llama automáticamente a loadUsers para mostrar la lista de usuarios
window.onload = function() {
    loadUsers(); // Al cargar la página, mostrar usuarios
};


// CREATE - Crear nuevo usuario
// Envía los datos del formulario al backend para crear un usuario
async function createUser() {
    const username = document.getElementById('newUsername').value.trim(); // Obtiene el valor del input
    const role = document.getElementById('newRole').value; // Obtiene el rol seleccionado
    if (!username) { // Validación: campo obligatorio
        alert('El nombre de usuario es requerido');
        return;
    }
    try {
        const res = await fetch(API_URL, {
            method: 'POST', // Método HTTP para crear
            headers: { 'Content-Type': 'application/json' }, // Indica que se envía JSON
            body: JSON.stringify({ username, role }) // Datos enviados al backend
        });
        if (!res.ok) throw new Error('Error al crear usuario'); // Si la respuesta no es exitosa
        alert('Usuario creado exitosamente');
        document.getElementById('newUsername').value = ''; // Limpia el input
        loadUsers(); // Recarga la lista
    } catch (error) {
        alert(`Error al crear usuario: ${error.message}`);
    }
}


// READ - Cargar todos los usuarios
// Hace una petición al backend y renderiza la tabla con los usuarios existentes
async function loadUsers() {
    try {
        const users = await (await fetch(API_URL)).json(); // Recibe array directo
        renderUsers(users); // Pasa array directamente
    } catch (error) {
        alert(`Error al cargar usuarios: ${error.message}`);
    }
}


// Renderizar usuarios en la tabla HTML
// Recibe un array de usuarios y lo muestra en el tbody
function renderUsers(users) {
    const tbody = document.getElementById('usersBody'); // Referencia al tbody de la tabla
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay usuarios para mostrar</td></tr>'; // Mensaje si no hay usuarios
        return;
    }
    tbody.innerHTML = users.map(user => {
        const createdDate = new Date(user.created_at).toLocaleDateString('es-ES'); // Formatea fecha
        return `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td><span style="background: ${getRoleColor(user.role)}; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${user.role}</span></td>
                <td>${createdDate}</td>
                <td>
                    <button class="btn-warning" onclick="editUser(${user.id}, '${user.username}', '${user.role}')">Editar</button>
                    <button class="btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
                </td>
            </tr>
        `; // Crea una fila por usuario
    }).join('');
}

// Función auxiliar para asignar color a cada rol
// Devuelve un color según el tipo de rol del usuario
function getRoleColor(role) {
    // Devuelve un color diferente según el rol
    switch(role) {
        case 'admin': return '#dc3545'; // Rojo
        case 'editor': return '#ffc107'; // Amarillo
        case 'member': return '#28a745'; // Verde
        default: return '#6c757d'; // Gris
    }
}


// UPDATE - Editar usuario
// Pide al usuario los nuevos valores (prompt) y envía PATCH al backend
// Incluye validaciones para evitar campos vacíos o roles inválidos
async function editUser(id, currentUsername, currentRole) {
    const newUsername = prompt('Nuevo nombre de usuario:', currentUsername); // Pide nuevo username
    if (newUsername === null) return; // Usuario canceló
    if (newUsername.trim() === '') {
        alert('El nombre de usuario no puede estar vacío');
        return;
    }
    const roles = ['member', 'admin', 'editor']; // Roles válidos
    let newRole = prompt(`Nuevo rol (${roles.join(', ')}):`, currentRole); // Pide nuevo rol
    if (newRole === null) return; // Usuario canceló
    if (!roles.includes(newRole)) {
        alert('Rol inválido. Debe ser: member, admin o editor');
        return;
    }
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH', // Método HTTP para actualizar
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUsername.trim(), role: newRole })
        });
        if (!res.ok) throw new Error('Error al actualizar usuario'); // Si la respuesta no es exitosa
        alert('Usuario actualizado exitosamente');
        loadUsers();
    } catch (error) {
        alert(`Error al actualizar usuario: ${error.message}`);
    }
}
// DELETE - Eliminar usuario
// Pide confirmación y, si acepta, elimina el usuario enviando DELETE al backend
async function deleteUser(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return; // Si el usuario cancela, no hace nada
    }
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE' // Método HTTP para eliminar
        });
        if (!res.ok) throw new Error('Error al eliminar usuario'); // Si la respuesta no es exitosa
        alert('Usuario eliminado exitosamente');
        loadUsers();
    } catch (error) {
        alert(`Error al eliminar usuario: ${error.message}`);
    }
}
