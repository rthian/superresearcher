import { api } from './client.js';

export const roiAPI = {
  getAll: () => api.get('/roi'),
  track: (data) => api.post('/roi/track', data),
  remove: (actionId, project) => api.delete(`/roi/${actionId}`, { project }),
  getSummary: () => api.get('/roi/summary'),
};
