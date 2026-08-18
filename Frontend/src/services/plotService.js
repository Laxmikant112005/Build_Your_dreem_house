import axios from './axios';

export const plotService = {
  /**
   * Get all plots for current user
   */
  getUserPlots: async (params = {}) => {
    const res = await axios.get('/plots', { params });
    return res.data;
  },

  /**
   * Get single plot by ID
   */
  getPlotById: async (id) => {
    const res = await axios.get(`/plots/${id}`);
    return res.data;
  },

  /**
   * Create a new plot
   */
  createPlot: async (plotData) => {
    const res = await axios.post('/plots', plotData);
    return res.data;
  },

  /**
   * Update a plot
   */
  updatePlot: async (id, plotData) => {
    const res = await axios.put(`/plots/${id}`, plotData);
    return res.data;
  },

  /**
   * Set plot as primary
   */
  setPrimaryPlot: async (id) => {
    const res = await axios.patch(`/plots/${id}/primary`);
    return res.data;
  },

  /**
   * Delete (soft-delete) a plot
   */
  deletePlot: async (id) => {
    const res = await axios.delete(`/plots/${id}`);
    return res.data;
  },

  /**
   * Find plots intersecting a GeoJSON polygon
   */
  findIntersecting: async (geojson) => {
    const res = await axios.post('/plots/intersecting', { geojson });
    return res.data;
  },

  /**
   * Find plots near a point
   */
  findNearby: async (lng, lat, maxDistance = 5000) => {
    const res = await axios.get('/plots/nearby', { params: { lng, lat, maxDistance } });
    return res.data;
  },
};

