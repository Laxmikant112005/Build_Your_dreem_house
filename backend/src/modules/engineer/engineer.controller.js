/**
 * Planova - Engineer Controller
 *
 * Request handlers for engineer endpoints.
 */

const engineerService = require('./engineer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get authenticated user ID safely.
 *
 * Different authentication middleware implementations may expose
 * the authenticated user as:
 *
 * req.userId
 * req.user.id
 * req.user._id
 *
 * This helper keeps the controller compatible with all of them.
 */
const getAuthenticatedUserId = (req) => {
  const userId =
    req.userId ||
    req.user?.id ||
    req.user?._id ||
    req.auth?.userId ||
    req.auth?.id;

  return userId;
};

/**
 * Ensure an authenticated user ID exists.
 */
const requireAuthenticatedUserId = (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    ApiResponse.unauthorized(
      res,
      'Authentication required'
    );

    return null;
  }

  return userId;
};

/**
 * Get all engineers.
 *
 * GET /engineers
 */
const getEngineers = asyncHandler(async (req, res) => {
  const page = Math.max(
    1,
    Number.parseInt(req.query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number.parseInt(req.query.limit, 10) || 20
    )
  );

  const minRating =
    req.query.minRating !== undefined &&
    req.query.minRating !== ''
      ? Number(req.query.minRating)
      : undefined;

  const minExperience =
    req.query.minExperience !== undefined &&
    req.query.minExperience !== ''
      ? Number(req.query.minExperience)
      : undefined;

  const result = await engineerService.getEngineers(
    {
      city: req.query.city,
      style: req.query.style,
      minRating: Number.isFinite(minRating)
        ? minRating
        : undefined,
      minExperience: Number.isFinite(minExperience)
        ? minExperience
        : undefined,
      lat: req.query.lat,
      lng: req.query.lng,
      radiusKm: req.query.radiusKm,
    },
    {
      page,
      limit,
      sortBy: req.query.sortBy || 'rating',
      sortOrder: req.query.sortOrder || 'desc',
    }
  );

  return ApiResponse.ok(
    res,
    'Engineers retrieved successfully',
    result
  );
});

/**
 * Get engineer by ID.
 *
 * GET /engineers/:id
 */
const getEngineerById = asyncHandler(async (req, res) => {
  const engineer =
    await engineerService.getEngineerById(
      req.params.id
    );

  return ApiResponse.ok(
    res,
    'Engineer retrieved successfully',
    engineer
  );
});

/**
 * Get featured engineers.
 *
 * GET /engineers/featured
 */
const getFeaturedEngineers = asyncHandler(
  async (req, res) => {
    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(req.query.limit, 10) || 10
      )
    );

    const engineers =
      await engineerService.getFeaturedEngineers(
        limit
      );

    return ApiResponse.ok(
      res,
      'Featured engineers retrieved successfully',
      engineers
    );
  }
);

/**
 * Get engineer designs.
 *
 * GET /engineers/:id/designs
 */
const getEngineerDesigns = asyncHandler(
  async (req, res) => {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(req.query.limit, 10) || 20
      )
    );

    const result =
      await engineerService.getEngineerDesigns(
        req.params.id,
        {
          page,
          limit,
          status:
            req.query.status || 'approved',
        }
      );

    return ApiResponse.ok(
      res,
      'Engineer designs retrieved successfully',
      result
    );
  }
);

/**
 * Get engineer reviews.
 *
 * GET /engineers/:id/reviews
 */
const getEngineerReviews = asyncHandler(
  async (req, res) => {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(req.query.limit, 10) || 20
      )
    );

    const result =
      await engineerService.getEngineerReviews(
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
  }
);

/**
 * Update authenticated engineer profile.
 *
 * PUT /engineers/me/profile
 */
const updateEngineerProfile = asyncHandler(
  async (req, res) => {
    const userId =
      requireAuthenticatedUserId(req, res);

    if (!userId) return;

    const engineer =
      await engineerService.updateProfile(
        userId,
        req.body || {}
      );

    return ApiResponse.ok(
      res,
      'Profile updated successfully',
      engineer
    );
  }
);

const getEngineerProfile = asyncHandler(async (req, res) => {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) return;

  const profile = await engineerService.getEngineerProfile(userId);

  return ApiResponse.ok(res, 'Engineer profile retrieved successfully', profile);
});

