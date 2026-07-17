// User module validator skeleton
const Joi = require('joi');

module.exports = {
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string(),
    address: Joi.string().allow('', null),
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};
