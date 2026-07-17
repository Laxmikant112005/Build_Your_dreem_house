import axios from './axios';

export const bookingService = {
  create: async (bookingData) => {
    // backend enforces conflict detection
    return axios.post('bookings', bookingData);
  },

  getByUser: async (userId) => {
    return axios.get(`bookings?user=${userId}`);
  },

  getByEngineer: async (engineerId) => {
    return axios.get(`bookings?engineer=${engineerId}`);
  },

  updateStatus: async (bookingId, status) => {
    return axios.patch(`bookings/${bookingId}`, { status });
  },

  getByStatus: async (userId, status) => {
    return axios.get(`bookings?user=${userId}&status=${status}`);
  }

};
