import { api } from './client';

export const personasAPI = {
  list: (includeArchived = false) => api.get(`/personas?includeArchived=${includeArchived}`),
  getById: (id) => api.get(`/personas/${id}`),
  create: (data) => api.post('/personas', data),
  update: (personaId, data) => api.put(`/personas/${personaId}`, data),
  updateAll: (data) => api.put('/personas', data),
};

