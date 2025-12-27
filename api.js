// Configuración de la API
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Utilidades para llamadas API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
            throw new Error(error.detail || `Error ${response.status}`);
        }

        // Para DELETE que retorna 204
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Métodos HTTP
const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};

// Endpoints específicos
const endpoints = {
    // Dashboard
    dashboard: {
        metrics: () => api.get('/dashboard/metrics')
    },
    
    // Suppliers
    suppliers: {
        list: () => api.get('/suppliers'),
        get: (id) => api.get(`/suppliers/${id}`),
        create: (data) => api.post('/suppliers', data),
        update: (id, data) => api.put(`/suppliers/${id}`, data),
        delete: (id) => api.delete(`/suppliers/${id}`)
    },
    
    // Processes
    processes: {
        list: () => api.get('/processes'),
        get: (id) => api.get(`/processes/${id}`),
        create: (data) => api.post('/processes', data),
        update: (id, data) => api.put(`/processes/${id}`, data),
        delete: (id) => api.delete(`/processes/${id}`)
    },
    
    // Dependencies
    dependencies: {
        list: () => api.get('/dependencies'),
        get: (id) => api.get(`/dependencies/${id}`),
        create: (data) => api.post('/dependencies', data),
        update: (id, data) => api.put(`/dependencies/${id}`, data),
        delete: (id) => api.delete(`/dependencies/${id}`)
    },
    
    // Backup Plans
    backupPlans: {
        list: () => api.get('/backup-plans'),
        get: (id) => api.get(`/backup-plans/${id}`),
        create: (data) => api.post('/backup-plans', data),
        update: (id, data) => api.put(`/backup-plans/${id}`, data),
        delete: (id) => api.delete(`/backup-plans/${id}`)
    }
};

