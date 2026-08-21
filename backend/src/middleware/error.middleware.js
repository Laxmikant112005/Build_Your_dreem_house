/**
 * Planova - Global Error Handling Middleware
 */

const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Express Validator error formatter
 */
const formatExpressValidatorErrors = (errors = []) => {
  return errors.map((error) => ({
    field: error.path || error.param || error.location || 'unknown',
    message: error.msg || error.message || 'Invalid value',
  }));
};

/**
 * Handle Mongoose validation errors
 */
const handleMongooseValidationError = (error) => {
  const errors = Object.values(error.errors || {}).map((err) => ({
    field: err.path,
    message: err.message,
  }));

  return new ApiError(
    400,
    'Validation Error',
    errors
  );
};

/**
 * Handle Mongoose duplicate key errors.
 *
 * Example:
 * email already exists.
 */
const handleMongooseDuplicateKeyError = (error) => {
  const keyValue = error.keyValue || {};
  const field = Object.keys(keyValue)[0] || 'field';

  const formattedField =
    field.charAt(0).toUpperCase() + field.slice(1);

  const message =
    `${formattedField} is already registered. ` +
    `Please log in or use a different ${field}.`;

  return new ApiError(
    409,
    message,
    [],
    '',
    field
  );
};

/**
 * Handle Mongoose cast errors.
 *
 * Usually caused by an invalid MongoDB ObjectId.
 */
const handleMongooseCastError = (error) => {
  return new ApiError(
    400,
    `Invalid ${error.path || 'ID'} format`
  );
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new ApiError(
    401,
    'Invalid token. Please login again.'
  );
};

/**
 * Handle expired JWT errors
 */
const handleJWTExpiredError = () => {
  return new ApiError(
    401,
    'Token expired. Please login again.'
  );
};

/**
 * Determine whether an HTTP status is valid.
 */
const isValidStatusCode = (statusCode) => {
  return (
    Number.isInteger(statusCode) &&
    statusCode >= 400 &&
    statusCode <= 599
  );
};

/**
 * Not found handler - 404
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(
    `Route ${req.originalUrl} not found`
  );

  next(error);
};

/**
 * Global error handler
 *
 * IMPORTANT:
 * Express recognizes this as an error middleware because
 * it has four parameters: (err, req, res, next).
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // ---------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------

  const logPayload = {
    message: err?.message || 'Unknown error',
    name: err?.name,
    code: err?.code,
    statusCode: err?.statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  };

  // Include stack only outside production.
  if (config.env !== 'production') {
    logPayload.stack = err?.stack;
  }

  logger.error('API Error:', logPayload);

  // ---------------------------------------------------------------
  // Convert known errors into ApiError
  // ---------------------------------------------------------------

  if (err?.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  }

  // MongoDB duplicate key
  else if (err?.code === 11000) {
    error = handleMongooseDuplicateKeyError(err);
  }

  // Invalid MongoDB ObjectId
  else if (err?.name === 'CastError') {
    error = handleMongooseCastError(err);
  }

  // JWT invalid token
  else if (err?.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  // JWT expired
  else if (err?.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // ---------------------------------------------------------------
  // Normalize unknown errors
  // ---------------------------------------------------------------

  if (!(error instanceof ApiError)) {
    const statusCode = isValidStatusCode(err?.statusCode)
      ? err.statusCode
      : 500;

    error = new ApiError(
      statusCode,
      err?.message || 'Internal Server Error',
      [],
      config.env !== 'production' ? err?.stack : undefined
    );
  }

  // ---------------------------------------------------------------
  // Response
  // ---------------------------------------------------------------

  const statusCode = isValidStatusCode(error.statusCode)
    ? error.statusCode
    : 500;

  const response = {
    success: false,
    error: {
      code: statusCode,
      message: error.message,
    },
  };

  // Include conflicting field.
  if (error.field) {
    response.error.field = error.field;
  }

  // Include validation details.
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    response.error.details = error.errors;
  }

  // ---------------------------------------------------------------
  // Production security
  // ---------------------------------------------------------------

  if (
    config.env === 'production' &&
    statusCode >= 500
  ) {
    response.error.message = 'Internal server error';
    delete response.error.details;
    delete response.error.field;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
  formatExpressValidatorErrors,
};