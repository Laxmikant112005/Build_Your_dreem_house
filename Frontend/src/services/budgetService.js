import api from './axios';

export const budgetService = {
  create: async (data) => {
    const res = await api.post('/budgets', data);
    return res.data;
  },

  getByProject: async (projectId) => {
    const res = await api.get(`/budgets/project/${projectId}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/budgets/${id}`);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/budgets/${id}`, data);
    return res.data;
  },

  addExpense: async (budgetId, data) => {
    const res = await api.post(`/budgets/${budgetId}/expenses`, data);
    return res.data;
  },

  deleteExpense: async (budgetId, expenseId) => {
    const res = await api.delete(`/budgets/${budgetId}/expenses/${expenseId}`);
    return res.data;
  },

  getSummary: async () => {
    const res = await api.get('/budgets/summary');
    return res.data;
  },

  getCategoryBreakdown: async (projectId) => {
    const res = await api.get(`/budgets/project/${projectId}/breakdown`);
    return res.data;
  },
};

