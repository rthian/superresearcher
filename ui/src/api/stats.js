import { api } from './client';

export const statsAPI = {
  getDashboard: () => api.get('/stats'),
};

