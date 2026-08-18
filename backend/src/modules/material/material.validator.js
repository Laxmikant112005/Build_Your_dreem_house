/**
 * BuildMyHome - Material Validators
 * Joi validation schemas for material endpoints
 */

const Joi = require('joi');

const createMaterial = Joi.object({
  name: Joi.string().max(200).required(),
  description: Joi.string().max(1000).required(),
  category: Joi.string().valid(...Object.values(require('../../constants/enums').MATERIAL_CATEGORIES)).required(),
  price: Joi.number().min(0).required(),
  priceUnit: Joi.string().valid('per_unit', 'per_kg', 'per_sqm', 'per_liter').default('per_unit'),
  stockQuantity: Joi.number().min(0).default(0),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string(),
    isPrimary: Joi.boolean(),
  })),
  specifications: Joi.object({
    brand: Joi.string(),
    model: Joi.string(),
    dimensions: Joi.string(),
    weight: Joi.string(),
    coverage: Joi.string(),
    color: Joi.string(),
    materialType: Joi.string(),
  }),
  supplier: Joi.object({
    name: Joi.string().required(),
    contact: Joi.string(),
    rating: Joi.number().min(0).max(5),
  }),
  delivery: Joi.object({
    freeThreshold: Joi.number().min(0),
    estimatedDays: Joi.number().min(1).max(30),
    areas: Joi.array().items(Joi.string()),
  }),
  tags: Joi.array().items(Joi.string()),
});

const updateMaterial = Joi.object({
  name: Joi.string().max(200),
  description: Joi.string().max(1000),
  category: Joi.string().valid(...Object.values(require('../../constants/enums').MATERIAL_CATEGORIES)),
  price: Joi.number().min(0),
  stockQuantity: Joi.number().min(0),
  // ... other fields optional
}).min(1); // At least one field required

module.exports = {
  createMaterial,
  updateMaterial,
};

