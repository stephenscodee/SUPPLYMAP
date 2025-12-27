# Dependia Frontend

Interfaz web para Dependia - Visibilidad de riesgo operativo.

## 🚀 Inicio Rápido

### Opción 1: Servidor HTTP Simple

```bash
# Desde el directorio frontend
python -m http.server 3000
```

Luego abre: http://localhost:3000

### Opción 2: Servidor con CORS habilitado

Si tienes problemas de CORS, usa un servidor que permita CORS o configura el backend para aceptar tu origen.

## 📁 Estructura

```
frontend/
├── index.html          # Página principal
├── css/
│   └── style.css      # Estilos
├── js/
│   ├── api.js         # Cliente API
│   ├── main.js        # Lógica principal
│   ├── dashboard.js   # Dashboard y métricas
│   ├── suppliers.js   # Gestión de proveedores
│   ├── processes.js   # Gestión de procesos
│   ├── dependencies.js # Gestión de dependencias
│   └── backup-plans.js # Gestión de planes B
└── README.md
```

## 🎨 Características

- **Dashboard con métricas clave**:
  - Procesos con dependencia única (puntos de fallo críticos)
  - Proveedores sin plan B
  - Dependencias críticas
  - Proveedores de alto riesgo
  - Impacto económico y tiempo de recuperación agregados

- **Gestión completa CRUD**:
  - Proveedores
  - Procesos
  - Dependencias
  - Planes B

- **Interfaz moderna y responsive**

## ⚙️ Configuración

Asegúrate de que el backend esté corriendo en `http://localhost:8000` o modifica `API_BASE_URL` en `js/api.js`.

## 🔧 Desarrollo

El frontend es vanilla JavaScript, sin dependencias. Fácil de modificar y extender.

Para producción, considera:
- Minificar CSS/JS
- Usar un bundler si crece la complejidad
- Implementar autenticación
- Añadir tests

