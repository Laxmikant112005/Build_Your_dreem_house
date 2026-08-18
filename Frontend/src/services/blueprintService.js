import axios from './axios';

export const blueprintService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    const res = await axios.get(`/blueprints?${query.toString()}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`/blueprints/${id}`);
    return res.data;
  },

  getBySlug: async (slug) => {
    const res = await axios.get(`/blueprints/slug/${slug}`);
    return res.data;
  },

  getFeatured: async (limit = 10) => {
    const res = await axios.get(`/blueprints/featured?limit=${limit}`);
    return res.data;
  },

  getTrending: async (days = 7, limit = 10) => {
    const res = await axios.get(`/blueprints/trending?days=${days}&limit=${limit}`);
    return res.data;
  },

  getRecommended: async (limit = 20) => {
    const res = await axios.get(`/blueprints/recommended?limit=${limit}`);
    return res.data;
  },

  getRelated: async (id, limit = 5) => {
    const res = await axios.get(`/blueprints/${id}/related?limit=${limit}`);
    return res.data;
  },

  getFilterOptions: async () => {
    const res = await axios.get('/blueprints/filters/options');
    return res.data;
  },

toggleLike: async (id) => {
    const res = await axios.post(`/blueprints/${id}/like`);
    return res.data;
  },

  // ---- Engineer portfolio (authenticated) ----
  create: async (data) => {
    const res = await axios.post('/blueprints', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axios.put(`/blueprints/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`/blueprints/${id}`);
    return res.data;
  },

  submitForApproval: async (id) => {
    const res = await axios.post(`/blueprints/${id}/submit`);
    return res.data;
  },

  getMyBlueprints: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`/blueprints/engineer/my-blueprints${query ? `?${query}` : ''}`);
    return res.data;
  },
};

