import api from './axios';

export const recommendationService = {
  getRecommendations: (params) => api.get('/recommendations', { params }).then(r => r.data),

  estimateCost: (blueprintId, params) => api.get(`/recommendations/estimate/${blueprintId}`, { params }).then(r => r.data),

  findSimilar: (blueprintId, limit = 5) =>
    api.get(`/recommendations/similar/${blueprintId}`, { params: { limit } }).then(r => r.data),
};

