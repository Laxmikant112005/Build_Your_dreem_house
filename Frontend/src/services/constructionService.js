import api from './axios';

export const constructionService = {
  initialize: async (data) => {
    const res = await api.post('/construction/initialize', data);
    return res.data;
  },

  getByProject: async (projectId) => {
    const res = await api.get(`/construction/project/${projectId}`);
    return res.data;
  },

  updateStage: async (projectId, stageId, data) => {
    const res = await api.put(`/construction/project/${projectId}/stages/${stageId}`, data);
    return res.data;
  },

  addMilestone: async (projectId, data) => {
    const res = await api.post(`/construction/project/${projectId}/milestones`, data);
    return res.data;
  },

  updateMilestone: async (projectId, milestoneId, data) => {
    const res = await api.put(`/construction/project/${projectId}/milestones/${milestoneId}`, data);
    return res.data;
  },

  addDailyLog: async (projectId, data) => {
    const res = await api.post(`/construction/project/${projectId}/daily-logs`, data);
    return res.data;
  },

  addPhotos: async (projectId, data) => {
    const res = await api.post(`/construction/project/${projectId}/photos`, data);
    return res.data;
  },

  addDelayAlert: async (projectId, data) => {
    const res = await api.post(`/construction/project/${projectId}/delay-alerts`, data);
    return res.data;
  },

  resolveAlert: async (projectId, alertId) => {
    const res = await api.put(`/construction/project/${projectId}/delay-alerts/${alertId}/resolve`);
    return res.data;
  },

  generateReport: async (projectId, data) => {
    const res = await api.post(`/construction/project/${projectId}/reports`, data);
    return res.data;
  },

  getProgressSummary: async () => {
    const res = await api.get('/construction/summary');
    return res.data;
  },
};

