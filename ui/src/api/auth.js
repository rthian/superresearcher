import { api } from './client.js';

export const authAPI = {
  getRole: () => api.get('/auth/role'),
};
