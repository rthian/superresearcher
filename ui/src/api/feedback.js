import { api } from './client';

export const feedbackAPI = {
  list: (params) => api.get('/feedback', params),
  get: (feedbackId, projectSlug) => api.get(`/feedback/${feedbackId}`, { projectSlug }),
  create: (data) => api.post('/feedback', data),
  update: (feedbackId, data) => api.put(`/feedback/${feedbackId}`, data),
  delete: (feedbackId, projectSlug) => api.delete(`/feedback/${feedbackId}`, { projectSlug }),
  respond: (feedbackId, data) => api.post(`/feedback/${feedbackId}/respond`, data),
};

