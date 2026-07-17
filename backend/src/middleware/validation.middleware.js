/**
 * BuildMyHome - Validation Middleware
 * Request validation using express-validator
*/

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validation middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      type: err.type,
    }));
    const statusCode = formattedErrors.some((detail) => detail.message?.toLowerCase().includes('required') || detail.message?.toLowerCase().includes('must not be empty')) ? 400 : 422;
    return next(new ApiError(statusCode, 'Validation failed', formattedErrors));
  }
  next();
};

const validateRequest = (validators = []) => {
  const list = Array.isArray(validators) ? validators : (validators ? [validators] : []);
  return [...list, validate];
};


const { validateJoi } = require('./joi.middleware');

// Backwards compatible: if a Joi schema is passed, validate it.
// If an array of express-validator middlewares is passed, just use validateRequest.
const validateJoiRequest = (schema, source = 'body') => {
  // If an express-validator style middleware array/object is passed, ignore.
  if (!schema) return (req, res, next) => next();

  // Joi schema has .validate
  if (typeof schema.validate === 'function') return validateJoi(schema, source);

  // If somebody accidentally passes Joi via validateRequest or vice versa,
  // fall back safely.
  if (typeof schema === 'function') return schema;

  return (req, res, next) => next();
};




module.exports = { validate, validateRequest, validateJoiRequest };

