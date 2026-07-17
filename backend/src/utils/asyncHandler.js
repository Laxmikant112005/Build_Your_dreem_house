/**
 * BuildMyHome - Async Handler Utility
 * Wrapper for async route handlers to catch errors
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    try {
      // If service not implemented (501), return lightweight placeholder response
      const statusCode = err && (err.statusCode || err.status || (err.status && err.status.code));
      if (statusCode === 501) {
        const modulePath = req.baseUrl || req.originalUrl || 'Module';
        // derive a short module name from baseUrl like '/api/v1/auth' -> 'auth'
        const parts = String(modulePath).split('/').filter(Boolean);
        const moduleName = parts.length ? parts[parts.length - 1] : 'Module';
        const action = req.method || 'ACTION';
        const message = `${moduleName} ${action} placeholder`;
        return res.status(200).json({ success: true, message, data: null });
      }
    } catch (e) {
      // fallthrough to next
    }

    next(err);
  });
};

module.exports = asyncHandler;

