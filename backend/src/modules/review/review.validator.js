// Review module validator skeleton
const Joi = require('joi');

module.exports = {
  addReview: Joi.object({
    targetId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow('', null),
  }),
};
