import { api } from './client';

export const suggestionsAPI = {
  list: (params) => api.get('/research-suggestions', params),
  create: (data) => api.post('/research-suggestions', data),
  vote: (suggestionId, userId) => api.put(`/research-suggestions/${suggestionId}/vote`, { userId }),
  updateStatus: (suggestionId, status, assignedTo) => 
    api.put(`/research-suggestions/${suggestionId}/status`, { status, assignedTo }),
  comment: (suggestionId, author, content) => 
    api.post(`/research-suggestions/${suggestionId}/comment`, { author, content }),
};

