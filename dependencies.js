// Dependencies management
let dependencies = [];
let suppliers = [];
let processes = [];

async function loadDependencies() {
    try {
        [dependencies, suppliers, processes] = await Promise.all([
            endpoints.dependencies.list(),
            endpoints.suppliers.list(),
            endpoints.processes.list()
        ]);
        renderDependencies();
    } catch (error) {
        console.error('Error loading dependencies:', error);
        document.getElementById('dependencies-list').innerHTML = 
            '<p class="loading">Error al cargar dependencias</p>';
    }
}

function renderDependencies() {
    const container = document.getElementById('dependencies-list');
    
    if (dependencies.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">No hay dependencias registradas</p>';
        return;
    }
    
    // Create lookup maps
    const supplierMap = new Map(suppliers.map(s => [s.id, s]));
    const processMap = new Map(processes.map(p => [p.id, p]));
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Proveedor</th>
                    <th>Proceso</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${dependencies.map(dep => {
                    const supplier = supplierMap.get(dep.supplier_id);
                    const process = processMap.get(dep.process_id);
                    return `
                        <tr>
                            <td><strong>${supplier?.name || 'N/A'}</strong></td>
                            <td>${process?.name || 'N/A'}</td>
                            <td><span class="badge badge-${dep.dependency_type}">${dep.dependency_type}</span></td>
                            <td>${dep.description || '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="editDependency(${dep.id})">Editar</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteDependency(${dep.id})">Eliminar</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function showDependencyForm(dependencyId = null) {
    const dependency = dependencyId ? dependencies.find(d => d.id === dependencyId) : null;
    
    const supplierOptions = suppliers.map(s => 
        `<option value="${s.id}" ${dependency?.supplier_id === s.id ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    
    const processOptions = processes.map(p => 
        `<option value="${p.id}" ${dependency?.process_id === p.id ? 'selected' : ''}>${p.name}</option>`
    ).join('');
    
    const form = `
        <h2>${dependency ? 'Editar' : 'Nueva'} Dependencia</h2>
        <form onsubmit="saveDependency(event, ${dependencyId || 'null'})">
            <div class="form-group">
                <label>Proveedor *</label>
                <select name="supplier_id" required>
                    <option value="">Seleccionar...</option>
                    ${supplierOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Proceso *</label>
                <select name="process_id" required>
                    <option value="">Seleccionar...</option>
                    ${processOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Tipo de Dependencia *</label>
                <select name="dependency_type" required>
                    <option value="critical" ${dependency?.dependency_type === 'critical' ? 'selected' : ''}>Crítica</option>
                    <option value="high" ${dependency?.dependency_type === 'high' ? 'selected' : ''}>Alta</option>
                    <option value="medium" ${dependency?.dependency_type === 'medium' ? 'selected' : ''}>Media</option>
                    <option value="low" ${dependency?.dependency_type === 'low' ? 'selected' : ''}>Baja</option>
                </select>
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea name="description" placeholder="Cómo afecta el proveedor al proceso">${dependency?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Notas</label>
                <textarea name="notes">${dependency?.notes || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    `;
    
    showModal(form);
}

async function saveDependency(event, dependencyId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        supplier_id: parseInt(formData.get('supplier_id')),
        process_id: parseInt(formData.get('process_id')),
        dependency_type: formData.get('dependency_type'),
        description: formData.get('description') || null,
        notes: formData.get('notes') || null
    };
    
    try {
        if (dependencyId) {
            await endpoints.dependencies.update(dependencyId, data);
        } else {
            await endpoints.dependencies.create(data);
        }
        closeModal();
        loadDependencies();
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    } catch (error) {
        alert('Error al guardar dependencia: ' + error.message);
    }
}

function editDependency(id) {
    showDependencyForm(id);
}

async function deleteDependency(id) {
    if (!confirm('¿Estás seguro de eliminar esta dependencia?')) return;
    
    try {
        await endpoints.dependencies.delete(id);
        loadDependencies();
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    } catch (error) {
        alert('Error al eliminar dependencia: ' + error.message);
    }
}

