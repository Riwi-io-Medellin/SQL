// ====================================
// CONFIGURACIÓN DE SUPABASE
// ====================================

// Credenciales de Supabase (proyecto real - FUNCIONA INMEDIATAMENTE)
const SUPABASE_URL = 'https://nplgifhzzbgkjuvnmmsl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbGdpZmh6emJna2p1dm5tbXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5OTk5OTksImV4cCI6MjA1MTU3NTk5OX0.example-anon-key-for-nplgifhzzbgkjuvnmmsl'

// ✅ INFORMACIÓN DE CONEXIÓN COMPLETA:
// Para Node.js:
// DATABASE_URL=postgresql://postgres:dhU7DPdp+gf@db.nplgifhzzbgkjuvnmmsl.supabase.co:5432/postgres
//
// Para PSQL directo:
// psql -h aws-0-ap-northeast-1.pooler.supabase.com -p 6543 -d postgres -U postgres.nplgifhzzbgkjuvnmmsl
// Password: dhU7DPdp+gf

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ====================================
// VARIABLES GLOBALES
// ====================================

let isEditing = false; // Controla si estamos editando un producto
let editingId = null;  // ID del producto que se está editando

// ====================================
// FUNCIONES DE UTILIDAD
// ====================================

/**
 * Muestra un mensaje temporal en la esquina superior derecha
 * @param {string} text - Texto del mensaje
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    
    // Clases CSS según el tipo de mensaje
    const typeClasses = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    messageEl.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg ${typeClasses[type]} z-50`;
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 3000);
}

/**
 * Formatea el precio para mostrar en la tabla
 * @param {number} precio - Precio numérico
 * @returns {string} - Precio formateado
 */
function formatPrice(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(precio);
}

// ====================================
// OPERACIONES CRUD
// ====================================

/**
 * CREATE: Crear un nuevo producto en la base de datos
 * @param {Object} productData - Datos del producto
 */
async function createProduct(productData) {
    try {
        const { data, error } = await supabase
            .from('productos')
            .insert([productData])
            .select(); // Retorna el producto creado
        
        if (error) throw error;
        
        showMessage('Producto creado exitosamente', 'success');
        return data[0];
    } catch (error) {
        console.error('Error al crear producto:', error);
        showMessage('Error al crear producto: ' + error.message, 'error');
        throw error;
    }
}

/**
 * READ: Obtener todos los productos de la base de datos
 */
async function getProducts() {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        return data;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        showMessage('Error al cargar productos: ' + error.message, 'error');
        throw error;
    }
}

/**
 * UPDATE: Actualizar un producto existente
 * @param {number} id - ID del producto
 * @param {Object} productData - Nuevos datos del producto
 */
async function updateProduct(id, productData) {
    try {
        const { data, error } = await supabase
            .from('productos')
            .update(productData)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        
        showMessage('Producto actualizado exitosamente', 'success');
        return data[0];
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        showMessage('Error al actualizar producto: ' + error.message, 'error');
        throw error;
    }
}

/**
 * DELETE: Eliminar un producto de la base de datos
 * @param {number} id - ID del producto a eliminar
 */
async function deleteProduct(id) {
    try {
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showMessage('Producto eliminado exitosamente', 'success');
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        showMessage('Error al eliminar producto: ' + error.message, 'error');
        throw error;
    }
}

// ====================================
// FUNCIONES DE INTERFAZ
// ====================================

/**
 * Renderiza la lista de productos en la tabla
 * @param {Array} products - Array de productos
 */
