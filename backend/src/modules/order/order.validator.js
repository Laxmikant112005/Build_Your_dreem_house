/**
 * BuildMyHome - Order Validators
 */

const Joi = require('joi');

const checkout = Joi.object({
  delivery: Joi.object({
    address: Joi.object({
      full: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      coordinates: Joi.array().length(2).items(Joi.number()),
    }).required(),
  }).required(),
  payment: Joi.object({
    gateway: Joi.string().valid('razorpay', 'stripe').default('razorpay'),
    method: Joi.string(),
  }).required(),
}).required();

const cancelOrder = Joi.object({
  reason: Joi.string().max(500).required(),
});

module.exports = {
  checkout,
  cancelOrder,
};

