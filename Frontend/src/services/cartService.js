// Cart API service
import api from './api';

const cartService = {
  getCart: () => api.get('/carts'),
  addItem: (materialId, quantity = 1) => api.post('/carts/items', { materialId, quantity }),
  updateItem: (materialId, quantity) => api.put(`/carts/items/${materialId}`, { quantity }),
  removeItem: (materialId) => api.delete(`/carts/items/${materialId}`),
  clearCart: () => api.delete('/carts'),
  validateCart: () => api.post('/carts/validate'),
};

export default cartService;

