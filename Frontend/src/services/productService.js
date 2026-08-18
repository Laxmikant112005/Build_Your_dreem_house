import axios from './axios';

export const productService = {
  list: async (params = '') => axios.get(`products${params ? `?${params}` : ''}`),
  get: async (id) => axios.get(`products/${id}`),
  create: async (data) => axios.post('products', data),
  update: async (id, data) => axios.put(`products/${id}`, data),
  remove: async (id) => axios.delete(`products/${id}`),
};
