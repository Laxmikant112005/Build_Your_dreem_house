import axios from './axios';

export const fieldService = {
  createField: async (fieldData) => {
    const res = await axios.post('/fields', fieldData);
    return res.data;
  },

  getUserFields: async (params = {}) => {
    const res = await axios.get('/fields', { params });
    return res.data;
  },

  getField: async (id) => {
    const res = await axios.get(`/fields/${id}`);
    return res.data;
  },

  updateField: async (id, fieldData) => {
    const res = await axios.put(`/fields/${id}`, fieldData);
    return res.data;
  },

  setPrimaryField: async (id) => {
    const res = await axios.patch(`/fields/${id}/primary`);
    return res.data;
  },

  deleteField: async (id) => {
    const res = await axios.delete(`/fields/${id}`);
    return res.data;
  },
};

