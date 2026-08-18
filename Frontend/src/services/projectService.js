import axios from './axios';

export const projectService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`/projects${query ? `?${query}` : ''}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`/projects/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axios.post('/projects', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axios.put(`/projects/${id}`, data);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await axios.patch(`/projects/${id}/status`, { status });
    return res.data;
  },

  delete: async (id) => {
    const res = await axios.delete(`/projects/${id}`);
    return res.data;
  },

  addMilestone: async (projectId, data) => {
    const res = await axios.post(`/projects/${projectId}/milestones`, data);
    return res.data;
  },

  updateMilestone: async (projectId, milestoneId, data) => {
    const res = await axios.put(`/projects/${projectId}/milestones/${milestoneId}`, data);
    return res.data;
  },

  updateStage: async (projectId, stageIndex, data) => {
    const res = await axios.patch(`/projects/${projectId}/stages/${stageIndex}`, data);
    return res.data;
  },

  addDocument: async (projectId, data) => {
    const res = await axios.post(`/projects/${projectId}/documents`, data);
    return res.data;
  },

  removeDocument: async (projectId, documentId) => {
    const res = await axios.delete(`/projects/${projectId}/documents/${documentId}`);
    return res.data;
  },

  inviteMember: async (projectId, userId, role = 'viewer') => {
    const res = await axios.post(`/projects/${projectId}/members`, { userId, role });
    return res.data;
  },

removeMember: async (projectId, memberId) => {
    const res = await axios.delete(`/projects/${projectId}/members/${memberId}`);
    return res.data;
  },

  // ---- Engineer-specific ----
  getAssignedProjects: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`/projects/assigned${query ? `?${query}` : ''}`);
    return res.data;
  },

  getAssignedProjectById: async (id) => {
    const res = await axios.get(`/projects/assigned/${id}`);
    return res.data;
  },
};

