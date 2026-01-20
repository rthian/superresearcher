import { api } from './client';

export const projectsAPI = {
  list: () => api.get('/projects'),
  get: (slug) => api.get(`/projects/${slug}`),
  update: (slug, data) => api.put(`/projects/${slug}`, data),
  getInsights: (slug) => api.get(`/projects/${slug}/insights`),
  updateInsights: (slug, data) => api.put(`/projects/${slug}/insights`, data),
  getActions: (slug) => api.get(`/projects/${slug}/actions`),
  updateActions: (slug, data) => api.put(`/projects/${slug}/actions`, data),
  getFeedback: (slug) => api.get(`/projects/${slug}/feedback`),
};

