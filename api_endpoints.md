# SinglePoint MVP - API Endpoints

## Autenticación
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Dashboard Principal
```
GET /api/dashboard/metrics
# Respuesta: métricas clave de risk_metrics view

GET /api/dashboard/alerts
# Query params: ?severity=critical&unresolved=true
# Respuesta: alertas activas ordenadas por severidad
```

## Proveedores
```
GET    /api/suppliers
POST   /api/suppliers
GET    /api/suppliers/{id}
PUT    /api/suppliers/{id}
DELETE /api/suppliers/{id}

GET /api/suppliers/{id}/dependencies
# Todas las dependencias de un proveedor

GET /api/suppliers/{id}/risk-score
# Score basado en procesos críticos + planes B
```

## Procesos
```
GET    /api/processes
POST   /api/processes
GET    /api/processes/{id}
PUT    /api/processes/{id}
DELETE /api/processes/{id}

GET /api/processes/{id}/dependencies
# Todos los proveedores de los que depende este proceso

GET /api/processes/{id}/single-points
# Alerta si este proceso tiene dependencias únicas
```

## Dependencias (Core del MVP)
```
GET    /api/dependencies
POST   /api/dependencies
GET    /api/dependencies/{id}
PUT    /api/dependencies/{id}
DELETE /api/dependencies/{id}

GET /api/dependencies/critical
# Solo dependencias críticas

GET /api/dependencies/single-points
# Puntos únicos de fallo (más importante)

GET /api/dependencies/no-contingency
# Dependencias sin plan B
```

## Planes de Contingencia
```
GET    /api/contingency-plans
POST   /api/contingency-plans
GET    /api/contingency-plans/{id}
PUT    /api/contingency-plans/{id}
DELETE /api/contingency-plans/{id}

GET /api/contingency-plans/missing
# Lista de dependencias que necesitan plan B
```

## Análisis y Reportes
```
GET /api/reports/dependency-map
# Mapa completo de dependencias para visualización

GET /api/reports/risk-summary
# Resumen ejecutivo de riesgos

GET /api/reports/process-impact/{process_id}
# "Qué pasa si falla" para un proceso específico

GET /api/reports/supplier-failure/{supplier_id}
# Impacto cascada si un proveedor falla

POST /api/reports/export
# Exportar a CSV/PDF
```

## Ejemplos de Payload

### POST /api/dependencies
```json
{
  "process_id": "uuid",
  "supplier_id": "uuid", 
  "dependency_type": "critical",
  "description": "Sistema de facturación electrónica",
  "failure_impact": "No se pueden emitir facturas, paro de facturación 48h"
}
```

### GET /api/dashboard/metrics
```json
{
  "total_processes": 12,
  "total_suppliers": 28,
  "critical_dependencies": 5,
  "dependencies_without_plan": 8,
  "single_point_dependencies": 3,
  "active_alerts": 2
}
```

### GET /api/dependencies/single-points
```json
[
  {
    "id": "uuid",
    "process_name": "Facturación mensual",
    "supplier_name": "ERP Cloud S.L.",
    "impact_level": 5,
    "recovery_time_hours": 48,
    "revenue_impact": 50000.00,
    "has_contingency": false
  }
]
```

## Validaciones Clave

- No permitir eliminar proveedor/proceso con dependencias activas
- Obligar descripción en dependencias críticas
- Validar que recovery_time_hours > 0 para procesos críticos
- Score de riesgo automático al crear dependencia
