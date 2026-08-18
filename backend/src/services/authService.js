// Authentication service skeleton
// Implement registration, login, token issuance, refresh, logout, and OTP flows here.

const ApiError = require('../utils/ApiError');

module.exports = {
  async register(userDto) {
    // TODO: Create user, hash password, send verification/OTP if required.
    throw new ApiError(501, 'Not implemented');
  },

  async login(credentials) {
    // TODO: Validate credentials and return { accessToken, refreshToken, user }
    throw new ApiError(501, 'Not implemented');
  },

  async refreshToken(token) {
    // TODO: Validate refresh token and issue new access token
    throw new ApiError(501, 'Not implemented');
  },

  async logout(userId) {
    // TODO: Invalidate refresh token / clear sessions
    throw new ApiError(501, 'Not implemented');
  },
};
