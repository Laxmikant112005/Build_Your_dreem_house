/**
 * Planova - Plot Controller
 * Request handlers for GeoSpatial plot/land mapping endpoints
 */

const plotService = require('./plot.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Create new plot
 */
const createPlot = asyncHandler(async (req, res) => {
  const plot = await plotService.createPlot(req.userId, req.body);
  ApiResponse.created(res, 'Plot created successfully', plot);
});

/**
 * Get user's plots
 */
const getUserPlots = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const plots = await plotService.getUserPlots(req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });
  ApiResponse.ok(res, 'Plots retrieved successfully', plots);
});

/**
 * Get plot by ID
 */
const getPlot = asyncHandler(async (req, res) => {
  const plot = await plotService.getPlotById(req.params.id);
  ApiResponse.ok(res, 'Plot retrieved successfully', plot);
});

/**
 * Update plot
 */
const updatePlot = asyncHandler(async (req, res) => {
  const plot = await plotService.updatePlot(req.params.id, req.userId, req.body);
  ApiResponse.ok(res, 'Plot updated successfully', plot);
});

/**
 * Set as primary plot
 */
const setPrimaryPlot = asyncHandler(async (req, res) => {
  const plot = await plotService.setPrimaryPlot(req.userId, req.params.id);
  ApiResponse.ok(res, 'Primary plot set successfully', plot);
});

/**
 * Delete plot
 */
const deletePlot = asyncHandler(async (req, res) => {
  await plotService.deletePlot(req.params.id, req.userId);
  ApiResponse.ok(res, 'Plot deleted successfully');
});

/**
 * Find plots intersecting a GeoJSON polygon
 */
const findIntersecting = asyncHandler(async (req, res) => {
  const { geojson } = req.body;
  if (!geojson || !geojson.type || !geojson.coordinates) {
    return ApiResponse.badRequest(res, 'Valid GeoJSON Polygon is required');
  }
  const plots = await plotService.findIntersecting(geojson);
  ApiResponse.ok(res, 'Intersecting plots found', plots);
});

/**
 * Find plots near a point
 */
const findNearby = asyncHandler(async (req, res) => {
  const { lng, lat, maxDistance = 5000 } = req.query;
  if (!lng || !lat) {
    return ApiResponse.badRequest(res, 'Longitude (lng) and Latitude (lat) are required');
  }
  const plots = await plotService.findNearby(
    parseFloat(lng),
    parseFloat(lat),
    parseInt(maxDistance)
  );
  ApiResponse.ok(res, 'Nearby plots found', plots);
});

module.exports = {
  createPlot,
  getUserPlots,
  getPlot,
  updatePlot,
  setPrimaryPlot,
  deletePlot,
  findIntersecting,
  findNearby,
};

