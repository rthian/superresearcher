import { api } from './client';

export const personasAPI = {
  list: () => api.get('/personas'),
  getById: (id) => api.get(`/personas/${id}`),
  create: (data) => api.post('/personas', data),
  update: (personaId, data) => api.put(`/personas/${personaId}`, data),
  updateAll: (data) => api.put('/personas', data),
};

