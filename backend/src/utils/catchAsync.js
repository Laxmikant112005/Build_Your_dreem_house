/**
 * AntiGravity - Async Error Handler
 * Wrapper for async functions to catch errors and pass them to Express error middleware
 */

const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
