import { api } from './client';

export const insightsAPI = {
  listAll: () => api.get('/insights'),
  rate: (insightId, data) => api.post(`/insights/${insightId}/rate`, data),
  getRatings: (insightId, projectSlug) => 
    api.get(`/insights/${insightId}/ratings`, { projectSlug }),
};

