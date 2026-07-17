/**
 * BuildMyHome - Cart Validators
 */

const Joi = require('joi');

const addItem = Joi.object({
  materialId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
});

const updateItem = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

module.exports = {
  addItem,
  updateItem,
};

