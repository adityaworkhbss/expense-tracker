import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://expense-tracker-x0gb.onrender.com');
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  googleLogin: (idToken: string) => api.post('/auth/google', { idToken }).then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
  updateProfile: (data: any) => api.put('/auth/profile', data).then(res => res.data),
};

export const analyticsApi = {
  getExcelDashboard: () => api.get('/analytics/excel-dashboard').then(res => res.data),
  getSummary: (from?: string, to?: string) => api.get('/analytics/summary', { params: { from, to } }).then(res => res.data),
  getDaily: (from: string, to: string) => api.get('/analytics/daily', { params: { from, to } }).then(res => res.data),
  getCurrentSalaryCycle: () => api.get('/analytics/salary-cycle/current').then(res => res.data),
  getCategoryWise: (from: string, to: string) => api.get('/analytics/category-wise', { params: { from, to } }).then(res => res.data),
  getCashflow: (from: string, to: string) => api.get('/analytics/cashflow', { params: { from, to } }).then(res => res.data),
};

export const transactionsApi = {
  getTransactions: (params?: any) => api.get('/transactions', { params }).then(res => res.data),
  getTransaction: (id: string) => api.get(`/transactions/${id}`).then(res => res.data),
  createTransaction: (data: any) => api.post('/transactions', data).then(res => res.data),
  updateTransaction: (id: string, data: any) => api.put(`/transactions/${id}`, data).then(res => res.data),
  deleteTransaction: (id: string) => api.delete(`/transactions/${id}`).then(res => res.data),
};

export const categoriesApi = {
  getCategories: () => api.get('/categories').then(res => res.data),
  createCategory: (data: any) => api.post('/categories', data).then(res => res.data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data).then(res => res.data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`).then(res => res.data),
};

export const accountsApi = {
  getAccounts: () => api.get('/accounts').then(res => res.data),
  createAccount: (data: any) => api.post('/accounts', data).then(res => res.data),
  updateAccount: (id: string, data: any) => api.put(`/accounts/${id}`, data).then(res => res.data),
  deleteAccount: (id: string) => api.delete(`/accounts/${id}`).then(res => res.data),
};

export const emisApi = {
  getEmis: () => api.get('/emis').then(res => res.data),
  createEmi: (data: any) => api.post('/emis', data).then(res => res.data),
  deleteEmi: (id: string) => api.delete(`/emis/${id}`).then(res => res.data),
};

export const recurringApi = {
  getRecurring: () => api.get('/recurring-transactions').then(res => res.data),
  createRecurring: (data: any) => api.post('/recurring-transactions', data).then(res => res.data),
  updateRecurring: (id: string, data: any) => api.put(`/recurring-transactions/${id}`, data).then(res => res.data),
  deleteRecurring: (id: string) => api.delete(`/recurring-transactions/${id}`).then(res => res.data),
};

export default api;
