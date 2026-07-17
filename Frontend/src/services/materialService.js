// Material API service
import api from './api';

const materialService = {
  getMaterials: (filters = {}) => api.get('/materials', { params: filters }),
  getFeatured: () => api.get('/materials/featured'),
  getByCategory: (category) => api.get(`/materials/category/${category}`),
  getMaterial: (id) => api.get(`/materials/${id}`),
};

export default materialService;

