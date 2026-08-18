/**
 * BuildMyHome - Global Search Controller
 */

const searchService = require('./search.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Global search across all entities
 */
const globalSearch = asyncHandler(async (req, res) => {
  const { q, page, limit, types, sortBy, sortOrder } = req.query;

  if (!q || q.trim().length < 2) {
    return ApiResponse.ok(res, 'Search results', {
      results: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      suggestions: [],
      query: q || '',
    });
  }

  const result = await searchService.search(req.userId, q, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    types: types ? types.split(',') : [],
    sortBy: sortBy || 'relevance',
    sortOrder: sortOrder || 'desc',
  });

  ApiResponse.ok(res, 'Search results retrieved successfully', result);
});

/**
 * Get search suggestions (top matches)
 */
const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return ApiResponse.ok(res, 'Suggestions', []);
  }

  const result = await searchService.search(req.userId, q, { limit: 5 });
  ApiResponse.ok(res, 'Suggestions retrieved', result.suggestions || []);
});

module.exports = {
  globalSearch,
  getSuggestions,
};

