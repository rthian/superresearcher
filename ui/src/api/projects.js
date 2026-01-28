import { api } from './client';

export const projectsAPI = {
  list: (includeArchived = false) => api.get(`/projects?includeArchived=${includeArchived}`),
  get: (slug) => api.get(`/projects/${slug}`),
  update: (slug, data) => api.put(`/projects/${slug}`, data),
  archive: (slug) => api.post(`/projects/${slug}/archive`),
  unarchive: (slug) => api.post(`/projects/${slug}/unarchive`),
  getInsights: (slug) => api.get(`/projects/${slug}/insights`),
  updateInsights: (slug, data) => api.put(`/projects/${slug}/insights`, data),
  getActions: (slug) => api.get(`/projects/${slug}/actions`),
  updateActions: (slug, data) => api.put(`/projects/${slug}/actions`, data),
  getFeedback: (slug) => api.get(`/projects/${slug}/feedback`),
};

