const Joi = require('joi');

module.exports = {
  createBudget: Joi.object({
    projectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    estimatedTotal: Joi.number().min(0).required(),
    contingencyPercent: Joi.number().min(0).max(50).default(10),
    currency: Joi.string().default('INR'),
    categories: Joi.array().items(Joi.object({
      name: Joi.string().valid('labour', 'material', 'equipment', 'permits', 'design', 'consultation', 'utilities', 'furnishing', 'landscaping', 'miscellaneous').required(),
      label: Joi.string().allow(''),
      estimated: Joi.number().min(0).default(0),
    })),
    notes: Joi.string().max(1000).allow(''),
  }),

  updateBudget: Joi.object({
    estimatedTotal: Joi.number().min(0),
    contingencyPercent: Joi.number().min(0).max(50),
    notes: Joi.string().max(1000).allow(''),
    categories: Joi.array().items(Joi.object({
      name: Joi.string().valid('labour', 'material', 'equipment', 'permits', 'design', 'consultation', 'utilities', 'furnishing', 'landscaping', 'miscellaneous').required(),
      estimated: Joi.number().min(0),
      actual: Joi.number().min(0),
    })),
  }),

  addExpense: Joi.object({
    category: Joi.string().valid('labour', 'material', 'equipment', 'permits', 'design', 'consultation', 'utilities', 'furnishing', 'landscaping', 'miscellaneous').required(),
    description: Joi.string().max(500).required(),
    amount: Joi.number().min(0).required(),
    vendor: Joi.string().max(100).allow(''),
    date: Joi.date(),
    receipt: Joi.string().allow(''),
    notes: Joi.string().max(500).allow(''),
  }),
};

