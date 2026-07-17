// Review service skeleton
// Implement creation and aggregation of reviews and ratings.

const ApiError = require('../utils/ApiError');

module.exports = {
  async addReview(reviewDto) {
    // TODO: Save review and update aggregates
    throw new ApiError(501, 'Not implemented');
  },

  async listReviews(targetId, options) {
    // TODO: Paginate and return reviews for a design/engineer
    throw new ApiError(501, 'Not implemented');
  },
};
