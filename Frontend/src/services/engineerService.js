// src/services/engineerService.js
import axios from './axios';

export const engineerService = {
  // ---- Public discovery ----
  getAllEngineers: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    const qs = query.toString();
    const res = await axios.get(`engineers${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  getEngineerById: async (id) => {
    const res = await axios.get(`engineers/${id}`);
    return res.data;
  },

  getFeaturedEngineers: async (limit = 10) => {
    const res = await axios.get(`engineers/featured?limit=${limit}`);
    return res.data;
  },

  searchEngineers: async (q, params = {}) => {
    const query = new URLSearchParams({ q, ...params }).toString();
    const res = await axios.get(`engineers/search?${query}`);
    return res.data;
  },

  getEngineerDesigns: async (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`engineers/${id}/designs${query ? `?${query}` : ''}`);
    return res.data;
  },

  getEngineerReviews: async (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`engineers/${id}/reviews${query ? `?${query}` : ''}`);
    return res.data;
  },

  getEngineerStats: async (id) => {
    const res = await axios.get(`engineers/${id}/stats`);
    return res.data;
  },

  // ---- Authenticated engineer (self) ----
  getDashboard: async () => {
    const res = await axios.get('engineers/me/dashboard');
    return res.data;
  },

  getProfile: async () => {
    const res = await axios.get('engineer/profile');
    return res.data;
  },

  getVerificationStatus: async () => {
    const res = await axios.get('engineers/me/verification');
    return res.data;
  },

  submitVerification: async (data) => {
    const res = await axios.post('engineer/verify', data);
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await axios.put('engineers/profile', data);
    return res.data;
  },

  updateAvailability: async (availability) => {
    const res = await axios.put('engineers/availability', { availability });
    return res.data;
  },

  addPortfolioItem: async (data) => {
    const res = await axios.post('engineers/portfolio', data);
    return res.data;
  },

  removePortfolioItem: async (portfolioId) => {
    const res = await axios.delete(`engineers/portfolio/${portfolioId}`);
    return res.data;
  },
};