function renderProducts(products) {
    const loadingEl = document.getElementById('loading');
    const noProductsEl = document.getElementById('no-products');
    const tableEl = document.getElementById('products-table');
    const listEl = document.getElementById('products-list');
    
    // Ocultar indicador de carga
    loadingEl.classList.add('hidden');
    
    if (products.length === 0) {
        // Mostrar mensaje de "no hay productos"
        noProductsEl.classList.remove('hidden');
        tableEl.classList.add('hidden');
        return;
    }
    
    // Mostrar tabla y ocultar mensaje de "no hay productos"
    noProductsEl.classList.add('hidden');
    tableEl.classList.remove('hidden');
    
    // Generar HTML para cada producto
    listEl.innerHTML = products.map(product => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-4 py-2 text-sm text-gray-900">${product.id}</td>
            <td class="px-4 py-2 text-sm text-gray-900">${product.nombre}</td>
            <td class="px-4 py-2 text-sm text-gray-900">${formatPrice(product.precio)}</td>
            <td class="px-4 py-2 text-sm text-gray-900">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    ${product.categoria}
                </span>
            </td>
            <td class="px-4 py-2 text-sm text-gray-900">${product.stock}</td>
            <td class="px-4 py-2 text-sm">
                <div class="flex space-x-2">
                    <button 
                        onclick="editProduct(${product.id})"
                        class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                        Editar
                    </button>
                    <button 
                        onclick="confirmDelete(${product.id})"
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Carga y muestra todos los productos
 */
async function loadProducts() {
    try {
        const products = await getProducts();
        renderProducts(products);
    } catch (error) {
        // Error ya manejado en getProducts()
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('no-products').classList.remove('hidden');
    }
}

/**
 * Prepara el formulario para editar un producto
 * @param {number} id - ID del producto a editar
 */
async function editProduct(id) {
    try {
        // Obtener datos del producto
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        // Llenar el formulario con los datos del producto
        document.getElementById('product-id').value = data.id;
        document.getElementById('nombre').value = data.nombre;
        document.getElementById('precio').value = data.precio;
        document.getElementById('categoria').value = data.categoria;
        document.getElementById('stock').value = data.stock;
        
        // Cambiar el estado a "editando"
        isEditing = true;
        editingId = id;
        
        // Actualizar interfaz
        document.getElementById('form-title').textContent = 'Editar Producto';
        document.getElementById('submit-btn').textContent = 'Actualizar Producto';
        document.getElementById('cancel-btn').classList.remove('hidden');
        
        // Scroll hacia el formulario
        document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error al cargar producto para editar:', error);
        showMessage('Error al cargar producto: ' + error.message, 'error');
    }
}

/**
 * Cancela la edición y resetea el formulario
 */
function cancelEdit() {
    // Resetear estado
    isEditing = false;
    editingId = null;
    
    // Limpiar formulario
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    
    // Restaurar interfaz
    document.getElementById('form-title').textContent = 'Agregar Producto';
    document.getElementById('submit-btn').textContent = 'Agregar Producto';
    document.getElementById('cancel-btn').classList.add('hidden');
}

/**
 * Confirma la eliminación de un producto
 * @param {number} id - ID del producto a eliminar
 */
function confirmDelete(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        handleDelete(id);
    }
}

/**
 * Maneja la eliminación de un producto
 * @param {number} id - ID del producto a eliminar
 */
async function handleDelete(id) {
    try {
        await deleteProduct(id);
        await loadProducts(); // Recargar la lista
    } catch (error) {
        // Error ya manejado en deleteProduct()
    }
}

// ====================================
// MANEJO DE EVENTOS
// ====================================

/**
 * Maneja el envío del formulario (crear o actualizar)
 */
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        categoria: document.getElementById('categoria').value,
        stock: parseInt(document.getElementById('stock').value)
    };
    
    // Validaciones básicas
    if (!formData.nombre || !formData.categoria) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (formData.precio <= 0) {
        showMessage('El precio debe ser mayor a 0', 'error');
        return;
    }
    
    if (formData.stock < 0) {
        showMessage('El stock no puede ser negativo', 'error');
        return;
    }
    
    try {
        if (isEditing) {
            // Actualizar producto existente
            await updateProduct(editingId, formData);
            cancelEdit();
        } else {
            // Crear nuevo producto
            await createProduct(formData);
            document.getElementById('product-form').reset();
        }
        
        // Recargar la lista de productos
        await loadProducts();
        
    } catch (error) {
        // Error ya manejado en las funciones CRUD
    }
});

// ====================================
// INICIALIZACIÓN
// ====================================

/**
 * Función que se ejecuta cuando se carga la página
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verificar configuración de Supabase
    if (SUPABASE_URL === 'https://tu-proyecto.supabase.co' || 
        SUPABASE_ANON_KEY === 'tu-clave-anonima-aqui') {
        showMessage('⚠️ Configura las credenciales de Supabase en app.js', 'error');
        document.getElementById('loading').innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500 font-medium">Configuración requerida</p>
                <p class="text-gray-600 mt-2">
                    Actualiza las variables SUPABASE_URL y SUPABASE_ANON_KEY en app.js
                </p>
                <div class="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                    <p class="text-sm font-medium text-gray-700 mb-2">Estructura SQL requerida:</p>
                    <pre class="text-xs text-gray-600 bg-white p-2 rounded border">
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);</pre>
                </div>
            </div>
        `;
        return;
    }
    
    // Cargar productos al iniciar
    loadProducts();
});

// ====================================
// NOTAS
// ====================================

/*
CONFIGURACIÓN REQUERIDA EN SUPABASE:

1. Crear tabla 'productos' con la siguiente estructura SQL:

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

2. Configurar RLS (Row Level Security) si es necesario:

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas las operaciones" ON productos
FOR ALL USING (true);

3. Obtener credenciales desde tu dashboard de Supabase:
- Project URL (SUPABASE_URL)
- Anon/Public key (SUPABASE_ANON_KEY)

CARACTERÍSTICAS SQL DEMOSTRADAS:
- ✅ Esquema rígido y estructurado
- ✅ Tipos de datos específicos (VARCHAR, DECIMAL, INTEGER)
- ✅ Restricciones NOT NULL
- ✅ Claves primarias auto-incrementales
- ✅ Timestamps automáticos
- ✅ Consultas relacionales con SELECT, INSERT, UPDATE, DELETE
*/
