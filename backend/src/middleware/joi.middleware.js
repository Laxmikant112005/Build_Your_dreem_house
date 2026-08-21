const ApiError = require('../utils/ApiError');

/**
 * Validate whether a request source is supported.
 */
const VALID_SOURCES = new Set([
  'body',
  'query',
  'params',
  'headers',
]);

/**
 * Validate request data using a Joi schema.
 *
 * @param {Object} schema - Joi validation schema
 * @param {String} source - Request property to validate
 * @param {Number} statusCode - HTTP status code for validation failure
 *
 * Example:
 *
 * router.post(
 *   '/register',
 *   validateJoi(registerSchema, 'body'),
 *   controller.register
 * );
 */
const validateJoi = (
  schema,
  source = 'body',
  statusCode = 422
) => {
  return (req, res, next) => {
    try {
      // No schema means no validation.
      if (!schema) {
        return next();
      }

      // Make sure the requested source is valid.
      if (!VALID_SOURCES.has(source)) {
        return next(
          new ApiError(
            500,
            `Invalid Joi validation source: ${source}`
          )
        );
      }

      // Make sure a Joi-compatible schema was supplied.
      if (typeof schema.validate !== 'function') {
        return next(
          new ApiError(
            500,
            'Invalid Joi validation schema'
          )
        );
      }

      // Get request data.
      const value = req[source] || {};

      // Validate request data.
      const result = schema.validate(value, {
        abortEarly: false,
        allowUnknown: true,
        convert: true,
      });

      // Validation failed.
      if (result.error) {
        const details = result.error.details.map((detail) => ({
          field: Array.isArray(detail.path)
            ? detail.path.join('.')
            : String(detail.path || ''),
          message: detail.message,
          type: detail.type,
        }));

        return next(
          new ApiError(
            statusCode,
            'Validation failed',
            details
          )
        );
      }

      // Attach validated/converted data.
      req[source] = result.value;

      return next();
    } catch (error) {
      return next(
        new ApiError(
          500,
          'Request validation failed'
        )
      );
    }
  };
};

module.exports = {
  validateJoi,
};