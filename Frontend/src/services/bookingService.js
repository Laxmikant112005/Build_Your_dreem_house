import axios from './axios';

export const bookingService = {
  // Create a booking (user)
  create: async (bookingData) => {
    const res = await axios.post('bookings', bookingData);
    return res.data;
  },

  // Get the current user's bookings
  getByUser: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`bookings/my-bookings${query ? `?${query}` : ''}`);
    return res.data;
  },

  // Get the current engineer's bookings
  getByEngineer: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`bookings/engineer/my-bookings${query ? `?${query}` : ''}`);
    return res.data;
  },

  // Engineer updates booking status
  updateStatus: async (bookingId, status, additionalData = {}) => {
    const res = await axios.put(`bookings/${bookingId}/status`, { status, ...additionalData });
    return res.data;
  },

  // Engineer confirms a booking
  confirm: async (bookingId, meetingLink) => {
    const res = await axios.post(`bookings/${bookingId}/confirm`, { meetingLink });
    return res.data;
  },

  // Cancel a booking (user or engineer)
  cancel: async (bookingId, reason) => {
    const res = await axios.post(`bookings/${bookingId}/cancel`, { reason });
    return res.data;
  },

  getById: async (bookingId) => {
    const res = await axios.get(`bookings/${bookingId}`);
    return res.data;
  },

  // Check availability for an engineer on a date
  checkAvailability: async (engineerId, date) => {
    const res = await axios.get(`bookings/engineer/${engineerId}/availability`, {
      params: { date },
    });
    return res.data;
  },

  // Engineer booking statistics
  getStatistics: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`bookings/engineer/stats${query ? `?${query}` : ''}`);
    return res.data;
  },

  getByStatus: async (status, params = {}) => {
    const query = new URLSearchParams({ ...params, status }).toString();
    const res = await axios.get(`bookings/my-bookings?${query}`);
    return res.data;
  },
};
