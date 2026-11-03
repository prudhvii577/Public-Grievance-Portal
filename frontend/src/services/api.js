import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pgrp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('pgrp_token');
        localStorage.removeItem('pgrp_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 1. Authentication APIs
export const authAPI = {
  register: (userData) => api.post('/api/auth/register/', userData),
  login: (credentials) => api.post('/api/auth/login/', credentials),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (profileData) => api.put('/api/auth/profile/', profileData),
  changePassword: (passwordData) => api.post('/api/auth/change-password/', passwordData),
  getOfficers: (departmentId) => api.get('/api/auth/officers/', { params: { department: departmentId } }),
  getUsers: (params) => api.get('/api/auth/admin/users/', { params }),
  createUser: (userData) => api.post('/api/auth/admin/users/', userData),
  updateUser: (id, userData) => api.put(`/api/auth/admin/users/${id}/`, userData),
  toggleUserStatus: (id, isActive) => api.patch(`/api/auth/admin/users/${id}/`, { is_active: isActive }),
};

// 2. Department APIs
export const departmentAPI = {
  getAll: () => api.get('/api/departments/'),
  getById: (id) => api.get(`/api/departments/${id}/`),
  create: (deptData) => api.post('/api/departments/', deptData),
  update: (id, deptData) => api.put(`/api/departments/${id}/`, deptData),
  toggleStatus: (id) => api.post(`/api/departments/${id}/toggle_status/`),
};

// 3. Complaint APIs
export const complaintAPI = {
  getAll: (params) => api.get('/api/complaints/', { params }),
  getById: (id) => api.get(`/api/complaints/${id}/`),
  trackById: (trackingId) => api.get(`/api/complaints/track/${encodeURIComponent(trackingId)}/`),
  create: (formData) => api.post('/api/complaints/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  assign: (id, assignData) => api.post(`/api/complaints/${id}/assign/`, assignData),
  updateStatus: (id, statusData) => api.post(`/api/complaints/${id}/update_status/`, statusData),
  reopen: (id, reopenData) => api.post(`/api/complaints/${id}/reopen/`, reopenData),
  getStats: () => api.get('/api/complaints/stats/dashboard/'),
  getCategories: () => api.get('/api/complaints/categories/'),
  createCategory: (catData) => api.post('/api/complaints/categories/', catData),
  updateCategory: (id, catData) => api.put(`/api/complaints/categories/${id}/`, catData),
  getReportsAnalytics: () => api.get('/api/complaints/reports/analytics/'),
};

// 4. Feedback APIs
export const feedbackAPI = {
  submit: (feedbackData) => api.post('/api/feedback/submit/', feedbackData),
  getByComplaint: (complaintId) => api.get(`/api/feedback/complaint/${complaintId}/`),
  getAll: () => api.get('/api/feedback/'),
};

export default api;
