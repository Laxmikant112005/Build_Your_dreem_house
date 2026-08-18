const Joi = require('joi');

module.exports = {
  createField: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500),
    geoJSON: Joi.object({
      type: Joi.string().valid('Polygon', 'MultiPolygon').required(),
coordinates: Joi.array().items(Joi.array().items(Joi.number())).required(),
    }).required(),
    dimensions: Joi.object({
      width: Joi.number().min(0),
      length: Joi.number().min(0),
      area: Joi.number().min(0).required(),
      unit: Joi.string().valid('sqft', 'sqm').default('sqft'),
    }).required(),
    address: Joi.object({
      full: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      postalCode: Joi.string(),
      location: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().length(2).items(Joi.number()),
      }),
    }),
  }),

  fieldId: Joi.object({
    id: Joi.string().length(24).required(),
  }),
};

