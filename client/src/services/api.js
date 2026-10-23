import axios from 'axios';

const getBaseURL = () => {
  const envUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? 'https://stocksence-vhf9.onrender.com' : '/api');
  if (envUrl === '/api') return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ss_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ss_token');
      // Let components handle redirect via AuthContext
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Dashboard
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getSalesTrend: () => api.get('/dashboard/sales-trend'),
  getRecentSales: () => api.get('/dashboard/recent-sales'),
  getLowStock: () => api.get('/dashboard/low-stock'),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  seed: () => api.post('/products/seed'),
};

// Inventory
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  adjust: (data) => api.post('/inventory/adjust', data),
  getLogs: () => api.get('/inventory/logs'),
};

// Sales
export const salesAPI = {
  getAll: () => api.get('/sales'),
  create: (data) => api.post('/sales', data),
};

// Alerts
export const alertsAPI = {
  getAll: () => api.get('/alerts'),
};

// Health
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
