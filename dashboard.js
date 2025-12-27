// Dashboard functionality
async function loadDashboard() {
    try {
        const metrics = await endpoints.dashboard.metrics();
        updateDashboardMetrics(metrics);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('single-dependency-count').textContent = 'Error';
        document.getElementById('no-backup-count').textContent = 'Error';
    }
}

function updateDashboardMetrics(metrics) {
    // Métricas principales
    document.getElementById('single-dependency-count').textContent = metrics.processes_with_single_dependency;
    document.getElementById('no-backup-count').textContent = metrics.suppliers_without_backup;
    document.getElementById('critical-deps-count').textContent = metrics.critical_dependencies_count;
    document.getElementById('high-risk-count').textContent = metrics.high_risk_suppliers_count;
    
    // Totales
    document.getElementById('total-suppliers').textContent = metrics.total_suppliers;
    document.getElementById('total-processes').textContent = metrics.total_processes;
    document.getElementById('total-dependencies').textContent = metrics.total_dependencies;
    
    // Impacto
    document.getElementById('total-recovery-time').textContent = 
        metrics.total_estimated_recovery_time_hours.toFixed(1);
    document.getElementById('total-economic-impact').textContent = 
        formatCurrency(metrics.total_estimated_economic_impact);
    
    // Listas de riesgo
    renderSingleDependencyList(metrics.processes_with_single_dependency_list);
    renderNoBackupList(metrics.suppliers_without_backup_list);
}

function renderSingleDependencyList(list) {
    const container = document.getElementById('single-dependency-list');
    
    if (list.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem;">No hay procesos con dependencia única. ✅</p>';
        return;
    }
    
    container.innerHTML = list.map(item => `
        <div class="risk-item critical">
            <h4>${item.process.name}</h4>
            <p><strong>Proveedor único:</strong> ${item.supplier_name}</p>
            <p><strong>Tipo:</strong> <span class="badge badge-${item.dependency_type}">${item.dependency_type}</span></p>
            ${item.process.department ? `<p><strong>Departamento:</strong> ${item.process.department}</p>` : ''}
        </div>
    `).join('');
}

function renderNoBackupList(list) {
    const container = document.getElementById('no-backup-list');
    
    if (list.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem;">Todos los proveedores tienen plan B. ✅</p>';
        return;
    }
    
    container.innerHTML = list.map(item => `
        <div class="risk-item">
            <h4>${item.supplier.name}</h4>
            <p><strong>Riesgo:</strong> <span class="badge badge-${item.supplier.risk_level}">${item.supplier.risk_level}</span></p>
            <p><strong>Procesos afectados:</strong> ${item.affected_processes_count}</p>
            ${item.supplier.category ? `<p><strong>Categoría:</strong> ${item.supplier.category}</p>` : ''}
        </div>
    `).join('');
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

// Cargar dashboard cuando se muestra la pestaña
document.addEventListener('DOMContentLoaded', () => {
    const dashboardTab = document.querySelector('[data-tab="dashboard"]');
    if (dashboardTab) {
        dashboardTab.addEventListener('click', () => {
            loadDashboard();
        });
    }
    
    // Cargar dashboard inicial si está activo
    if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboard();
    }
});

