const rateLimit = require('express-rate-limit');
const config = require('../config');

const createRateLimitResponse = (message) => ({
  success: false,
  error: {
    code: 429,
    message,
  },
});


const rateLimiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000,
  max: config.rateLimit?.maxRequests || 100,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    return res.status(429).json(
      createRateLimitResponse(
        'Too many requests. Please try again later.'
      )
    );
  },
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max:
    config.env === 'test' ||
    process.env.NODE_ENV === 'test'
      ? 1000
      : 5,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    return res.status(429).json(
      createRateLimitResponse(
        'Too many login attempts. Please try again in 15 minutes.'
      )
    );
  },
});


const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    return res.status(429).json(
      createRateLimitResponse(
        'Too many upload requests. Please try again later.'
      )
    );
  },
});

const resetAuthLimiter = (key) => {
  if (
    !authLimiter ||
    typeof authLimiter.resetKey !== 'function'
  ) {
    return false;
  }

  if (!key) {
    return false;
  }

  authLimiter.resetKey(key);

  return true;
};

module.exports = {
  rateLimiter,
  authLimiter,
  uploadLimiter,
  resetAuthLimiter,
};