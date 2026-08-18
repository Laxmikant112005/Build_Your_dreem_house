import axios from './axios';

export const dashboardService = {
  getDashboard: async () => {
    const res = await axios.get('/dashboard');
    return res.data;
  },
};

