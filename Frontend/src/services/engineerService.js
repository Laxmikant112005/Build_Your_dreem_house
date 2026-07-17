// src/services/engineerService.js
import axios from './axios';

export const engineerService = {
  getAllEngineers: async (query = '') => {
    return axios.get(`engineers${query ? `?${query}` : ''}`);
  },

  getEngineerById: async (id) => {
    return axios.get(`engineers/${id}`);
  },

  updateEngineer: async (id, data) => {
    return axios.put(`engineers/${id}`, data);
  },

  deleteEngineer: async (id) => {
    return axios.delete(`engineers/${id}`);
  },

  approveEngineer: async (id) => {
    return axios.post(`admin/engineers/${id}/approve`);
  }
};
