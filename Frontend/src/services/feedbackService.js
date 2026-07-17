import axios from './axios';

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    try {
      const res = await axios.post('/feedback', feedbackData);
      return res.data;
    } catch (err) {
      console.error(err);
      throw err.response?.data || err.message;
    }
  },

  getByEngineer: async (engineerId) => {
    try {
      const res = await axios.get(`/feedback/engineer/${engineerId}`);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getByUser: async (userId) => {
    try {
      const res = await axios.get(`/feedback/user/${userId}`);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getAll: async () => {
    try {
      const res = await axios.get('/feedback');
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
};

