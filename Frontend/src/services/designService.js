import axios from './axios';

export const designService = {
  getAll: async (params = '') => {
    return axios.get(`designs${params ? `?${params}` : ''}`);
  },

  getById: async (id) => {
    return axios.get(`designs/${id}`);
  },

  getByEngineer: async (engineerId) => {
    return axios.get(`designs?engineer=${engineerId}`);
  },

  create: async (designData) => {
    // designData can be FormData if uploading files
    const opts = designData instanceof FormData ? { headers: {} } : {};
    return axios.post('designs', designData, opts);
  }
};
