/**
 * Planova - Appointment Validator
 * Joi validation schemas for appointment endpoints
 * NOTE: `clientId` comes from JWT (req.userId), NOT from request body
 */

const Joi = require('joi');

module.exports = {
  createAppointment: Joi.object({
    engineerId: Joi.string().required().messages({
      'any.required': 'Engineer ID is required',
    }),
    blueprintId: Joi.string().optional().allow(null, ''),
    plotId: Joi.string().optional().allow(null, ''),
    type: Joi.string().valid(
      'discovery_call', 'site_audit', 'design_review',
      'consultation', 'estimation', 'construction_meeting', 'final_walkthrough'
    ).default('consultation'),
    startAt: Joi.date().iso().required().messages({
      'date.format': 'Start time must be a valid ISO date',
      'any.required': 'Start time is required',
    }),
    endAt: Joi.date().iso().optional(),
    duration: Joi.number().min(15).max(480).optional(),
    mode: Joi.string().valid('video', 'in_person', 'phone').default('video'),
    meetingLink: Joi.string().uri().optional().allow(null, ''),
    location: Joi.object({
      address: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      coordinates: Joi.object({
        lat: Joi.number(),
        lng: Joi.number(),
      }),
      notes: Joi.string().allow('', null).max(500),
    }).optional(),
    notes: Joi.object({
      clientNotes: Joi.string().allow('', null).max(2000),
    }).optional(),
  }),

  rescheduleAppointment: Joi.object({
    startAt: Joi.date().iso().required(),
    endAt: Joi.date().iso().optional(),
    reason: Joi.string().allow('', null).max(500),
  }),

  cancelAppointment: Joi.object({
    reason: Joi.string().allow('', null).max(500),
  }),

  addFeedback: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000).allow('', null),
  }),
};

