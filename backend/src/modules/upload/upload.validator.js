// Upload module validator skeleton
const Joi = require('joi');

module.exports = {
  fileUpload: Joi.object({
    // The actual file is validated in middleware (multer). Use this for additional fields.
    title: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
  }),
};
