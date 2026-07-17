// Booking module validator skeleton
const Joi = require('joi');

module.exports = {
  createBooking: Joi.object({
    designId: Joi.string().required(),
    engineerId: Joi.string().required(),
    userId: Joi.string().required(),
    startAt: Joi.date().required(),
    endAt: Joi.date().required(),
    notes: Joi.string().allow('', null),
  }),

  cancelBooking: Joi.object({
    reason: Joi.string().allow('', null),
  }),
};
