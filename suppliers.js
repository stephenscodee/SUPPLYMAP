// Suppliers management
let suppliers = [];

async function loadSuppliers() {
    try {
        suppliers = await endpoints.suppliers.list();
        renderSuppliers();
    } catch (error) {
        console.error('Error loading suppliers:', error);
        document.getElementById('suppliers-list').innerHTML = 
            '<p class="loading">Error al cargar proveedores</p>';
    }
}

function renderSuppliers() {
    const container = document.getElementById('suppliers-list');
    
    if (suppliers.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">No hay proveedores registrados</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Riesgo</th>
                    <th>Contacto</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${suppliers.map(supplier => `
                    <tr>
                        <td><strong>${supplier.name}</strong></td>
                        <td>${supplier.category || '-'}</td>
                        <td><span class="badge badge-${supplier.risk_level}">${supplier.risk_level}</span></td>
                        <td>${supplier.email || supplier.phone || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editSupplier(${supplier.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${supplier.id})">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showSupplierForm(supplierId = null) {
    const supplier = supplierId ? suppliers.find(s => s.id === supplierId) : null;
    
    const form = `
        <h2>${supplier ? 'Editar' : 'Nuevo'} Proveedor</h2>
        <form onsubmit="saveSupplier(event, ${supplierId || 'null'})">
            <div class="form-group">
                <label>Nombre *</label>
                <input type="text" name="name" value="${supplier?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Contacto</label>
                <input type="text" name="contact_name" value="${supplier?.contact_name || ''}">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${supplier?.email || ''}">
            </div>
            <div class="form-group">
                <label>Teléfono</label>
                <input type="text" name="phone" value="${supplier?.phone || ''}">
            </div>
            <div class="form-group">
                <label>Categoría</label>
                <input type="text" name="category" value="${supplier?.category || ''}" placeholder="Ej: Logística, IT, Contabilidad">
            </div>
            <div class="form-group">
                <label>Nivel de Riesgo</label>
                <select name="risk_level" required>
                    <option value="low" ${supplier?.risk_level === 'low' ? 'selected' : ''}>Bajo</option>
                    <option value="medium" ${supplier?.risk_level === 'medium' ? 'selected' : ''}>Medio</option>
                    <option value="high" ${supplier?.risk_level === 'high' ? 'selected' : ''}>Alto</option>
                    <option value="critical" ${supplier?.risk_level === 'critical' ? 'selected' : ''}>Crítico</option>
                </select>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea name="description">${supplier?.description || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    `;
    
    showModal(form);
}

async function saveSupplier(event, supplierId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        if (supplierId) {
            await endpoints.suppliers.update(supplierId, data);
        } else {
            await endpoints.suppliers.create(data);
        }
        closeModal();
        loadSuppliers();
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    } catch (error) {
        alert('Error al guardar proveedor: ' + error.message);
    }
}

function editSupplier(id) {
    showSupplierForm(id);
}

async function deleteSupplier(id) {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    
    try {
        await endpoints.suppliers.delete(id);
        loadSuppliers();
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    } catch (error) {
        alert('Error al eliminar proveedor: ' + error.message);
    }
}

