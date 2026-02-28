import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (name, email, password, phone) =>
    api.post('/auth/register', { name, email, password, phone }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  createStaff: (name, email, password, phone) => api.post('/auth/create-staff', { name, email, password, phone }),
};

// Package API
export const packageAPI = {
  createPackage: (packageData) => api.post('/packages', packageData),
  getPackages: (params = {}) => api.get('/packages', { params }),
  getPackageById: (id) => api.get(`/packages/${id}`),
  updatePackageStatus: (id, statusData) => {
    // if FormData, axios will set appropriate headers automatically
    if (statusData instanceof FormData) {
      return api.put(`/packages/${id}/status`, statusData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/packages/${id}/status`, statusData);
  },
  deletePackage: (id) => api.delete(`/packages/${id}`),
};

export default api;
