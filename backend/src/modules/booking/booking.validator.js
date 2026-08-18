/**
 * Planova - Booking Validator
 * NOTE: `userId` is NOT validated here because it comes from
 * `req.userId` (JWT auth middleware). Do not add userId to this schema.
 */
const Joi = require('joi');

module.exports = {
  createBooking: Joi.object({
    engineerId: Joi.string().required().messages({
      'string.empty': 'Engineer ID is required',
      'any.required': 'Engineer ID is required',
    }),
    designId: Joi.string().optional().allow(null, ''),
    blueprintId: Joi.string().optional().allow(null, ''),
    startAt: Joi.date().iso().required().messages({
      'date.format': 'Start time must be a valid ISO date',
      'any.required': 'Start time is required',
    }),
    endAt: Joi.date().iso().required().messages({
      'date.format': 'End time must be a valid ISO date',
      'any.required': 'End time is required',
    }),
    type: Joi.string().valid('consultation', 'design', 'construction', 'renovation').default('consultation'),
    meetingType: Joi.string().valid('video', 'in-person', 'phone').default('video'),
    meetingLink: Joi.string().uri().optional().allow(null, ''),
    notes: Joi.string().allow('', null).max(2000),
    projectDetails: Joi.object({
      landSize: Joi.number().min(0),
      budget: Joi.number().min(0),
      requirements: Joi.string().max(2000),
      timeline: Joi.string().max(500),
    }).optional(),
  }),

  cancelBooking: Joi.object({
    reason: Joi.string().allow('', null).max(500),
  }),
};
