import api from './axios';

export const collectionService = {
  getAll: () => api.get('/collections').then(r => r.data),

  getById: (id) => api.get(`/collections/${id}`).then(r => r.data),

  create: (data) => api.post('/collections', data).then(r => r.data),

  update: (id, data) => api.put(`/collections/${id}`, data).then(r => r.data),

  delete: (id) => api.delete(`/collections/${id}`).then(r => r.data),

  addItem: (collectionId, itemType, itemId) =>
    api.post(`/collections/${collectionId}/items`, { itemType, itemId }).then(r => r.data),

  removeItem: (collectionId, itemType, itemId) =>
    api.delete(`/collections/${collectionId}/items`, { data: { itemType, itemId } }).then(r => r.data),

  toggleItem: (itemType, itemId) =>
    api.post('/collections/toggle', { itemType, itemId }).then(r => r.data),
};

