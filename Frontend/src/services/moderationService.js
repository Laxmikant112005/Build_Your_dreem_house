import axios from './axios';

export const moderationService = {
  listPending: async () => {
    try {
      const res = await axios.get('/designs?status=pending');
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  approveDesign: async (id) => {
    try {
      const res = await axios.put(`/designs/${id}/approve`);
      return res.data;
    } catch (err) {
      console.error(err);
      throw err.response?.data || err.message;
    }
  },

  rejectDesign: async (id) => {
    try {
      const res = await axios.put(`/designs/${id}/reject`);
      return res.data;
    } catch (err) {
      console.error(err);
      throw err.response?.data || err.message;
    }
  },

  listAllDesigns: async () => {
    try {
      const res = await axios.get('/designs');
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
};

