-- SinglePoint MVP - Database Schema
-- Optimizado para visibilidad de riesgo operativo

-- Empresas/Clientes
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proveedores
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- ej: 'logística', 'software', 'servicios'
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    contract_value DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Procesos críticos del negocio
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- ej: 'facturación', 'producción', 'ventas'
    impact_level INTEGER CHECK (impact_level BETWEEN 1 AND 5), -- 1=bajo, 5=crítico
    revenue_impact DECIMAL(12,2), -- impacto económico mensual estimado
    recovery_time_hours INTEGER, -- tiempo estimado de recuperación si falla
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relaciones de dependencia (grafo dirigido)
CREATE TABLE dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL, -- 'critical', 'important', 'secondary'
    description TEXT, -- "provee sistema de facturación", "entrega materia prima X"
    failure_impact TEXT, -- qué pasa exactamente si falla
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(process_id, supplier_id) -- evitar duplicados
);

-- Planes B/Contingencia
CREATE TABLE contingency_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dependency_id UUID NOT NULL REFERENCES dependencies(id) ON DELETE CASCADE,
    alternative_supplier VARCHAR(255),
    activation_time_hours INTEGER, -- tiempo para activar plan B
    additional_cost DECIMAL(12,2), -- coste extra del plan B
    notes TEXT,
    has_plan BOOLEAN DEFAULT false,
    last_reviewed DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alertas de riesgo
CREATE TABLE risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    dependency_id UUID REFERENCES dependencies(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'single_dependency', 'no_contingency', 'high_impact'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para rendimiento
CREATE INDEX idx_suppliers_company ON suppliers(company_id);
CREATE INDEX idx_processes_company ON processes(company_id);
CREATE INDEX idx_dependencies_company ON dependencies(company_id);
CREATE INDEX idx_dependencies_process ON dependencies(process_id);
CREATE INDEX idx_dependencies_supplier ON dependencies(supplier_id);
CREATE INDEX idx_alerts_company ON risk_alerts(company_id);
CREATE INDEX idx_alerts_unresolved ON risk_alerts(company_id, is_resolved);

-- Vista para métricas clave
CREATE VIEW risk_metrics AS
SELECT 
    c.id as company_id,
    COUNT(DISTINCT p.id) as total_processes,
    COUNT(DISTINCT s.id) as total_suppliers,
    COUNT(DISTINCT d.id) as total_dependencies,
    COUNT(DISTINCT CASE WHEN d.dependency_type = 'critical' THEN d.id END) as critical_dependencies,
    COUNT(DISTINCT CASE WHEN cp.has_plan = false THEN d.id END) as dependencies_without_plan,
    COUNT(DISTINCT CASE 
        WHEN (SELECT COUNT(*) FROM dependencies d2 WHERE d2.process_id = d.process_id AND d2.is_active = true) = 1 
        THEN d.id 
    END) as single_point_dependencies,
    COUNT(DISTINCT ra.id) FILTER (WHERE ra.is_resolved = false) as active_alerts
FROM companies c
LEFT JOIN processes p ON c.id = p.company_id AND p.is_active = true
LEFT JOIN dependencies d ON c.id = d.company_id AND d.is_active = true
LEFT JOIN suppliers s ON d.supplier_id = s.id
LEFT JOIN contingency_plans cp ON d.id = cp.dependency_id
LEFT JOIN risk_alerts ra ON c.id = ra.company_id
GROUP BY c.id;
