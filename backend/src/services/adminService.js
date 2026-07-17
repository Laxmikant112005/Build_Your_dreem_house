// Admin service skeleton
// Implement admin operations: reports, user management, moderation tools.

const ApiError = require('../utils/ApiError');

module.exports = {
  async listUsers(filter) {
    // TODO: Return paginated user list with filters
    throw new ApiError(501, 'Not implemented');
  },

  async moderateDesign(designId, action) {
    // TODO: Approve/reject designs
    throw new ApiError(501, 'Not implemented');
  },
};
