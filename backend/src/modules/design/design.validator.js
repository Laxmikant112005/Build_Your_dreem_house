// Design module validator skeleton
const Joi = require('joi');

module.exports = {
  createDesign: Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().allow('', null),
    category: Joi.string().required(),
    price: Joi.number().min(0).optional(),
  }),

  search: Joi.object({
    q: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  }),
};
