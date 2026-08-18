const Joi = require('joi');

module.exports = {
  register: Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().trim().allow('').optional(),
    role: Joi.string().valid('user', 'engineer').default('user'),
  }).unknown(false),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().trim().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().trim().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().trim().required(),
    password: Joi.string().min(6).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};
