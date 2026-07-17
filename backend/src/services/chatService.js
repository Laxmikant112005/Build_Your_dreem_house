// Chat service skeleton
// Implement message persistence, recent conversations and room management.

const ApiError = require('../utils/ApiError');

module.exports = {
  async saveMessage(messageDto) {
    // TODO: Persist messages and return saved entity
    throw new ApiError(501, 'Not implemented');
  },

  async getConversation(conversationId, options) {
    // TODO: Return paginated messages
    throw new ApiError(501, 'Not implemented');
  },
};
