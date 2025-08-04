// ====================================
// CONFIGURACIÓN DE MONGODB ATLAS
// ====================================

// TODO: Reemplazar con tus credenciales reales de MongoDB Atlas
const MONGODB_API_URL = 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1'
const MONGODB_API_KEY = 'tu-api-key-aqui'
const MONGODB_CLUSTER = 'tu-cluster'
const MONGODB_DATABASE = 'tienda'
const MONGODB_COLLECTION = 'productos'

// ====================================
// VARIABLES GLOBALES
// ====================================

let isEditing = false; // Controla si estamos editando un producto
let editingId = null;  // ID del producto que se está editando
let products = [];     // Cache local de productos

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
    
    const typeClasses = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    messageEl.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg ${typeClasses[type]} z-50`;
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 3000);
}

/**
 * Formatea el precio para mostrar
 * @param {number} precio - Precio numérico
 * @returns {string} - Precio formateado
 */
function formatPrice(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(precio);
}

/**
 * Genera un ID único para nuevos documentos (simulando ObjectId)
 * @returns {string} - ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Convierte string de tags a array
 * @param {string} tagsString - Tags separados por comas
 * @returns {Array} - Array de tags
 */
function parseTagsString(tagsString) {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

// ====================================
// OPERACIONES CRUD CON MONGODB
// ====================================

/**
 * CREATE: Crear un nuevo producto en MongoDB
 * @param {Object} productData - Datos del producto
 */
async function createProduct(productData) {
    try {
        // Crear documento con estructura NoSQL flexible
        const newProduct = {
            _id: generateId(),
            ...productData,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };
        
        // En un entorno real, harías una petición POST a MongoDB Atlas API:
        /*
        const response = await fetch(`${MONGODB_API_URL}/action/insertOne`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGODB_API_KEY
            },
            body: JSON.stringify({
                dataSource: MONGODB_CLUSTER,
                database: MONGODB_DATABASE,
                collection: MONGODB_COLLECTION,
                document: newProduct
            })
        });
        
        if (!response.ok) throw new Error('Error al crear producto');
        const result = await response.json();
        */
        
        // Simulación con localStorage para demo
        const storedProducts = JSON.parse(localStorage.getItem('mongodb_productos') || '[]');
        storedProducts.push(newProduct);
        localStorage.setItem('mongodb_productos', JSON.stringify(storedProducts));
        
        showMessage('Producto creado exitosamente', 'success');
        return newProduct;
    } catch (error) {
        console.error('Error al crear producto:', error);
        showMessage('Error al crear producto: ' + error.message, 'error');
        throw error;
    }
}

/**
 * READ: Obtener todos los productos de MongoDB
 */
async function getProducts() {
    try {
        // En un entorno real, harías una petición POST a MongoDB Atlas API:
        /*
        const response = await fetch(`${MONGODB_API_URL}/action/find`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGODB_API_KEY
            },
            body: JSON.stringify({
                dataSource: MONGODB_CLUSTER,
                database: MONGODB_DATABASE,
                collection: MONGODB_COLLECTION,
                sort: { fechaCreacion: -1 }
            })
        });
        
        if (!response.ok) throw new Error('Error al obtener productos');
        const result = await response.json();
        return result.documents;
        */
        
        // Simulación con localStorage para demo
        const storedProducts = JSON.parse(localStorage.getItem('mongodb_productos') || '[]');
        return storedProducts.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    } catch (error) {
        console.error('Error al obtener productos:', error);
        showMessage('Error al cargar productos: ' + error.message, 'error');
        throw error;
    }
}

/**
 * UPDATE: Actualizar un producto existente en MongoDB
 * @param {string} id - ID del producto
 * @param {Object} productData - Nuevos datos del producto
 */
async function updateProduct(id, productData) {
    try {
        const updatedData = {
            ...productData,
            fechaActualizacion: new Date().toISOString()
        };
        
        // En un entorno real, harías una petición POST a MongoDB Atlas API:
        /*
        const response = await fetch(`${MONGODB_API_URL}/action/updateOne`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGODB_API_KEY
            },
            body: JSON.stringify({
                dataSource: MONGODB_CLUSTER,
                database: MONGODB_DATABASE,
                collection: MONGODB_COLLECTION,
                filter: { _id: id },
                update: { $set: updatedData }
            })
        });
        
        if (!response.ok) throw new Error('Error al actualizar producto');
        */
        
        // Simulación con localStorage para demo
        const storedProducts = JSON.parse(localStorage.getItem('mongodb_productos') || '[]');
        const productIndex = storedProducts.findIndex(p => p._id === id);
        if (productIndex !== -1) {
            storedProducts[productIndex] = { ...storedProducts[productIndex], ...updatedData };
            localStorage.setItem('mongodb_productos', JSON.stringify(storedProducts));
        }
        
        showMessage('Producto actualizado exitosamente', 'success');
        return updatedData;
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        showMessage('Error al actualizar producto: ' + error.message, 'error');
        throw error;
    }
}

/**
 * DELETE: Eliminar un producto de MongoDB
 * @param {string} id - ID del producto a eliminar
 */
async function deleteProduct(id) {
    try {
        // En un entorno real, harías una petición POST a MongoDB Atlas API:
        /*
        const response = await fetch(`${MONGODB_API_URL}/action/deleteOne`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGODB_API_KEY
            },
            body: JSON.stringify({
                dataSource: MONGODB_CLUSTER,
                database: MONGODB_DATABASE,
                collection: MONGODB_COLLECTION,
                filter: { _id: id }
            })
        });
        
        if (!response.ok) throw new Error('Error al eliminar producto');
        */
        
        // Simulación con localStorage para demo
        const storedProducts = JSON.parse(localStorage.getItem('mongodb_productos') || '[]');
        const filteredProducts = storedProducts.filter(p => p._id !== id);
        localStorage.setItem('mongodb_productos', JSON.stringify(filteredProducts));
        
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
 * Renderiza la lista de productos en formato de grid (más visual para NoSQL)
 * @param {Array} products - Array de productos
 */
function renderProducts(products) {
    const loadingEl = document.getElementById('loading');
    const noProductsEl = document.getElementById('no-products');
    const gridEl = document.getElementById('products-grid');
    const listEl = document.getElementById('products-list');
    
    loadingEl.classList.add('hidden');
    
    if (products.length === 0) {
        noProductsEl.classList.remove('hidden');
        gridEl.classList.add('hidden');
        return;
    }
    
    noProductsEl.classList.add('hidden');
    gridEl.classList.remove('hidden');
    
    // Generar HTML para cada producto (formato de tarjeta)
    listEl.innerHTML = products.map(product => `
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <!-- Encabezado del producto -->
            <div class="flex justify-between items-start mb-3">
                <h3 class="font-semibold text-gray-800 text-lg">${product.nombre}</h3>
                <span class="text-xs text-gray-500 font-mono">${product._id.slice(-6)}</span>
            </div>
            
            <!-- Precio y categoría -->
            <div class="mb-3">
                <p class="text-2xl font-bold text-green-600">${formatPrice(product.precio)}</p>
                <span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mt-1">
                    ${product.categoria}
                </span>
            </div>
            
            <!-- Stock -->
            <div class="mb-3">
                <span class="text-sm text-gray-600">Stock: </span>
                <span class="font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                    ${product.stock} unidades
                </span>
            </div>
            
            <!-- Tags (característica NoSQL) -->
            ${product.tags && product.tags.length > 0 ? `
                <div class="mb-3">
                    <p class="text-xs text-gray-500 mb-1">🏷️ Tags:</p>
                    <div class="flex flex-wrap gap-1">
                        ${product.tags.map(tag => `
                            <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                ${tag}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Especificaciones (objeto anidado NoSQL) -->
            ${product.especificaciones && Object.keys(product.especificaciones).length > 0 ? `
                <div class="mb-3 p-2 bg-white rounded border">
                    <p class="text-xs text-gray-500 mb-1">📦 Especificaciones:</p>
                    <div class="text-xs text-gray-700 space-y-1">
                        ${Object.entries(product.especificaciones)
                            .filter(([key, value]) => value)
                            .map(([key, value]) => `
                                <div><span class="font-medium capitalize">${key}:</span> ${value}</div>
                            `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Fechas (metadata NoSQL) -->
            <div class="text-xs text-gray-500 mb-3 border-t pt-2">
                <p>📅 Creado: ${new Date(product.fechaCreacion).toLocaleDateString()}</p>
                ${product.fechaActualizacion !== product.fechaCreacion ? `
                    <p>🔄 Actualizado: ${new Date(product.fechaActualizacion).toLocaleDateString()}</p>
                ` : ''}
            </div>
            
            <!-- Botones de acción -->
            <div class="flex space-x-2">
                <button 
                    onclick="editProduct('${product._id}')"
                    class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                    ✏️ Editar
                </button>
                <button 
                    onclick="confirmDelete('${product._id}')"
                    class="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Carga y muestra todos los productos
 */
async function loadProducts() {
    try {
        products = await getProducts();
        renderProducts(products);
    } catch (error) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('no-products').classList.remove('hidden');
    }
}

/**
 * Prepara el formulario para editar un producto
 * @param {string} id - ID del producto a editar
 */
async function editProduct(id) {
    try {
        const product = products.find(p => p._id === id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        
        // Llenar el formulario con los datos del producto
        document.getElementById('product-id').value = product._id;
        document.getElementById('nombre').value = product.nombre;
        document.getElementById('precio').value = product.precio;
        document.getElementById('categoria').value = product.categoria;
        document.getElementById('stock').value = product.stock;
        
        // Tags
        if (product.tags && product.tags.length > 0) {
            document.getElementById('tags').value = product.tags.join(', ');
        }
        
        // Especificaciones
        if (product.especificaciones) {
            document.getElementById('marca').value = product.especificaciones.marca || '';
            document.getElementById('modelo').value = product.especificaciones.modelo || '';
            document.getElementById('color').value = product.especificaciones.color || '';
            document.getElementById('garantia').value = product.especificaciones.garantia || '';
        }
        
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
    isEditing = false;
    editingId = null;
    
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    
    document.getElementById('form-title').textContent = 'Agregar Producto';
    document.getElementById('submit-btn').textContent = 'Agregar Producto';
    document.getElementById('cancel-btn').classList.add('hidden');
}

/**
 * Confirma la eliminación de un producto
 * @param {string} id - ID del producto a eliminar
 */
function confirmDelete(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        handleDelete(id);
    }
}

/**
 * Maneja la eliminación de un producto
 * @param {string} id - ID del producto a eliminar
 */
async function handleDelete(id) {
    try {
        await deleteProduct(id);
        await loadProducts();
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
    
    // Obtener datos básicos del formulario
    const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        categoria: document.getElementById('categoria').value,
        stock: parseInt(document.getElementById('stock').value),
        tags: parseTagsString(document.getElementById('tags').value),
        especificaciones: {
            marca: document.getElementById('marca').value.trim(),
            modelo: document.getElementById('modelo').value.trim(),
            color: document.getElementById('color').value.trim(),
            garantia: document.getElementById('garantia').value.trim()
        }
    };
    
    // Limpiar especificaciones vacías (característica NoSQL: flexibilidad)
    Object.keys(formData.especificaciones).forEach(key => {
        if (!formData.especificaciones[key]) {
            delete formData.especificaciones[key];
        }
    });
    
    // Si no hay especificaciones, eliminar el objeto completo
    if (Object.keys(formData.especificaciones).length === 0) {
        delete formData.especificaciones;
    }
    
    // Validaciones básicas
    if (!formData.nombre || !formData.categoria) {
        showMessage('Por favor completa todos los campos requeridos', 'error');
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
            await updateProduct(editingId, formData);
            cancelEdit();
        } else {
            await createProduct(formData);
            document.getElementById('product-form').reset();
        }
        
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
    // Verificar configuración de MongoDB
    if (MONGODB_API_URL === 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1' || 
        MONGODB_API_KEY === 'tu-api-key-aqui') {
        showMessage('⚠️ Usando modo demo con localStorage', 'info');
        document.getElementById('loading').innerHTML = `
            <div class="text-center py-8">
                <p class="text-blue-500 font-medium">🚀 Modo Demo Activo</p>
                <p class="text-gray-600 mt-2">
                    Los datos se guardan en localStorage. Para usar MongoDB real, configura las credenciales en app.js
                </p>
                <div class="mt-4 p-4 bg-green-50 rounded-lg text-left">
                    <p class="text-sm font-medium text-gray-700 mb-2">Estructura de documento NoSQL:</p>
                    <pre class="text-xs text-gray-600 bg-white p-2 rounded border">
{
  "_id": "unique_id",
  "nombre": "string",
  "precio": "number",
  "categoria": "string", 
  "stock": "number",
  "tags": ["array", "flexible"],
  "especificaciones": {
    "marca": "string",
    "modelo": "string"
  },
  "fechaCreacion": "ISODate",
  "fechaActualizacion": "ISODate"
}</pre>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            loadProducts();
        }, 2000);
        return;
    }
    
    loadProducts();
});

