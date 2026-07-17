import axios from './axios';

export const notificationService = {
  getByUser: async (userId) => {
    try {
      const res = await axios.get(`/notifications/user/${userId}`);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const res = await axios.put(`/notifications/${notificationId}/read`);
      return res.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const res = await axios.get(`/notifications/unread-count/${userId}`);
      return res.data.count || 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  }
};

