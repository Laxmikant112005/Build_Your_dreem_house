// Auth module validator skeleton
// Use Joi or celebrate to define request validation schemas for auth routes.

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

  otpSend: Joi.object({
    credential: Joi.alternatives().try(
      Joi.string().email(),
      Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    ).required().label('Email or Phone'),
  }),

  otpLogin: Joi.object({
    credential: Joi.alternatives().try(
      Joi.string().email(),
      Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    ).required().label('Email or Phone'),
    otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().trim().required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};
