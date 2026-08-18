import api from './axios';

export const documentService = {
  create: async (data) => {
    const res = await api.post('/documents', data);
    return res.data;
  },

  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/documents${query ? `?${query}` : ''}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/documents/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  toggleFavorite: async (id) => {
    const res = await api.post(`/documents/${id}/favorite`);
    return res.data;
  },

  toggleArchive: async (id) => {
    const res = await api.post(`/documents/${id}/archive`);
    return res.data;
  },

  getFolders: async () => {
    const res = await api.get('/documents/folders');
    return res.data;
  },

  createFolder: async (name) => {
    const res = await api.post('/documents/folders', { name });
    return res.data;
  },

  moveToFolder: async (id, folder) => {
    const res = await api.put(`/documents/${id}/move`, { folder });
    return res.data;
  },

  getRecent: async (limit = 10) => {
    const res = await api.get(`/documents/recent?limit=${limit}`);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/documents/stats');
    return res.data;
  },
};

