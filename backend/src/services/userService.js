// User service skeleton
// Implement user-related business logic: profile updates, password resets, preferences.

const ApiError = require('../utils/ApiError');

const User = require('../modules/user/user.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

module.exports = {
  async getUserById(id) {
    const user = await User.findById(id).select('-password -refreshToken -otpCode -otpExpires');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  async updateUser(userId, payload) {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (payload[field] !== undefined) {
        updateData[field] = payload[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId, 
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    logger.info(`User ${userId} profile updated`);
    return user;
  },

  async updatePreferences(userId, preferences) {
    const allowedFields = [
      'budgetMin', 'budgetMax', 'landSize', 
      'preferredStyles', 'preferredLocations', 
      'desiredRooms', 'facingDirection'
    ];

    const updateData = { preferences: {} };
    allowedFields.forEach(field => {
      if (preferences[field] !== undefined) {
        updateData.preferences[field] = preferences[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('preferences -_id');

    logger.info(`User ${userId} preferences updated:`, updateData.preferences);
    return user.preferences;
  },

  async resetPassword(email) {
    throw new ApiError(501, 'Password reset handled by auth service');
  },

  // Populate if needed for favorites/bookings
  async getUsers(filters = {}, options = {}) {
    const users = await User.find(filters)
      .select('-password -refreshToken')
      .limit(options.limit || 20)
      .skip((options.page - 1) * options.limit || 0)
      .sort({ createdAt: -1 });
    return users;
  },
};
