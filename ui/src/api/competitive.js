import { api } from './client.js';

export const competitiveAPI = {
  getCompetitors: () => api.get('/competitive/competitors'),
  getFeatures: () => api.get('/competitive/features'),
  getPricing: () => api.get('/competitive/pricing'),
  getPerception: () => api.get('/competitive/perception'),
  getReleases: () => api.get('/competitive/releases'),
  getSummary: () => api.get('/competitive/summary'),
};
