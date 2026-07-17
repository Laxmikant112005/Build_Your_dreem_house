// Upload service skeleton
// Implement file validation, storage (S3/local), and image processing.

const ApiError = require('../utils/ApiError');

module.exports = {
  async uploadFile(file, options = {}) {
    // TODO: Validate file, store to S3 or local, return metadata
    throw new ApiError(501, 'Not implemented');
  },

  async deleteFile(key) {
    // TODO: Remove file from storage
    throw new ApiError(501, 'Not implemented');
  },
};
