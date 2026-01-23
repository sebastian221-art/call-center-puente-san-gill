import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para errores
client.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// STORES API
// ============================================
export const storesAPI = {
  getAll: (params) => client.get('/stores', { params }),
  getById: (id) => client.get(`/stores/${id}`),
  create: (data) => client.post('/stores', data),
  update: (id, data) => client.put(`/stores/${id}`, data),
  delete: (id) => client.delete(`/stores/${id}`),
  getByCategory: (category) => client.get(`/stores/category/${category}`)
};

// ============================================
// CONVERSATIONS API (NUEVO)
// ============================================
export const conversationsAPI = {
  getAll: (params) => client.get('/conversations', { params }),
  getRecent: (limit = 10) => client.get('/conversations/recent', { params: { limit } }),
  getById: (callSid) => client.get(`/conversations/${callSid}`),
  getSummary: () => client.get('/conversations/stats/summary'),
  getByDay: (days = 7) => client.get('/conversations/stats/by-day', { params: { days } })
};

// ============================================
// ANALYTICS API
// ============================================
export const analyticsAPI = {
  getSummary: () => client.get('/analytics/summary'),
  getConversations: () => client.get('/analytics/conversations'),
  getErrors: () => client.get('/analytics/errors'),
  getLearning: () => client.get('/analytics/learning'),
  getTopIntents: (limit) => client.get('/analytics/top-intents', { params: { limit } }),
  getTopStores: (limit) => client.get('/analytics/top-stores', { params: { limit } }),
  cleanup: () => client.post('/analytics/cleanup')
};

// ============================================
// LEARNING API
// ============================================
export const learningAPI = {
  getKeywordSuggestions: (minFrequency) => 
    client.get('/learning/suggestions/keywords', { params: { minFrequency } }),
  getIntentSuggestions: (minFrequency) => 
    client.get('/learning/suggestions/intents', { params: { minFrequency } }),
  getConfidenceAdjustments: () => 
    client.get('/learning/suggestions/confidence'),
  approveKeyword: (data) => 
    client.post('/learning/approve/keyword', data),
  approveIntent: (data) => 
    client.post('/learning/approve/intent', data),
  reset: () => 
    client.post('/learning/reset')
};

// ============================================
// SETTINGS API
// ============================================
export const settingsAPI = {
  getAll: () => client.get('/settings'),
  update: (data) => client.put('/settings', data),
  getVoice: () => client.get('/settings/voice'),
  updateVoice: (data) => client.put('/settings/voice', data),
  getOptimization: () => client.get('/settings/optimization'),
  updateOptimization: (data) => client.put('/settings/optimization', data),
  getLearning: () => client.get('/settings/learning'),
  updateLearning: (data) => client.put('/settings/learning', data),
  reset: () => client.post('/settings/reset')
};

export default client;