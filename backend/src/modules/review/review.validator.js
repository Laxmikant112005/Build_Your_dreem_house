// Review module validator
// The controller (`createReview`) and service (`createReview`) both read
// `engineerId` from the request body, and the Review model stores
// `engineerId`. The validator must therefore accept `engineerId`, not the
// legacy `targetId` field. This keeps the API contract consistent across
// validator -> controller -> service -> model.
const Joi = require('joi');

module.exports = {
  addReview: Joi.object({
    engineerId: Joi.string().required().messages({
      'string.empty': 'Engineer ID is required',
      'any.required': 'Engineer ID is required',
    }),
    bookingId: Joi.string().allow('', null).optional(),
    designId: Joi.string().allow('', null).optional(),
    rating: Joi.number().min(1).max(5).required(),
    title: Joi.string().allow('', null).max(100).optional(),
    comment: Joi.string().allow('', null).max(1000),
    images: Joi.array().items(Joi.string()).optional(),
    pros: Joi.array().items(Joi.string().max(50)).optional(),
    cons: Joi.array().items(Joi.string().max(50)).optional(),
  }),

  respondToReview: Joi.object({
    message: Joi.string().required().max(1000).messages({
      'string.empty': 'Response message is required',
      'any.required': 'Response message is required',
    }),
  }),
};
