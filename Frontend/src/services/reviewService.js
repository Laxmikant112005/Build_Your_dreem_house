import axios from './axios';

export const reviewService = {
  // Get reviews for an engineer (public)
  getByEngineer: async (engineerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`reviews/engineer/${engineerId}${query ? `?${query}` : ''}`);
    return res.data;
  },

  // Get review statistics for an engineer (public)
  getStats: async (engineerId) => {
    const res = await axios.get(`reviews/stats/${engineerId}`);
    return res.data;
  },

  // Get all reviews (with filters)
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`reviews${query ? `?${query}` : ''}`);
    return res.data;
  },

  // Get a single review
  getById: async (id) => {
    const res = await axios.get(`reviews/${id}`);
    return res.data;
  },

  // Create a review (user)
  create: async (data) => {
    const res = await axios.post('reviews', data);
    return res.data;
  },

  // Update a review (user)
  update: async (id, data) => {
    const res = await axios.put(`reviews/${id}`, data);
    return res.data;
  },

  // Delete a review (user/admin)
  remove: async (id) => {
    const res = await axios.delete(`reviews/${id}`);
    return res.data;
  },

  // Mark a review as helpful
  markHelpful: async (id) => {
    const res = await axios.post(`reviews/${id}/helpful`);
    return res.data;
  },

  // Engineer responds to a review
  respond: async (id, message) => {
    const res = await axios.post(`reviews/${id}/respond`, { message });
    return res.data;
  },

  // Get the current user's reviews
  getMyReviews: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`reviews/my/reviews${query ? `?${query}` : ''}`);
    return res.data;
  },
};
