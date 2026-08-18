/**
 * Planova - Follow Controller
 */

const Follow = require('./follow.model');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const toggleFollow = asyncHandler(async (req, res) => {
  const result = await Follow.toggle(req.userId, req.params.engineerId);
  ApiResponse.ok(res, result.following ? 'Following engineer' : 'Unfollowed engineer', result);
});

const getFollowing = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ userId: req.userId })
    .populate('engineerId', 'firstName lastName avatar engineerProfile.title engineerProfile.rating engineerProfile.specializations');
  ApiResponse.ok(res, 'Following list retrieved', follows);
});

const checkFollow = asyncHandler(async (req, res) => {
  const following = await Follow.isFollowing(req.userId, req.params.engineerId);
  ApiResponse.ok(res, 'Follow status', { following });
});

module.exports = { toggleFollow, getFollowing, checkFollow };

