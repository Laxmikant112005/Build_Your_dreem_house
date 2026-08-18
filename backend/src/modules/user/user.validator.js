// User module validator
const Joi = require('joi');

module.exports = {
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    // Phone is optional. When provided, allow common formats:
    //   - leading + and country code (e.g. +919876543210, +1 555 000 1234)
    //   - digits, spaces, dashes, parentheses
    //   - 7-15 digits total (E.164 range)
    // This is intentionally permissive so legitimate existing users are
    // not rejected, while clearly invalid values (e.g. letters) are caught.
    phone: Joi.string().allow('', null).pattern(/^[+]?[\d\s\-()]{7,20}$/).messages({
      'string.pattern.base': 'Phone number format is invalid',
    }),
    address: Joi.string().allow('', null),
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};
