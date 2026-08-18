/**
 * Planova - Plot Validator
 * Joi validation schemas for plot/land mapping endpoints
 */

const Joi = require('joi');

const geoJSONSchema = Joi.object({
  type: Joi.string().valid('Polygon', 'MultiPolygon').required(),
  coordinates: Joi.array().required(),
}).required();

module.exports = {
  createPlot: Joi.object({
    name: Joi.string().trim().min(1).max(100).required()
      .messages({ 'any.required': 'Plot name is required' }),
    description: Joi.string().max(500).allow('', null),
    geojson: geoJSONSchema.messages({
      'any.required': 'GeoJSON geometry is required',
    }),
    dimensions: Joi.object({
      width: Joi.number().min(0),
      length: Joi.number().min(0),
      perimeter: Joi.number().min(0),
      area: Joi.number().min(0).required(),
      areaUnit: Joi.string().valid('sqft', 'sqm', 'acre', 'hectare', 'gunta', 'cent').default('sqft'),
    }).required(),
    orientation: Joi.string().valid(
      'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'irregular'
    ).optional(),
    address: Joi.object({
      full: Joi.string().max(500).allow('', null),
      street: Joi.string().max(200).allow('', null),
      city: Joi.string().max(100).allow('', null),
      state: Joi.string().max(100).allow('', null),
      country: Joi.string().default('India'),
      postalCode: Joi.string().max(20).allow('', null),
      location: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().length(2).items(Joi.number()),
      }),
    }).optional(),
    terrainType: Joi.string().valid(
      'flat', 'sloped_gentle', 'sloped_steep', 'hilly', 'rocky',
      'coastal', 'floodplain', 'corner', 'trapezoidal', 'irregular'
    ).optional(),
    soilType: Joi.string().valid(
      'alluvial', 'black_cotton', 'laterite', 'sandy', 'clay',
      'loamy', 'rocky', 'red', 'murram', 'filled'
    ).optional(),
    roadAccess: Joi.string().valid('front', 'rear', 'side', 'corner', 'cul_de_sac', 'no_access').optional(),
    roadWidth: Joi.number().min(0).optional(),
    zoning: Joi.string().optional(),
    floorAreaRatio: Joi.number().min(0).optional(),
    setBackFeet: Joi.object({
      front: Joi.number().min(0),
      rear: Joi.number().min(0),
      side: Joi.number().min(0),
    }).optional(),
    utilities: Joi.object({
      waterSupply: Joi.boolean(),
      electricity: Joi.boolean(),
      sewage: Joi.boolean(),
      gasConnection: Joi.boolean(),
      internet: Joi.boolean(),
    }).optional(),
    status: Joi.string().valid('draft', 'active', 'inactive', 'archived', 'deleted').default('active'),
  }),

  updatePlot: Joi.object({
    name: Joi.string().trim().min(1).max(100),
    description: Joi.string().max(500).allow('', null),
    geojson: geoJSONSchema,
    dimensions: Joi.object({
      width: Joi.number().min(0),
      length: Joi.number().min(0),
      perimeter: Joi.number().min(0),
      area: Joi.number().min(0),
      areaUnit: Joi.string().valid('sqft', 'sqm', 'acre', 'hectare', 'gunta', 'cent'),
    }),
    orientation: Joi.string().valid(
      'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'irregular'
    ),
    address: Joi.object({
      full: Joi.string().max(500).allow('', null),
      street: Joi.string().max(200).allow('', null),
      city: Joi.string().max(100).allow('', null),
      state: Joi.string().max(100).allow('', null),
      country: Joi.string(),
      postalCode: Joi.string().max(20).allow('', null),
      location: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().length(2).items(Joi.number()),
      }),
    }),
    terrainType: Joi.string().valid(
      'flat', 'sloped_gentle', 'sloped_steep', 'hilly', 'rocky',
      'coastal', 'floodplain', 'corner', 'trapezoidal', 'irregular'
    ),
    soilType: Joi.string().valid(
      'alluvial', 'black_cotton', 'laterite', 'sandy', 'clay',
      'loamy', 'rocky', 'red', 'murram', 'filled'
    ),
    roadAccess: Joi.string().valid('front', 'rear', 'side', 'corner', 'cul_de_sac', 'no_access'),
    roadWidth: Joi.number().min(0),
    zoning: Joi.string(),
    floorAreaRatio: Joi.number().min(0),
    setBackFeet: Joi.object({
      front: Joi.number().min(0),
      rear: Joi.number().min(0),
      side: Joi.number().min(0),
    }),
    utilities: Joi.object({
      waterSupply: Joi.boolean(),
      electricity: Joi.boolean(),
      sewage: Joi.boolean(),
      gasConnection: Joi.boolean(),
      internet: Joi.boolean(),
    }),
    status: Joi.string().valid('draft', 'active', 'inactive', 'archived', 'deleted'),
  }).min(1).messages({ 'object.min': 'At least one field must be provided for update' }),
};

