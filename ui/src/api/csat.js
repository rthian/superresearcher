import { api } from './client';

export const csatAPI = {
  // Internal platform survey endpoints
  submit: (data) => api.post('/csat/submit', data),
  shouldShow: (userId, projectSlug) => api.get('/csat/should-show', { params: { userId, projectSlug } }),
  dismiss: (userId) => api.post('/csat/dismiss', { userId }),
  remindLater: (userId) => api.post('/csat/remind-later', { userId }),
  
  // Admin endpoints (for platform satisfaction)
  getAggregates: () => api.get('/admin/csat/aggregates'),
  getTrend: (months = 12) => api.get('/admin/csat/trend', { params: { months } }),
  getByProject: () => api.get('/admin/csat/by-project'),
  getByRole: () => api.get('/admin/csat/by-role'),
  getPlatformVerbatims: (limit = 50) => api.get('/admin/csat/verbatims', { params: { limit } }),
  
  // ===================================================================
  // Bank Customer Metrics Endpoints (GXS/GXB CSAT/NPS)
  // ===================================================================
  
  // Get all metrics data
  getMetrics: () => api.get('/csat/metrics'),
  
  // Get specific scores with filtering
  getScores: (params) => api.get('/csat/metrics/scores', { params }),
  
  // Get trend data over time
  getTrends: (params) => api.get('/csat/metrics/trends', { params }),
  
  // Upload CSV/Excel file with CSAT data
  uploadData: (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('period', metadata.period);
    formData.append('periodType', metadata.periodType);
    formData.append('dataSource', metadata.dataSource || 'manual_upload');
    if (metadata.organization) {
      formData.append('organization', metadata.organization);
    }
    
    return api.post('/csat/metrics/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Manual entry of CSAT/NPS data
  manualEntry: (data) => api.post('/csat/metrics/manual', data),
  
  // Get alerts
  getAlerts: (params) => api.get('/csat/metrics/alerts', { params }),
  
  // Update alert status
  updateAlert: (id, status) => api.put(`/csat/metrics/alerts/${id}`, { status }),
  
  // Export scorecard data
  export: (period, format = 'csv') => 
    api.get('/csat/metrics/export', { 
      params: { period, format },
      responseType: 'blob'
    }),
  
  // Get customer verbatim comments
  getVerbatims: (params) => api.get('/csat/metrics/verbatims', { params }),
  
  // Link verbatim to research insight
  linkVerbatimToInsight: (verbatimId, insightId, projectSlug) => 
    api.post(`/csat/metrics/verbatims/${verbatimId}/link`, { insightId, projectSlug }),
};

