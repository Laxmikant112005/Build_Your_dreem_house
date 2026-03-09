/**
 * BuildMyHome - Request Logger Middleware
 * Logs HTTP method, endpoint, response status, and response time
 */

const logger = require('../utils/logger');

/**
 * Request logging middleware
 * Logs request method, endpoint, response status, and response time
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info(`→ ${req.method} ${req.originalUrl}`);

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    const responseTime = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';

    logger.info(
      `${statusColor} ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${responseTime}ms`
    );

    return res.send(data);
  };

  next();
};

module.exports = requestLogger;

