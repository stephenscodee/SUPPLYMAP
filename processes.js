// Processes management
let processes = [];

async function loadProcesses() {
    try {
        processes = await endpoints.processes.list();
        renderProcesses();
    } catch (error) {
        console.error('Error loading processes:', error);
        document.getElementById('processes-list').innerHTML = 
            '<p class="loading">Error al cargar procesos</p>';
    }
}

function renderProcesses() {
    const container = document.getElementById('processes-list');
    
    if (processes.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">No hay procesos registrados</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Departamento</th>
                    <th>Tiempo Recuperación</th>
                    <th>Impacto Económico</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${processes.map(process => `
                    <tr>
                        <td><strong>${process.name}</strong></td>
                        <td>${process.department || '-'}</td>
                        <td>${process.estimated_recovery_time_hours ? process.estimated_recovery_time_hours + 'h' : '-'}</td>
                        <td>${process.estimated_economic_impact ? formatCurrency(process.estimated_economic_impact) : '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editProcess(${process.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProcess(${process.id})">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showProcessForm(processId = null) {
    const process = processId ? processes.find(p => p.id === processId) : null;
    
    const form = `
        <h2>${process ? 'Editar' : 'Nuevo'} Proceso</h2>
        <form onsubmit="saveProcess(event, ${processId || 'null'})">
            <div class="form-group">
                <label>Nombre *</label>
                <input type="text" name="name" value="${process?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Departamento</label>
                <input type="text" name="department" value="${process?.department || ''}" placeholder="Ej: Operaciones, Ventas, Contabilidad">
            </div>
            <div class="form-group">
                <label>Tiempo de Recuperación Estimado (horas)</label>
                <input type="number" step="0.1" name="estimated_recovery_time_hours" value="${process?.estimated_recovery_time_hours || ''}">
            </div>
            <div class="form-group">
                <label>Impacto Económico Estimado (€)</label>
                <input type="number" step="0.01" name="estimated_economic_impact" value="${process?.estimated_economic_impact || ''}">
            </div>
            <div class="form-group">
                <label>Descripción</label>
                <textarea name="description">${process?.description || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    `;
    
    showModal(form);
}

async function saveProcess(event, processId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Convert numeric fields
    if (data.estimated_recovery_time_hours) {
        data.estimated_recovery_time_hours = parseFloat(data.estimated_recovery_time_hours);
    }
    if (data.estimated_economic_impact) {
        data.estimated_economic_impact = parseFloat(data.estimated_economic_impact);
    }
    
    try {
        if (processId) {
            await endpoints.processes.update(processId, data);
        } else {
            await endpoints.processes.create(data);
        }
        closeModal();
        loadProcesses();
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    } catch (error) {
        alert('Error al guardar proceso: ' + error.message);
    }
}

function editProcess(id) {
    showProcessForm(id);
}

async function deleteProcess(id) {
    if (!confirm('¿Estás seguro de eliminar este proceso?')) return;
    
    try {
        await endpoints.processes.delete(id);
        loadProcesses();
        if (document.getElementById('dashboard').classList.contains('active')) {
            loadDashboard();
        }
    } catch (error) {
        alert('Error al eliminar proceso: ' + error.message);
    }
}

function formatCurrency(value) {
    if (!value || value === 0) return '0 €';
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

