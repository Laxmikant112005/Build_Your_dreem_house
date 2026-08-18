import api from './axios';

export const recentlyViewedService = {
  get: (params) => api.get('/recently-viewed', { params }).then(r => r.data),

  track: (data) => api.post('/recently-viewed', data).then(r => r.data),
};