/**
 * Update authenticated engineer availability.
 *
 * PUT /engineers/me/availability
 */
const updateAvailability = asyncHandler(
  async (req, res) => {
    const userId =
      requireAuthenticatedUserId(req, res);

    if (!userId) return;

    const availability =
      req.body?.availability;

    const engineer =
      await engineerService.updateAvailability(
        userId,
        availability
      );

    return ApiResponse.ok(
      res,
      'Availability updated successfully',
      engineer
    );
  }
);

/**
 * Add portfolio item.
 *
 * POST /engineers/me/portfolio
 */
const addPortfolioItem = asyncHandler(
  async (req, res) => {
    const userId =
      requireAuthenticatedUserId(req, res);

    if (!userId) return;

    const portfolioItem =
      await engineerService.addPortfolioItem(
        userId,
        req.body || {}
      );

    return ApiResponse.created(
      res,
      'Portfolio item added successfully',
      portfolioItem
    );
  }
);

/**
 * Remove portfolio item.
 *
 * DELETE /engineers/me/portfolio/:portfolioId
 */
const removePortfolioItem = asyncHandler(
  async (req, res) => {
    const userId =
      requireAuthenticatedUserId(req, res);

    if (!userId) return;

    const engineer =
      await engineerService.removePortfolioItem(
        userId,
        req.params.portfolioId
      );

    return ApiResponse.ok(
      res,
      'Portfolio item removed successfully',
      engineer
    );
  }
);

/**
 * Get authenticated engineer dashboard.
 *
 * GET /engineers/me/dashboard
 *
 * IMPORTANT:
 * Authentication and role authorization should be
 * handled by route middleware.
 */
const getEngineerDashboard = asyncHandler(
  async (req, res) => {
    const userId =
      requireAuthenticatedUserId(req, res);

    if (!userId) return;

    const dashboard =
      await engineerService.getEngineerDashboard(
        userId
      );

    return ApiResponse.ok(
      res,
      'Engineer dashboard retrieved successfully',
      dashboard
    );
  }
);

/**
 * Submit engineer verification.
 *
 * POST /engineers/me/verification
 */
const submitVerification = asyncHandler(
  async (req, res) => {
    const userId =
      requireAuthenticatedUserId(req, res);

    if (!userId) return;

    const result =
      await engineerService.submitVerification(
        userId,
        req.body || {}
      );

    return ApiResponse.ok(
      res,
      'Verification application submitted successfully',
      result
    );
  }
);

/**
 * Get authenticated engineer verification status.
 *
 * GET /engineers/me/verification
 */
const getVerificationStatus = asyncHandler(
  async (req, res) => {
    const userId =
      requireAuthenticatedUserId(req, res);

    if (!userId) return;

    const result =
      await engineerService.getVerificationStatus(
        userId
      );

    return ApiResponse.ok(
      res,
      'Verification status retrieved successfully',
      result
    );
  }
);

/**
 * Get engineer statistics.
 *
 * GET /engineers/:id/stats
 */
const getEngineerStats = asyncHandler(
  async (req, res) => {
    const stats =
      await engineerService.getEngineerStats(
        req.params.id
      );

    return ApiResponse.ok(
      res,
      'Engineer statistics retrieved successfully',
      stats
    );
  }
);

/**
 * Search engineers.
 *
 * GET /engineers/search?q=architect
 */
const searchEngineers = asyncHandler(
  async (req, res) => {
    const q = String(
      req.query.q || ''
    ).trim();

    if (q.length < 2) {
      return ApiResponse.badRequest(
        res,
        'Search query must be at least 2 characters'
      );
    }

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(req.query.limit, 10) || 20
      )
    );

    const result =
      await engineerService.searchEngineers(
        q,
        {
          page,
          limit,
        }
      );

    return ApiResponse.ok(
      res,
      'Search results retrieved successfully',
      result
    );
  }
);

module.exports = {
  getEngineers,
  getEngineerById,
  getFeaturedEngineers,
  getEngineerDesigns,
  getEngineerReviews,
  updateEngineerProfile,
  getEngineerProfile,
  updateAvailability,
  addPortfolioItem,
  removePortfolioItem,
  getEngineerDashboard,
  submitVerification,
  getVerificationStatus,
  getEngineerStats,
  searchEngineers,
};