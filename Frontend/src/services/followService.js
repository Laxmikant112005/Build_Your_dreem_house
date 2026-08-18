import api from './axios';

export const followService = {
  getFollowing: () => api.get('/follows').then(r => r.data),

  toggleFollow: (engineerId) => api.post(`/follows/${engineerId}/toggle`).then(r => r.data),

  checkFollow: (engineerId) => api.get(`/follows/${engineerId}/check`).then(r => r.data),
};

