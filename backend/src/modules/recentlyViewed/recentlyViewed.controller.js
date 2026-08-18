/**
 * Planova - Recently Viewed Controller
 */

const RecentlyViewed = require('./recentlyViewed.model');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getRecentlyViewed = asyncHandler(async (req, res) => {
  const { type, limit } = req.query;
  const items = await RecentlyViewed.getRecent(req.userId, type, parseInt(limit) || 20);
  ApiResponse.ok(res, 'Recently viewed retrieved', items);
});

const trackView = asyncHandler(async (req, res) => {
  const { itemType, itemId, title, thumbnail, context } = req.body;
  await RecentlyViewed.track(req.userId, itemType, itemId, { title, thumbnail, context });
  ApiResponse.ok(res, 'View tracked');
});

module.exports = { getRecentlyViewed, trackView };

