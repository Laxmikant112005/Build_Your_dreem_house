// Admin module validator skeleton
const Joi = require('joi');

module.exports = {
  moderateAction: Joi.object({
    targetId: Joi.string().required(),
    action: Joi.string().valid('approve','reject','flag').required(),
    reason: Joi.string().allow('', null),
  }),
};
