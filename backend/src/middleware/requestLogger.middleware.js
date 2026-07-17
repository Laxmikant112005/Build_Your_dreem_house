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

  // Log request details for debugging 500 errors
  console.log("=== REQUEST DEBUG ===");
  console.log("METHOD:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("PARAMS:", req.params);
  console.log("QUERY:", req.query);
  console.log("BODY:", req.body);
  console.log("=====================");

  // Log request
  logger.info(`→ ${req.method} ${req.originalUrl}`);

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    const responseTime = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';

    if (res.statusCode >= 500) {
      console.log("=== 500 ERROR RESPONSE ===");
      console.log("RESPONSE DATA:", data);
      console.log("==========================");
    }

    logger.info(
      `${statusColor} ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${responseTime}ms`
    );

    return res.send(data);
  };

  next();
};


module.exports = requestLogger;

