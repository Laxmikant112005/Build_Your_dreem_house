const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Fields that must never be logged.
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'refreshToken',
  'accessToken',
  'token',
  'authorization',
  'apiKey',
  'secret',
  'clientSecret',
]);

/**
 * Remove sensitive fields from an object before logging.
 */
const sanitizeObject = (value, depth = 0) => {
  // Prevent deeply nested objects from causing excessive work.
  if (depth > 5) {
    return '[Object]';
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitizeObject(item, depth + 1)
    );
  }

  const sanitized = {};

  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    sanitized[key] = sanitizeObject(
      item,
      depth + 1
    );
  }

  return sanitized;
};

/**
 * Generate a request ID.
 */
const generateRequestId = () => {
  return crypto.randomUUID();
};

/**
 * Request logging middleware.
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Reuse an existing request ID if another middleware created one.
  const requestId =
    req.id ||
    req.headers['x-request-id'] ||
    generateRequestId();

  req.id = requestId;

  // Return request ID to client.
  res.setHeader('X-Request-ID', requestId);

  // ---------------------------------------------------------------
  // Request logging
  // ---------------------------------------------------------------

  const requestData = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  };

  // Only include query parameters when present.
  if (
    req.query &&
    Object.keys(req.query).length > 0
  ) {
    requestData.query = sanitizeObject(req.query);
  }

  // Only log request body outside sensitive authentication endpoints.
  //
  // Even then, sensitive fields are redacted.
  if (
    req.body &&
    typeof req.body === 'object' &&
    Object.keys(req.body).length > 0
  ) {
    requestData.body = sanitizeObject(req.body);
  }

  logger.info('HTTP Request', requestData);

  // ---------------------------------------------------------------
  // Response logging
  // ---------------------------------------------------------------

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    const responseData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
    };

    // Different log levels based on HTTP status.
    if (statusCode >= 500) {
      logger.error(
        'HTTP Response',
        responseData
      );
    } else if (statusCode >= 400) {
      logger.warn(
        'HTTP Response',
        responseData
      );
    } else {
      logger.info(
        'HTTP Response',
        responseData
      );
    }
  });

  // ---------------------------------------------------------------
  // Handle aborted requests
  // ---------------------------------------------------------------

  res.on('close', () => {
    if (!res.writableFinished) {
      const responseTime = Date.now() - startTime;

      logger.warn('HTTP Request Aborted', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
      });
    }
  });

  next();
};

module.exports = requestLogger;