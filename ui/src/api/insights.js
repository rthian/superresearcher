import { api } from './client';

export const insightsAPI = {
  listAll: (includeArchived = false) => api.get(`/insights?includeArchived=${includeArchived}`),
  rate: (insightId, data) => api.post(`/insights/${insightId}/rate`, data),
  getRatings: (insightId, projectSlug) => 
    api.get(`/insights/${insightId}/ratings`, { projectSlug }),
};

