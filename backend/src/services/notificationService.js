// Notification service skeleton
// Implement in-app notifications and email/push sending.

const ApiError = require('../utils/ApiError');

module.exports = {
  async sendInApp(userId, payload) {
    // TODO: Persist notification and emit via sockets
    throw new ApiError(501, 'Not implemented');
  },

  async sendEmail(to, subject, templateVars) {
    // TODO: Use email config/nodemailer to send transactional emails
    throw new ApiError(501, 'Not implemented');
  },
};
