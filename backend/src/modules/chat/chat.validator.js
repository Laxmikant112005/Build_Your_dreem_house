// Chat module validator skeleton
const Joi = require('joi');

module.exports = {
  sendMessage: Joi.object({
    conversationId: Joi.string().optional(),
    from: Joi.string().required(),
    to: Joi.string().required(),
    text: Joi.string().allow('', null),
  }),
};
