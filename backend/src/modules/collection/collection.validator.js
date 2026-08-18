/**
 * Planova - Collection Validator
 */

const Joi = require('joi');

module.exports = {
  createCollection: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    visibility: Joi.string().valid('private', 'public', 'shared').default('private'),
    coverImage: Joi.string().uri().allow('', null),
  }),

  updateCollection: Joi.object({
    name: Joi.string().trim().min(1).max(100),
    description: Joi.string().max(500).allow('', null),
    visibility: Joi.string().valid('private', 'public', 'shared'),
    coverImage: Joi.string().uri().allow('', null),
    sortOrder: Joi.number().integer().min(0),
  }).min(1),

  addItem: Joi.object({
    itemType: Joi.string().valid('blueprints', 'engineers', 'plots', 'materials').required(),
    itemId: Joi.string().required(),
  }),

  removeItem: Joi.object({
    itemType: Joi.string().valid('blueprints', 'engineers', 'plots', 'materials').required(),
    itemId: Joi.string().required(),
  }),

  toggleItem: Joi.object({
    itemType: Joi.string().valid('blueprints', 'engineers', 'plots', 'materials').required(),
    itemId: Joi.string().required(),
  }),
};

