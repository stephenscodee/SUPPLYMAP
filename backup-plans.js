// Backup Plans management
let backupPlans = [];
let suppliers = [];

async function loadBackupPlans() {
    try {
        [backupPlans, suppliers] = await Promise.all([
            endpoints.backupPlans.list(),
            endpoints.suppliers.list()
        ]);
        renderBackupPlans();
    } catch (error) {
        console.error('Error loading backup plans:', error);
        document.getElementById('backup-plans-list').innerHTML = 
            '<p class="loading">Error al cargar planes B</p>';
    }
}

function renderBackupPlans() {
    const container = document.getElementById('backup-plans-list');
    
    if (backupPlans.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">No hay planes B registrados</p>';
        return;
    }
    
    const supplierMap = new Map(suppliers.map(s => [s.id, s]));
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Proveedor Principal</th>
                    <th>Proveedor Alternativo</th>
                    <th>Tiempo Activación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${backupPlans.map(plan => {
                    const supplier = supplierMap.get(plan.supplier_id);
                    return `
                        <tr>
                            <td><strong>${supplier?.name || 'N/A'}</strong></td>
                            <td>${plan.alternative_supplier_name}</td>
                            <td>${plan.activation_time_hours ? plan.activation_time_hours + 'h' : '-'}</td>
                            <td>${plan.is_active ? '<span class="badge badge-success">Activo</span>' : '<span class="badge">Inactivo</span>'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editBackupPlan(${plan.id})">Editar</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteBackupPlan(${plan.id})">Eliminar</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function showBackupPlanForm(backupPlanId = null) {
    const plan = backupPlanId ? backupPlans.find(p => p.id === backupPlanId) : null;
    
    const supplierOptions = suppliers.map(s => 
        `<option value="${s.id}" ${plan?.supplier_id === s.id ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    
    const form = `
        <h2>${plan ? 'Editar' : 'Nuevo'} Plan B</h2>
        <form onsubmit="saveBackupPlan(event, ${backupPlanId || 'null'})">
            <div class="form-group">
                <label>Proveedor Principal *</label>
                <select name="supplier_id" required>
                    <option value="">Seleccionar...</option>
                    ${supplierOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Nombre Proveedor Alternativo *</label>
                <input type="text" name="alternative_supplier_name" value="${plan?.alternative_supplier_name || ''}" required>
            </div>
            <div class="form-group">
                <label>Contacto</label>
                <input type="text" name="contact_name" value="${plan?.contact_name || ''}">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${plan?.email || ''}">
            </div>
            <div class="form-group">
                <label>Teléfono</label>
                <input type="text" name="phone" value="${plan?.phone || ''}">
            </div>
            <div class="form-group">
                <label>Tiempo de Activación (horas)</label>
                <input type="number" step="0.1" name="activation_time_hours" value="${plan?.activation_time_hours || ''}">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="is_active" ${plan?.is_active ? 'checked' : ''}>
                    Plan B ya activo/contratado
                </label>
            </div>
            <div class="form-group">
                <label>Checklist de Activación</label>
                <textarea name="activation_checklist" placeholder="Lista de pasos para activar el plan B">${plan?.activation_checklist || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Notas</label>
                <textarea name="notes">${plan?.notes || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    `;
    
    showModal(form);
}

async function saveBackupPlan(event, backupPlanId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        supplier_id: parseInt(formData.get('supplier_id')),
        alternative_supplier_name: formData.get('alternative_supplier_name'),
        contact_name: formData.get('contact_name') || null,
        email: formData.get('email') || null,
        phone: formData.get('phone') || null,
        activation_time_hours: formData.get('activation_time_hours') ? parseFloat(formData.get('activation_time_hours')) : null,
        is_active: formData.has('is_active'),
        activation_checklist: formData.get('activation_checklist') || null,
        notes: formData.get('notes') || null
    };
    
    try {
        if (backupPlanId) {
            await endpoints.backupPlans.update(backupPlanId, data);
        } else {
            await endpoints.backupPlans.create(data);
        }
        closeModal();
        loadBackupPlans();
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    } catch (error) {
        alert('Error al guardar plan B: ' + error.message);
    }
}

function editBackupPlan(id) {
    showBackupPlanForm(id);
}

async function deleteBackupPlan(id) {
    if (!confirm('¿Estás seguro de eliminar este plan B?')) return;
    
    try {
        await endpoints.backupPlans.delete(id);
        loadBackupPlans();
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    } catch (error) {
        alert('Error al eliminar plan B: ' + error.message);
    }
}

