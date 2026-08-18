/**
 * Planova - Recommendation Controller
 */

const recommendationService = require('./recommendation.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getRecommendations = asyncHandler(async (req, res) => {
  const { limit = 20, plotId } = req.query;
  const recommendations = await recommendationService.getRecommendations(req.userId, {
    limit: parseInt(limit),
    plotId,
  });
  ApiResponse.ok(res, 'Recommendations retrieved', recommendations);
});

const estimateCost = asyncHandler(async (req, res) => {
  const estimation = await recommendationService.estimateCost(req.params.id, req.query);
  ApiResponse.ok(res, 'Cost estimation complete', estimation);
});

const findSimilar = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const blueprints = await recommendationService.findSimilar(req.params.id, parseInt(limit));
  ApiResponse.ok(res, 'Similar blueprints found', blueprints);
});

module.exports = { getRecommendations, estimateCost, findSimilar };

