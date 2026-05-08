import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : (process.env.REACT_APP_API_URL || 'http://localhost:8000/api');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats').then(res => res.data),
  getSitesSummary: () => api.get('/dashboard/sites-summary').then(res => res.data),
};

export const vpnService = {
  getAll: () => api.get('/vpn').then(res => res.data),
  connect: (id) => api.post(`/vpn/${id}/connect`).then(res => res.data),
  disconnect: (id) => api.post(`/vpn/${id}/disconnect`).then(res => res.data),
};

export default api;
