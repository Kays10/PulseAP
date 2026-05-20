import axios from 'axios';
import { supabase } from '../supabaseClient';

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
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.session) {
      localStorage.setItem('token', data.session.access_token);
      const is_admin = data.user?.user_metadata?.is_admin || data.user?.app_metadata?.is_admin;
      localStorage.setItem('user_role', is_admin ? 'admin' : 'read-only');
      return data.session;
    }
  },
  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
  },
  isAdmin: () => {
    return localStorage.getItem('user_role') === 'admin';
  }
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats').then(res => res.data),
  getSitesSummary: () => api.get('/dashboard/sites-summary').then(res => res.data),
};

export const vpnService = {
  getAll: () => api.get('/vpn').then(res => res.data),
  create: (vpnData) => api.post('/vpn', vpnData).then(res => res.data),
  connect: (id) => api.post(`/vpn/${id}/connect`).then(res => res.data),
  disconnect: (id) => api.post(`/vpn/${id}/disconnect`).then(res => res.data),
};

export const userService = {
  getAll: () => api.get('/users').then(res => res.data),
  create: (userData) => api.post('/users', userData).then(res => res.data),
  delete: (id) => api.delete(`/users/${id}`).then(res => res.data),
  changePassword: (pwdData) => api.post('/users/change-password', pwdData).then(res => res.data),
  
  // Sites
  getAllSites: () => api.get('/sites').then(res => res.data),
  createSite: (siteData) => api.post('/sites', siteData).then(res => res.data),
  
  // Zones
  getAllZones: () => api.get('/zones').then(res => res.data),
  createZone: (zoneData) => api.post('/zones', zoneData).then(res => res.data),
  
  // Controllers
  getAllControllers: () => api.get('/controllers').then(res => res.data),
  createController: (controllerData) => api.post('/controllers', controllerData).then(res => res.data),
  
  // APs
  getAllAps: (zoneId) => api.get('/aps', { params: { zone_id: zoneId } }).then(res => res.data),
  
  // System
  initDb: () => api.post('/system/init-db').then(res => res.data),
};

export default api;
