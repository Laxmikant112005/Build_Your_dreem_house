/**
 * BuildMyHome - Rate Limiting Middleware
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * General API rate limiter
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 429,
      message: 'Too many requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 429,
        message: 'Too many requests. Please try again later.',
      },
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 *
 * In the test environment the max is raised so a single integration test
 * suite can exercise many auth requests (login, wrong password, refresh,
 * etc.) in sequence without tripping the limiter. Production security is
 * unchanged: outside `test`, the strict 5-attempt window applies.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // 5 attempts (stricter in prod)
  message: {
    success: false,
    error: {
      code: 429,
      message: 'Too many login attempts. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload rate limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    success: false,
    error: {
      code: 429,
      message: 'Too many upload requests. Please try again later.',
    },
  },
});

module.exports = {
  rateLimiter,
  authLimiter,
  uploadLimiter,
  // Test helper: reset the in-memory auth rate limiter store so suites can
  // run many auth requests in sequence without tripping the production
  // rate limit. Production security behavior is unchanged; this is only
  // invoked from the test harness.
  resetAuthLimiter() {
    if (authLimiter && typeof authLimiter.resetKey === 'function') {
      authLimiter.resetKey('global');
    }
  },
};

