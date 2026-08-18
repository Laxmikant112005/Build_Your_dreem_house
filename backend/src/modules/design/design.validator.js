// Design module validator
// The Design model requires `title`, `description`, and `specifications`
// (totalArea, floors, style, constructionType). `category` is an optional
// ObjectId ref in the model, so it must be optional here too.
const Joi = require('joi');

const specificationsSchema = Joi.object({
  totalArea: Joi.number().min(0).required(),
  landWidth: Joi.number().min(0).optional(),
  landLength: Joi.number().min(0).optional(),
  floors: Joi.number().min(1).max(50).required(),
  bedrooms: Joi.number().min(0).optional(),
  bathrooms: Joi.number().min(0).optional(),
  livingRooms: Joi.number().min(0).optional(),
  kitchen: Joi.number().min(0).optional(),
  garage: Joi.number().min(0).optional(),
  style: Joi.string().required(),
  constructionType: Joi.string().required(),
  estimatedCost: Joi.number().min(0).optional(),
  estimatedDuration: Joi.number().min(0).optional(),
}).unknown(true);

module.exports = {
  createDesign: Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().allow('', null).max(5000),
    category: Joi.string().allow('', null).optional(),
    price: Joi.number().min(0).optional(),
    specifications: specificationsSchema.optional(),
    location: Joi.object().unknown(true).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().optional(),
  }).unknown(true),

  search: Joi.object({
    q: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  }),
};
