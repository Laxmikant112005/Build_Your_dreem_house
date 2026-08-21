/**
 * Planova - Engineer Controller
 * Request handlers for engineer endpoints
 */

const engineerService = require('./engineer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get all engineers
 */
const getEngineers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    city,
    style,
    minRating,
    minExperience,
    sortBy = 'rating',
    sortOrder = 'desc',
  } = req.query;

  const result = await engineerService.getEngineers(
    {
      city,
      style,
      minRating: minRating ? Number(minRating) : undefined,
      minExperience: minExperience ? Number(minExperience) : undefined,
    },
    {
      page: Math.max(1, Number(page)),
      limit: Math.min(100, Math.max(1, Number(limit))),
      sortBy,
      sortOrder,
    }
  );

  return ApiResponse.ok(
    res,
    'Engineers retrieved successfully',
    result
  );
});

/**
 * Get engineer by ID
 */
const getEngineerById = asyncHandler(async (req, res) => {
  const engineer = await engineerService.getEngineerById(req.params.id);

  if (!engineer) {
    return ApiResponse.notFound(res, 'Engineer not found');
  }

  return ApiResponse.ok(
    res,
    'Engineer retrieved successfully',
    engineer
  );
});

/**
 * Get featured engineers
 */
const getFeaturedEngineers = asyncHandler(async (req, res) => {
  const limit = Math.min(
    100,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const engineers =
    await engineerService.getFeaturedEngineers(limit);

  return ApiResponse.ok(
    res,
    'Featured engineers retrieved successfully',
    engineers
  );
});

/**
 * Get engineer designs
 */
const getEngineerDesigns = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(req.query.limit) || 20)
  );

  const result = await engineerService.getEngineerDesigns(
    req.params.id,
    {
      page,
      limit,
      status: req.query.status || 'approved',
    }
  );

  return ApiResponse.ok(
    res,
    'Engineer designs retrieved successfully',
    result
  );
});

/**
 * Get engineer reviews
 */
const getEngineerReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(req.query.limit) || 20)
  );

  const result = await engineerService.getEngineerReviews(
    req.params.id,
    {
      page,
      limit,
    }
  );

  return ApiResponse.ok(
    res,
    'Engineer reviews retrieved successfully',
    result
  );
});

/**
 * Update authenticated engineer profile
 */
const updateEngineerProfile = asyncHandler(async (req, res) => {
  const engineer = await engineerService.updateProfile(
    req.userId,
    req.body
  );

  return ApiResponse.ok(
    res,
    'Profile updated successfully',
    engineer
  );
});

/**
 * Update authenticated engineer availability
 */
const updateAvailability = asyncHandler(async (req, res) => {
  const engineer = await engineerService.updateAvailability(
    req.userId,
    req.body.availability
  );

  return ApiResponse.ok(
    res,
    'Availability updated successfully',
    engineer
  );
});

/**
 * Add portfolio item
 */
const addPortfolioItem = asyncHandler(async (req, res) => {
  const engineer = await engineerService.addPortfolioItem(
    req.userId,
    req.body
  );

  return ApiResponse.created(
    res,
    'Portfolio item added successfully',
    engineer
  );
});

/**
 * Remove portfolio item
 */
const removePortfolioItem = asyncHandler(async (req, res) => {
  const engineer = await engineerService.removePortfolioItem(
    req.userId,
    req.params.portfolioId
  );

  return ApiResponse.ok(
    res,
    'Portfolio item removed successfully',
    engineer
  );
});

/**
 * Get authenticated engineer dashboard
 */
const getEngineerDashboard = asyncHandler(async (req, res) => {
  const dashboard =
    await engineerService.getEngineerDashboard(req.userId);

  return ApiResponse.ok(
    res,
    'Engineer dashboard retrieved successfully',
    dashboard
  );
});

/**
 * Submit engineer verification
 */
const submitVerification = asyncHandler(async (req, res) => {
  const result =
    await engineerService.submitVerification(
      req.userId,
      req.body
    );

  return ApiResponse.ok(
    res,
    'Verification application submitted successfully',
    result
  );
});

/**
 * Get authenticated engineer verification status
 */
const getVerificationStatus = asyncHandler(async (req, res) => {
  const result =
    await engineerService.getVerificationStatus(req.userId);

  return ApiResponse.ok(
    res,
    'Verification status retrieved successfully',
    result
  );
});

/**
 * Get engineer statistics
 */
const getEngineerStats = asyncHandler(async (req, res) => {
  const stats =
    await engineerService.getEngineerStats(req.params.id);

  return ApiResponse.ok(
    res,
    'Engineer statistics retrieved successfully',
    stats
  );
});

/**
 * Search engineers
 */
const searchEngineers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (q.length < 2) {
    return ApiResponse.badRequest(
      res,
      'Search query must be at least 2 characters'
    );
  }

  const result = await engineerService.searchEngineers(
    q,
    {
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(
        100,
        Math.max(1, Number(req.query.limit) || 20)
      ),
    }
  );

  return ApiResponse.ok(
    res,
    'Search results retrieved successfully',
    result
  );
});

module.exports = {
  getEngineers,
  getEngineerById,
  getFeaturedEngineers,
  getEngineerDesigns,
  getEngineerReviews,
  updateEngineerProfile,
  updateAvailability,
  addPortfolioItem,
  removePortfolioItem,
  getEngineerDashboard,
  submitVerification,
  getVerificationStatus,
  getEngineerStats,
  searchEngineers,
};