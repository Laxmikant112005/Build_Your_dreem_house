import api from './axios';

export const notificationService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.unreadOnly) query.set('unreadOnly', 'true');
    const qs = query.toString();
    const res = await api.get(`/notifications${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  markAsRead: async (notificationId) => {
    const res = await api.put(`/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (notificationId) => {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.data;
  },

  deleteAll: async () => {
    const res = await api.delete('/notifications/delete-all');
    return res.data;
  },
};

