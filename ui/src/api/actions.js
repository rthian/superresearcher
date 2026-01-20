import { api } from './client';

export const actionsAPI = {
  listAll: () => api.get('/actions'),
  update: (actionId, data) => api.put(`/actions/${actionId}`, data),
};

