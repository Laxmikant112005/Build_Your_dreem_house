// Joi validation middleware
const ApiError = require('../utils/ApiError');

/**
 * validateJoi(schema, source = 'body')
 * Returns express middleware that validates req[source] with the provided Joi schema.
 * If validation fails, calls next(ApiError(422, ...)).
 */
const validateJoi = (schema, source = 'body', statusCode = 422) => {
  return (req, res, next) => {
    if (!schema) return next();

    const value = req[source] || {};
    const { error, value: validated } = schema.validate(value, { abortEarly: false, allowUnknown: true });
    if (error) {
      const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message, type: d.type }));
      return next(new ApiError(statusCode, 'Validation failed', details));
    }

    // attach validated payload for downstream handlers
    req[source] = validated;
    next();
  };
};

module.exports = { validateJoi };
