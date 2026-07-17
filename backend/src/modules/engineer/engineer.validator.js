// Engineer module validator skeleton
const Joi = require('joi');

module.exports = {
  createProfile: Joi.object({
    experienceYears: Joi.number().min(0).required(),
    specialties: Joi.array().items(Joi.string()),
    portfolio: Joi.array().items(Joi.string().uri()),
  }),

  availability: Joi.object({
    date: Joi.date().required(),
    slots: Joi.array().items(Joi.string()),
  }),
};
