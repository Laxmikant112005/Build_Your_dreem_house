const {
  validationResult,
} = require('express-validator');

const ApiError = require('../utils/ApiError');
const {
  validateJoi,
} = require('./joi.middleware');


const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field:
        error.path ||
        error.param ||
        'unknown',
      message:
        error.msg ||
        error.message ||
        'Invalid value',
      type:
        error.type ||
        'validation',
    }));
    const hasRequiredError =
      formattedErrors.some((detail) => {
        const message =
          String(detail.message).toLowerCase();

        return (
          message.includes('required') ||
          message.includes('must not be empty') ||
          message.includes('is required')
        );
      });

    const statusCode =
      hasRequiredError ? 400 : 422;

    return next(
      new ApiError(
        statusCode,
        'Validation failed',
        formattedErrors
      )
    );
  }

  return next();
};


const validateRequest = (validators = []) => {
  const list = Array.isArray(validators)
    ? validators
    : validators
      ? [validators]
      : [];

  return [
    ...list.filter(
      (middleware) =>
        typeof middleware === 'function'
    ),
    validate,
  ];
};

const validateJoiRequest = (
  schema,
  source = 'body',
  statusCode = 422
) => {
  // No schema supplied.
  if (!schema) {
    return (req, res, next) => next();
  }

  // Joi schema.
  if (
    typeof schema.validate === 'function'
  ) {
    return validateJoi(
      schema,
      source,
      statusCode
    );
  }

  
  if (typeof schema === 'function') {
    return schema;
  }
  return (req, res, next) => {
    next(
      new ApiError(
        500,
        'Invalid validation middleware configuration'
      )
    );
  };
};

module.exports = {
  validate,
  validateRequest,
  validateJoiRequest,
};