import axios from 'axios';

// Use the correct base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5003';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
});

// Create ML API instance
const mlApi = axios.create({
    baseURL: ML_API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Add request interceptor for authentication
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', {
            method: config.method,
            url: config.url,
            data: config.data,
            headers: config.headers,
            baseURL: config.baseURL
        });
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add ML API interceptors
mlApi.interceptors.response.use(
    response => response,
    error => {
        console.error('ML API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

mlApi.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('ML API Request:', {
            method: config.method,
            url: config.url,
            data: config.data,
            headers: config.headers,
            baseURL: config.baseURL
        });
        return config;
    },
    error => {
        console.error('ML API Request Error:', error);
        return Promise.reject(error);
    }
);

//auth API calls
export const authAPI = {
    login: async (data) => {
        try {
            console.log('Login request data:', data);
            const response = await api.post('/api/auth/login', data);
            console.log('Login response:', response);
            return response.data;
        } catch (error) {
            console.error('Error during login:', error.response?.data || error.message);
            throw error;
        }
    },
    register: async (data) => {
        try {
            console.log('Register request data:', data);
            const response = await api.post('/api/auth/register', data);
            console.log('Register response:', response);
            return response.data;
        } catch (error) {
            console.error('Error during registration:', error.response?.data || error.message);
            throw error;
        }
    },
    logout: () => api.post('/api/auth/logout')
};

// Inventory API calls
export const inventoryAPI = {
    getAll: async () => {
        try {
            console.log('Fetching inventory data...');
            const response = await api.get('/api/inventory');
            console.log('Inventory response:', response);
            if (!response.data) {
                throw new Error('No data received from server');
            }
            return response;
        } catch (error) {
            console.error('Error fetching inventory:', error.response?.data || error.message);
            throw error;
        }
    },
    getDrugTypes: async () => {
        try {
            console.log('Fetching drug types...');
            const response = await api.get('/api/drugs/types');
            console.log('Drug types response:', response);
            if (!response.data) {
                throw new Error('No drug types data received');
            }
            // Handle both array and object response formats
            const drugTypes = Array.isArray(response.data) ? response.data : 
                            response.data.drugs || [];
            return drugTypes;
        } catch (error) {
            console.error('Error fetching drug types:', error);
            // Return empty array instead of throwing to prevent UI breaks
            return [];
        }
    },
    create: async (data) => {
        try {
            console.log('Creating new drug with data:', data);
            const response = await api.post('/api/inventory', data);
            return response;
        } catch (error) {
            console.error('Error creating inventory item:', error);
            throw error;
        }
    },
    update: async (id, data) => {
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'document' && data[key] instanceof File) {
                    formData.append(key, data[key]);
                } else {
                    formData.append(key, data[key]);
                }
            });

            return api.patch(`/api/inventory/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            console.error('Error updating inventory item:', error);
            throw error;
        }
    },
    delete: (id) => api.delete(`/api/inventory/${id}`)
};

// Sales API calls
export const salesAPI = {
    getAll: async () => {
        try {
            const response = await api.get('/api/sales');
            console.log('API getAll response:', response);
            return { data: response.data || [] };
        } catch (error) {
            console.error('Error fetching sales:', error);
            return { data: [] };
        }
    },
    getById: (id) => api.get(`/api/sales/${id}`),
    create: async (data) => {
        try {
            console.log('API create request data:', data);
            const response = await api.post('/api/sales', data);
            console.log('API create response:', response);
            return { data: response.data };
        } catch (error) {
            console.error('Error creating sale:', error);
            throw error;
        }
    },
    updateStatus: async (id, status) => {
        try {
            console.log(`Updating status for sale ${id} to ${status}`);
            const response = await api.patch(`/api/sales/${id}`, { status });
            console.log('Status update successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    },
    getStats: async () => {
        try {
            console.log('Fetching sales statistics...');
            const response = await api.get('/api/sales/stats/summary');
            console.log('Sales statistics response:', response);
            return { data: response.data };
        } catch (error) {
            console.error('Error fetching sales stats:', error);
            return { 
                data: {
                    totalSales: 0,
                    monthlyGrowth: 0,
                    averageOrder: 0,
                    totalOrders: 0,
                    recentTransactions: []
                }
            };
        }
    }
};

// Tracking API calls
export const trackingAPI = {
    getAll: async () => {
        try {
            const response = await api.get('/tracking');
            return response.data;
        } catch (error) {
            console.error('Error fetching tracking data:', error);
            return [];
        }
    },
    getById: (id) => api.get(`/api/tracking/${id}`),
    create: async (data) => {
        try {
            const response = await api.post('/tracking', data);
            return response.data;
        } catch (error) {
            console.error('Error creating tracking entry:', error);
            throw error;
        }
    },
    update: (id, data) => api.patch(`/api/tracking/${id}`, data),
    updateStatus: async (id, status) => {
        try {
            const response = await api.put(`/tracking/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating tracking status:', error);
            throw error;
        }
    },
    getHistory: async () => {
        try {
            const response = await api.get('/tracking/history');
            return response.data;
        } catch (error) {
            console.error('Error fetching tracking history:', error);
            return [];
        }
    }
};

// ML API calls
export const mlAPI = {
    getDrugTypes: async () => {
        try {
            console.log('Fetching drug types from ML service...');
            const response = await mlApi.get('/drugs/types');
            console.log('ML drug types response:', response);
            if (!response.data) {
                throw new Error('No drug types data received from ML service');
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching drug types from ML service:', error);
            throw error;
        }
    },
    predictForecast: async (data) => {
        try {
            console.log('Making prediction request to ML service:', data);
            const response = await mlApi.post('/predict/forecast', data);
            console.log('ML prediction response:', response);
            if (!response.data) {
                throw new Error('No prediction data received from ML service');
            }
            return response.data;
        } catch (error) {
            console.error('Error making prediction with ML service:', error);
            throw error;
        }
    }
};

export default api; 