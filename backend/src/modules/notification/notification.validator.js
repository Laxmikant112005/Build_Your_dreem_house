// Notification module validator skeleton
const Joi = require('joi');

module.exports = {
  sendNotification: Joi.object({
    userId: Joi.string().required(),
    title: Joi.string().required(),
    body: Joi.string().required(),
    data: Joi.object().optional(),
  }),
};