// ====================================
// NOTAS PARA EL DESARROLLADOR
// ====================================

/*
CONFIGURACIÓN PARA MONGODB ATLAS:

1. Crear cluster en MongoDB Atlas
2. Configurar MongoDB Data API:
   - Ir a Data API en tu cluster
   - Crear endpoint personalizado
   - Obtener URL base y API Key

3. Estructura de documento NoSQL flexible:
{
  "_id": "unique_id",
  "nombre": "string",
  "precio": "number",
  "categoria": "string", 
  "stock": "number",
  "tags": ["array", "de", "strings"],        // ← Array dinámico
  "especificaciones": {                      // ← Objeto anidado
    "marca": "string",
    "modelo": "string",
    "color": "string",
    "garantia": "string"
  },
  "fechaCreacion": "ISODate",
  "fechaActualizacion": "ISODate"
}

CARACTERÍSTICAS NoSQL DEMOSTRADAS:
- ✅ Documentos flexibles (campos opcionales)
- ✅ Arrays dinámicos (tags)
- ✅ Objetos anidados (especificaciones)
- ✅ Esquema evolutivo (campos se agregan/quitan dinámicamente)
- ✅ IDs únicos (_id)
- ✅ Timestamps automáticos
- ✅ Flexibilidad en tipos de datos
- ✅ Sin restricciones de esquema rígido

DIFERENCIAS CON SQL:
- No requiere ALTER TABLE para nuevos campos
- Campos pueden ser opcionales sin definición previa
- Arrays y objetos nativos sin normalización
- Consultas por contenido de documento
- Escalabilidad horizontal nativa
*/
