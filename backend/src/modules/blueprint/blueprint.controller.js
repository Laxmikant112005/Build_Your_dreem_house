/**
 * Planova - Blueprint Controller
 * Request handlers for Professional Blueprint Marketplace endpoints
 */

const blueprintService = require('./blueprint.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get all blueprints with filters
 */
const getBlueprints = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 20, search, style, minCost, maxCost,
    minArea, maxArea, minBedrooms, floors, city, state,
    vastuCompliant, sustainabilityScore, minRating,
    sortBy = 'createdAt', sortOrder = 'desc', category,
    minCostPerSqft, maxCostPerSqft, kitchenType, parkingType,
    constructionType, accessTier,
  } = req.query;

  const filters = {
    search, style, category,
    minCost: minCost ? Number(minCost) : undefined,
    maxCost: maxCost ? Number(maxCost) : undefined,
    minArea: minArea ? Number(minArea) : undefined,
    maxArea: maxArea ? Number(maxArea) : undefined,
    minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
    floors: floors ? Number(floors) : undefined,
    city, state, vastuCompliant,
    sustainabilityScore: sustainabilityScore ? Number(sustainabilityScore) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    minCostPerSqft: minCostPerSqft ? Number(minCostPerSqft) : undefined,
    maxCostPerSqft: maxCostPerSqft ? Number(maxCostPerSqft) : undefined,
    kitchenType, parkingType, constructionType, accessTier,
  };

  const options = {
    page: Number(page),
    limit: Number(limit),
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc',
  };

  const result = await blueprintService.getBlueprints(filters, options);
  ApiResponse.paginated(res, 'Blueprints retrieved successfully', result.blueprints, result.pagination);
});

/**
 * Get featured blueprints
 */
const getFeaturedBlueprints = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const blueprints = await blueprintService.getFeatured(Number(limit));
  ApiResponse.ok(res, 'Featured blueprints retrieved successfully', blueprints);
});

/**
 * Get trending blueprints
 */
const getTrendingBlueprints = asyncHandler(async (req, res) => {
  const { days = 7, limit = 10 } = req.query;
  const blueprints = await blueprintService.getTrending(Number(days), Number(limit));
  ApiResponse.ok(res, 'Trending blueprints retrieved successfully', blueprints);
});

/**
 * Get AI-recommended blueprints for the current user
 */
const getRecommendedBlueprints = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const blueprints = await blueprintService.getRecommended(req.user, Number(limit));
  ApiResponse.ok(res, 'Recommended blueprints retrieved successfully', blueprints);
});

/**
 * Get blueprint by ID
 */
const getBlueprintById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blueprint = await blueprintService.getBlueprintById(id, true);
  ApiResponse.ok(res, 'Blueprint retrieved successfully', blueprint);
});

/**
 * Get blueprint by slug
 */
const getBlueprintBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const blueprint = await blueprintService.getBlueprintBySlug(slug);
  ApiResponse.ok(res, 'Blueprint retrieved successfully', blueprint);
});

/**
 * Create new blueprint
 */
const createBlueprint = asyncHandler(async (req, res) => {
  const blueprint = await blueprintService.createBlueprint(req.userId, req.body);
  ApiResponse.created(res, 'Blueprint created successfully', blueprint);
});

/**
 * Update blueprint
 */
const updateBlueprint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blueprint = await blueprintService.updateBlueprint(id, req.userId, req.body);
  ApiResponse.ok(res, 'Blueprint updated successfully', blueprint);
});

/**
 * Delete blueprint
 */
const deleteBlueprint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await blueprintService.deleteBlueprint(id, req.userId);
  ApiResponse.ok(res, 'Blueprint deleted successfully');
});

/**
 * Submit blueprint for approval
 */
const submitForApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blueprint = await blueprintService.submitForApproval(id, req.userId);
  ApiResponse.ok(res, 'Blueprint submitted for approval', blueprint);
});

/**
 * Like/unlike blueprint
 */
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await blueprintService.toggleLike(id, req.userId);
  ApiResponse.ok(res, result.liked ? 'Blueprint liked' : 'Blueprint unliked', result);
});

/**
 * Get related blueprints
 */
const getRelatedBlueprints = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;
  const blueprints = await blueprintService.getRelatedBlueprints(id, Number(limit));
  ApiResponse.ok(res, 'Related blueprints retrieved successfully', blueprints);
});

/**
 * Get filter options for marketplace
 */
const getFilterOptions = asyncHandler(async (req, res) => {
  const options = await blueprintService.getFilterOptions();
  ApiResponse.ok(res, 'Filter options retrieved successfully', options);
});

/**
 * Get engineer's own blueprints
 */
const getMyBlueprints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await blueprintService.getEngineerBlueprints(req.userId, {
    page: Number(page),
    limit: Number(limit),
    status,
  });
  ApiResponse.paginated(res, 'Your blueprints retrieved successfully', result.blueprints, result.pagination);
});

module.exports = {
  getBlueprints,
  getFeaturedBlueprints,
  getTrendingBlueprints,
  getRecommendedBlueprints,
  getBlueprintById,
  getBlueprintBySlug,
  createBlueprint,
  updateBlueprint,
  deleteBlueprint,
  submitForApproval,
  toggleLike,
  getRelatedBlueprints,
  getFilterOptions,
  getMyBlueprints,
};

