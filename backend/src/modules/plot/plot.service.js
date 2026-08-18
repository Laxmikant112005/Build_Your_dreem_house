/**
 * Planova - Plot Service
 * Business logic for GeoSpatial plot/land mapping
 */

const mongoose = require('mongoose');
const Plot = require('./plot.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

class PlotService {
  /**
   * Create a new plot
   */
  async createPlot(userId, plotData) {
    // Auto-detect orientation from GeoJSON if not provided
    if (!plotData.orientation && plotData.geojson) {
      // Orientation detection will be done via Turf.js on frontend
      // but we provide a rough server-side fallback
    }

    const plot = await Plot.create({
      ...plotData,
      userId,
    });
    logger.info(`Plot created for user ${userId}: ${plot.id}`);
    return plot.populate('userId', 'firstName lastName');
  }

  /**
   * Get all plots for a user
   */
  async getUserPlots(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const query = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [plots, total] = await Promise.all([
      Plot.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName'),
      Plot.countDocuments(query),
    ]);

    return {
      plots,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get plot by ID
   */
  async getPlotById(plotId) {
    if (!mongoose.Types.ObjectId.isValid(plotId)) {
      throw new ApiError(400, 'Invalid plot ID format');
    }
    const plot = await Plot.findById(plotId).populate('userId', 'firstName lastName');
    if (!plot) throw new ApiError(404, 'Plot not found');
    return plot;
  }

  /**
   * Update plot
   */
  async updatePlot(plotId, userId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(plotId)) {
      throw new ApiError(400, 'Invalid plot ID format');
    }
    const plot = await Plot.findOneAndUpdate(
      { _id: plotId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName');
    if (!plot) throw new ApiError(404, 'Plot not found');
    logger.info(`Plot ${plotId} updated`);
    return plot;
  }

  /**
   * Set plot as primary for user
   */
  async setPrimaryPlot(userId, plotId) {
    if (!mongoose.Types.ObjectId.isValid(plotId)) {
      throw new ApiError(400, 'Invalid plot ID format');
    }
    // Reset all primary
    await Plot.updateMany({ userId, isPrimary: true }, { isPrimary: false });
    // Set new primary
    const plot = await Plot.findOneAndUpdate(
      { _id: plotId, userId },
      { isPrimary: true },
      { new: true }
    ).populate('userId', 'firstName lastName');
    if (!plot) throw new ApiError(404, 'Plot not found');
    return plot;
  }

  /**
   * Delete plot (soft delete)
   */
  async deletePlot(plotId, userId) {
    if (!mongoose.Types.ObjectId.isValid(plotId)) {
      throw new ApiError(400, 'Invalid plot ID format');
    }
    const plot = await Plot.findOneAndUpdate(
      { _id: plotId, userId },
      { status: 'deleted' },
      { new: true }
    );
    if (!plot) throw new ApiError(404, 'Plot not found');
    return plot;
  }

  /**
   * Find plots intersecting a GeoJSON geometry
   */
  async findIntersecting(geojson) {
    return Plot.findIntersecting(geojson).populate('userId', 'firstName lastName');
  }

  /**
   * Find plots near a point
   */
  async findNearby(lng, lat, maxDistanceMeters = 5000) {
    return Plot.findNearby(lng, lat, maxDistanceMeters).populate('userId', 'firstName lastName');
  }
}

module.exports = new PlotService();

