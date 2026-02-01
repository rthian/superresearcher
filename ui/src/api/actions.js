import { api } from './client';

export const actionsAPI = {
  listAll: (includeArchived = false) => api.get(`/actions?includeArchived=${includeArchived}`),
  update: (actionId, data) => api.put(`/actions/${actionId}`, data),
};

