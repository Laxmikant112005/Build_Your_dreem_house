import axios from './axios';

export const userService = {
  login: async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (userData) => {
    const res = await axios.post('/auth/register', userData);
    return res.data;
  },

  otpSend: async (credential) => {
    const res = await axios.post('/auth/otp-send', { credential });
    return res.data;
  },

  otpLogin: async (credential, otp) => {
    const res = await axios.post('/auth/otp-login', { credential, otp });
    return res.data;
  },

  logout: async () => {
    await axios.post('/auth/logout');
  },

  getProfile: async () => {
    const res = await axios.get('/users/profile/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await axios.put('/users/profile/me', data);
    return res.data;
  },

  updatePreferences: async (preferences) => {
    const res = await axios.put('/users/preferences/me', { preferences });
    return res.data;
  },

  getAll: async () => {
    const res = await axios.get('/users');
    return res.data;
  }
};

