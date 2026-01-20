import { api } from './client';

export const csatAPI = {
  submit: (data) => api.post('/csat/submit', data),
  shouldShow: (userId, projectSlug) => api.get('/csat/should-show', { userId, projectSlug }),
  dismiss: (userId) => api.post('/csat/dismiss', { userId }),
  remindLater: (userId) => api.post('/csat/remind-later', { userId }),
  
  // Admin endpoints
  getAggregates: () => api.get('/admin/csat/aggregates'),
  getTrend: (months = 12) => api.get('/admin/csat/trend', { months }),
  getByProject: () => api.get('/admin/csat/by-project'),
  getByRole: () => api.get('/admin/csat/by-role'),
  getVerbatims: (limit = 50) => api.get('/admin/csat/verbatims', { limit }),
};

