import axios from './axios';

export const appointmentService = {
  // Create an appointment (client)
  create: async (data) => {
    const res = await axios.post('appointments', data);
    return res.data;
  },

  // Get the current client's appointments
  getMyAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`appointments/my-appointments${query ? `?${query}` : ''}`);
    return res.data;
  },

  // Get the current engineer's appointments
  getMyEngineerAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`appointments/engineer/my-appointments${query ? `?${query}` : ''}`);
    return res.data;
  },

  // Get a single appointment
  getById: async (id) => {
    const res = await axios.get(`appointments/${id}`);
    return res.data;
  },

  // Engineer accepts an appointment
  accept: async (id) => {
    const res = await axios.post(`appointments/${id}/accept`);
    return res.data;
  },

  // Engineer completes an appointment
  complete: async (id) => {
    const res = await axios.post(`appointments/${id}/complete`);
    return res.data;
  },

  // Reschedule an appointment (client or engineer)
  reschedule: async (id, data) => {
    const res = await axios.post(`appointments/${id}/reschedule`, data);
    return res.data;
  },

  // Cancel an appointment
  cancel: async (id, data = {}) => {
    const res = await axios.post(`appointments/${id}/cancel`, data);
    return res.data;
  },

  // Add feedback after completion
  addFeedback: async (id, data) => {
    const res = await axios.post(`appointments/${id}/feedback`, data);
    return res.data;
  },

  // Check engineer availability on a date
  checkAvailability: async (engineerId, date) => {
    const res = await axios.get(`appointments/engineer/${engineerId}/availability`, {
      params: { date },
    });
    return res.data;
  },

  // Appointment statistics
  getStatistics: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`appointments/engineer/stats${query ? `?${query}` : ''}`);
    return res.data;
  },
};
